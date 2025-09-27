import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "./config.js";
import { introFlow } from "./flow/consent.js";
import { runQuestionnaire } from "./flow/questionnaire.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: config.modelName });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log("✅ Bot connected!");
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (!text) return;

    console.log(`💬 ${from}: ${text}`);

    // simple flow control
    if (text.toLowerCase() === "hi") {
      await sock.sendMessage(from, { text: introFlow() });
      return;
    }

    if (text.toLowerCase().startsWith("q:")) {
      const answer = await runQuestionnaire(text);
      await sock.sendMessage(from, { text: answer });
      return;
    }

    // default: ask Gemini
    try {
      const result = await model.generateContent(text);
      const reply = result.response.text();
      await sock.sendMessage(from, { text: reply });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: "⚠️ Gemini API error." });
    }
  });
}

startBot();
