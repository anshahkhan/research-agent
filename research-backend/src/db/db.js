// Placeholder DB (mock)
const users = {};

export function saveUser(id, data) {
  users[id] = data;
}

export function getUser(id) {
  return users[id] || null;
}
