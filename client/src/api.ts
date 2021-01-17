const API_ROOT_URL = process.env.PUBLIC_URL;

export const createUser = async (username: string) => {
  const response = await fetch(`${API_ROOT_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });
  const result = await response.json(); // TODO: handle status != 200
  return result;
};
