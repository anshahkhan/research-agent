import { saveUser, getUser } from "./db.js";

export const UserModel = {
  save: saveUser,
  get: getUser,
};
