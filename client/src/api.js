const makeApiCall = async ({ method, url, body }) => {
  const response = await window.fetch(`${process.env.PUBLIC_URL}/${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return await response.json(); // TODO: what if status != 200
};
export const createUser = async ({ username }) => {
  const { id } = await makeApiCall({
    url: "user",
    method: "POST",
    body: {
      username,
    },
  });
  return { id, username };
};

export const refreshUser = async ({ userID }) =>
  makeApiCall({ url: `user/${userID}`, method: "GET" });

export const addUserToGroup = async ({ userID, groupID }) =>
  makeApiCall({
    url: `user/${userID}`,
    method: "PATCH",
    body: {
      groupID,
    },
  });
