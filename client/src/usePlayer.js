import React, { useContext, useState } from "react";
import { createUser } from "./api";

const STORAGE_KEY = "username";

const loadUser = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY));

const storeUser = (user) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
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
