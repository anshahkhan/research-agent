// index.js
import geminiHandler from "./src/utils/geminiHandler.js";
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { GoogleGenAI } from "@google/genai";
import config from "./config.js";
import { introFlow } from "./src/flow/consent.js";
import { runQuestionnaire } from "./src/flow/questionnare.js";

// === Initialize Gemini ===
const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  // Added browser/device info
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ["Chrome", "Desktop", "1.0.0"],
  });

  // Save session
  sock.ev.on("creds.update", saveCreds);

  // Connection + QR handling
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Scan this QR code to connect WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot connected!");
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log(`❌ Connection closed. Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) startBot(); // Auto reconnect
    }
  });

  // === Message Handler ===
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    // 🚫 Prevent self-response loop
    if (msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    // 🔍 Detect message type
    const messageType = Object.keys(msg.message)[0];
    let text = "";

    if (messageType === "conversation" || messageType === "extendedTextMessage") {
      text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    } else if (messageType === "imageMessage") {
      // 🖼️ If image with caption → use caption
      if (msg.message.imageMessage.caption) {
        text = msg.message.imageMessage.caption;
      } else {
        // 🚫 Ignore image-only messages (no caption)
        await sock.sendMessage(from, {
          text: "⚠️ Images aren’t supported right now. Please send text instead.",
        });
        return;
      }
    } else if (messageType === "documentMessage") {
      text = msg.message.documentMessage?.fileName || "document received";
    }

    // ❌ Ignore if there's no text at all
    if (!text) return;

    console.log(`💬 ${from}: ${text}`);

    // === Flow Control ===
    if (text.toLowerCase() === "hi") {
      await sock.sendMessage(from, { text: introFlow() });
      return;
    }

    if (text.toLowerCase().startsWith("q:")) {
      const answer = await runQuestionnaire(text);
      await sock.sendMessage(from, { text: answer });
      return;
    }

    // === Default: Ask Gemini (via geminiHandler) ===
    try {
      let geminiInput = { type: "text", text };

      if (msg.message.imageMessage?.caption) {
        geminiInput = {
          type: "image_caption",
          caption: msg.message.imageMessage.caption,
          text,
        };
      }

      if (msg.message.documentMessage) {
        const filename = msg.message.documentMessage?.fileName || "document";
        geminiInput = { type: "document", filename, text };
      }

      const gResult = await geminiHandler(ai, geminiInput, {
        modelName: config.modelName,
        maxRetries: 1,
        fallbackText: "⚠️ Gemini didn't respond. Try again.",
      });

      if (gResult?.status === "success") {
        await sock.sendMessage(from, { text: gResult.reply });
      } else {
        console.warn("⚠️ Gemini handler returned error meta:", gResult?.meta);
        await sock.sendMessage(from, {
          text: gResult.reply || "⚠️ No answer from Gemini.",
        });
      }
    } catch (err) {
      console.error("❌ Gemini handler failed:", err);
      await sock.sendMessage(from, {
        text: "⚠️ Internal error. Try again later.",
      });
    }
  });
}

startBot();
