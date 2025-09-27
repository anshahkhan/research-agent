export function logger(msg) {
  console.log(`[ResearchAgent] ${msg}`)
}
export function logConsent(userId, consent) {
  console.log(`📜 Consent from ${userId}: ${consent}`);
}
