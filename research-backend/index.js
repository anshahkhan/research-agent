// index.js
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
  const sock = makeWASocket({ auth: state }); // removed deprecated option

  // Save session
  sock.ev.on("creds.update", saveCreds);

  // Connection status + QR handling
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📱 Scan this QR code to connect WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") console.log("✅ Bot connected!");
    if (connection === "close") console.log("❌ Connection closed. Restarting...");
  });

  // Message handler
sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg?.message) return;

  // 🚫 Prevent echo loop
  if (msg.key.fromMe) return;

  const from = msg.key.remoteJid;
  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    "";

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

  // === Default: Ask Gemini ===
 try {
  const result = await ai.models.generateContent({
    model: config.modelName,
    contents: text,
  });

  // Handle both shapes of the SDK response
  const candidates =
    result?.response?.candidates || result?.candidates || [];

  const reply =
    candidates[0]?.content?.parts?.[0]?.text?.trim() ||
    "⚠️ No reply generated.";

  await sock.sendMessage(from, { text: reply });
} catch (err) {
  console.error("❌ Gemini API error:", err);
  await sock.sendMessage(from, { text: "⚠️ Gemini API error. Try again later." });
}
});
}

startBot();
