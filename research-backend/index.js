import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "./config.js";

import sequelize from './src/config/database.js';
import { saveMessage, getSession, saveSession, setConsent, getConsent } from './src/helpers/dbHelpers.js';

// --- Test DB connection ---
sequelize.authenticate()
  .then(() => console.log('✅ MySQL connected!'))
  .catch(err => console.error('❌ DB connection error:', err));

// --- Setup Gemini AI ---
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: config.modelName });

async function startBot() {
  // --- WhatsApp auth ---
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({ auth: state });
  sock.ev.on("creds.update", saveCreds);

  // --- Connection events ---
  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") console.log("✅ Bot connected!");
    if (connection === "close") console.log("⚠️ Connection closed:", lastDisconnect?.error?.output?.statusCode);
  });

  // --- Message handling ---
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const from = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (!text) return;

    console.log(`💬 ${from}: ${text}`);

    try {
      // Save inbound message
      await saveMessage({ waId: from, content: text, direction: "inbound" });

      // Example: fetch user session
      const session = await getSession(from);
      console.log("Session data:", session);

      // --- Simple flows ---
      if (text.toLowerCase() === "hi") {
        const reply = "Hello! Welcome to the bot. How can I help you today?";
        await sock.sendMessage(from, { text: reply });
        await saveMessage({ waId: from, content: reply, direction: "outbound" });
        return;
      }

      if (text.toLowerCase().startsWith("q:")) {
        const reply = "Questionnaire flow is not implemented yet.";
        await sock.sendMessage(from, { text: reply });
        await saveMessage({ waId: from, content: reply, direction: "outbound" });
        return;
      }

      // --- Default: generate response via Gemini AI ---
      const result = await model.generateContent(text);
      const reply = result.response.text();
      await sock.sendMessage(from, { text: reply });
      await saveMessage({ waId: from, content: reply, direction: "outbound" });

    } catch (err) {
      console.error("⚠️ Message handling error:", err);
      await sock.sendMessage(from, { text: "⚠️ An error occurred while processing your message." });
    }
  });
}

// --- Start bot ---
startBot().catch(err => console.error("❌ Bot failed to start:", err));
