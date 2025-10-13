export function analyzeSentiment(text) {
  if (text.includes("happy")) return "positive";
  if (text.includes("sad")) return "negative";
  return "neutral";
}
