const API_ROOT_URL = process.env.PUBLIC_URL;

interface RetrieveGroupResponse {
  id: string;
  game: {
    teams: {
      name: string;
      members: {}[];
    }[];
  };
}

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

export const retrieveGroup = async (groupID: string) => {
  console.log("retrieve group", groupID);
  const response = await fetch(`${API_ROOT_URL}/group/${groupID}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = (await response.json()) as RetrieveGroupResponse; // TODO: handle status != 200
  return result;
};
