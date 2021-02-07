import { User } from "./game";
const STORAGE_KEY = "auth_token";

export const setAuth = (user: User) => {
  localStorage.setItem(STORAGE_KEY, user.id);
};

export const getAuth = () => localStorage.getItem(STORAGE_KEY) || "";
