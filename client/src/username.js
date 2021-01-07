const STORAGE_KEY = "username";

export const getUsername = () => window.localStorage.getItem(STORAGE_KEY);

export const setUsername = (username) => {
  window.localStorage.setItem(STORAGE_KEY, username);
};
