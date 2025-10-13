// src/utils/geminiHandler.js
export default async function geminiHandler(ai, input = {}, opts = {}) {
  if (!ai) throw new Error("geminiHandler: 'ai' is required.");
  const model = opts.modelName;
  if (!model) throw new Error("geminiHandler: opts.modelName is required.");

  const maxRetries = typeof opts.maxRetries === "number" ? opts.maxRetries : 1;
  const fallbackText = opts.fallbackText || "⚠️ Sorry, I couldn't get a valid response. Please try again.";

  const type = input.type || "text";
  let prompt = "";

  switch (type) {
    case "image_caption":
      prompt = `Image caption: ${input.caption || "<no caption>"}\n`;
      if (input.text) prompt += `User message: ${input.text}\n`;
      prompt += "Please respond concisely and clearly.";
      break;
    case "document":
      if (input.mediaText) {
        prompt = `Document content:\n${input.mediaText}\n\nUser query: ${input.text || "<none>"}\nPlease answer based on the document.`;
      } else {
        prompt = `User uploaded a document named: ${input.filename || "unknown"}.\nUser query: ${input.text || "<none>"}\nNote: document content not extracted. Provide a high-level answer or request text extraction.`;
      }
      break;
    case "other":
      prompt = input.text || input.caption || "";
      break;
    case "text":
    default:
      prompt = input.text || "";
      break;
  }

  prompt = String(prompt).trim();
  if (!prompt) return { status: "error", reply: "⚠️ Empty input — nothing to send to Gemini." };

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    try {
      const result = await ai.models.generateContent({ model, contents: prompt });

      const candidates = result?.response?.candidates || result?.candidates || [];
      let replyText = "";

      if (Array.isArray(candidates) && candidates.length > 0) {
        const c = candidates[0];
        if (c?.content?.parts && Array.isArray(c.content.parts)) {
          replyText = c.content.parts.map(p => (p?.text ?? "")).join("\n").trim();
        } else if (typeof c?.text === "string") {
          replyText = c.text.trim();
        } else {
          replyText = String(c).trim();
        }
      } else {
        if (typeof result?.text === "string") replyText = result.text.trim();
      }

      if (!replyText) {
        return { status: "error", reply: fallbackText, raw: result, meta: { reason: "empty_response" } };
      }

      return { status: "success", reply: replyText, raw: result, meta: { model, attempts: attempt + 1, type } };
    } catch (err) {
      lastError = err;
      attempt += 1;
      if (attempt <= maxRetries) await new Promise(r => setTimeout(r, 250 * attempt));
    }
  }

  return { status: "error", reply: fallbackText, raw: lastError, meta: { model, attempts: attempt, reason: "exception" } };
}
