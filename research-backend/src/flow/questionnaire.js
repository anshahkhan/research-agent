import { logger } from "../utils/logger.js"

import { parseReply } from "./parser.js";

export async function runQuestionnaire(input) {
  // For now just mock a Q→A flow
  const parsed = parseReply(input);
  return `✅ Got your answer: ${JSON.stringify(parsed)}`;
}