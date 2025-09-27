
export function parseReply(reply) {
  // Strip prefix "q:" and return object
  return { response: reply.replace(/^q:\s*/i, "") };
}
