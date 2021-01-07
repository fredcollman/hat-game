import React, { useContext, useState } from "react";
const STORAGE_KEY = "username";

const loadUser = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY));

const storeUser = (user) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

const createUser = async ({ username }) => {
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

const PlayerContext = React.createContext(null);

export const WithPlayer = ({ children }) => {
  const [player, setPlayer] = useState(loadUser);
  const setName = async (username) => {
    const user = await createUser({ username });
    storeUser(user);
    setPlayer(user);
  };
  return (
    <PlayerContext.Provider value={{ player, setName }}>
      {children}
    </PlayerContext.Provider>
  );
};

const usePlayer = () => useContext(PlayerContext);

export default usePlayer;
