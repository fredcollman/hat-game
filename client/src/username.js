const STORAGE_KEY = "username";

export const getUsername = () => window.localStorage.getItem(STORAGE_KEY);

export const setUsername = async (username) => {
  const response = await window.fetch(`${process.env.PUBLIC_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
    }),
  });
  const { id } = await response.json(); // TODO: what if status != 200
  const user = { id, username };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
};
