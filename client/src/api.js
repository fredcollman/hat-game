export const createUser = async ({ username }) => {
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
  return { id, username };
};

export const addUserToGroup = async ({ userID, groupID }) => {
  const response = await window.fetch(
    `${process.env.PUBLIC_URL}/user/${userID}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupID,
      }),
    },
  );
  return await response.json(); // TODO: what if status != 200
};
