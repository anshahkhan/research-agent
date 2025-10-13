import User from '../models/User.js';
import Message from '../models/Message.js';

/** Get or create user based on WhatsApp ID */
export async function getOrCreateUser(whatsappId) {
  const [user] = await User.findOrCreate({ where: { whatsappId } });
  return user;
}

/** Save message for a user */
export async function saveMessage({ whatsappId, messageText }) {
  await getOrCreateUser(whatsappId);
  return await Message.create({
    whatsappId,
    messageText
  });
}

/** Save session data for a user */
export async function saveSession(whatsappId, sessionData) {
  const user = await getOrCreateUser(whatsappId);
  user.sessionData = sessionData;
  await user.save();
}

/** Get session data for a user */
export async function getSession(whatsappId) {
  const user = await User.findOne({ where: { whatsappId } });
  return user ? user.sessionData : null;
}

/** Set user consent */
export async function setConsent(whatsappId, consentGiven) {
  const user = await getOrCreateUser(whatsappId);
  user.consentGiven = consentGiven;
  await user.save();
}

/** Get user consent */
export async function getConsent(whatsappId) {
  const user = await User.findOne({ where: { whatsappId } });
  return user ? user.consentGiven : null;
}
