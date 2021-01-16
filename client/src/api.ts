export const createUser = async (username: string) => {
  const response = await fetch("http://localhost:3000/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });
  const result = await response.json(); // TODO: handle status != 200
  return result;
};
