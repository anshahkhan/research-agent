import { logger } from "../utils/logger.js"

export async function handleConsent(sock, sender, text) {
  if (text.toLowerCase() === "yes") {
    logger("✅ Consent given")
    await sock.sendMessage(sender, { text: "Awesome! Let’s get started.\nWhat’s your age?" })
    return true
  }
  if (text.toLowerCase() === "no") {
    logger("❌ Consent denied")
    await sock.sendMessage(sender, { text: "No worries. Thanks for your time!" })
    return true
  }
  return false
}
export function introFlow() {
  return "👋 Hi! I’m your research assistant bot. Do you consent to continue? (yes/no)";
}
