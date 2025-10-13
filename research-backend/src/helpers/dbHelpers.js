const User = require('../models/User');
const Message = require('../models/Message');

async function getOrCreateUser(waId) {
  const [user] = await User.findOrCreate({ where: { waId } });
  return user;
}

async function saveMessage({ waId, direction, content, questionKey, parsedField }) {
  const user = await getOrCreateUser(waId);
  return await Message.create({
    userId: user.id,
    direction,
    content,
    questionKey,
    parsedField,
  });
}

async function saveSession(waId, sessionData) {
  const user = await getOrCreateUser(waId);
  user.sessionId = sessionData.id || null;
  user.metadata = { sessionData };
  await user.save();
}

async function getSession(waId) {
  const user = await User.findOne({ where: { waId } });
  return user ? user.metadata?.sessionData || null : null;
}

async function setConsent(waId, consent) {
  const user = await getOrCreateUser(waId);
  user.consent = consent;
  await user.save();
}

async function getConsent(waId) {
  const user = await User.findOne({ where: { waId } });
  return user ? user.consent : 'unknown';
}

module.exports = {
  saveMessage,
  saveSession,
  getSession,
  setConsent,
  getConsent
};
