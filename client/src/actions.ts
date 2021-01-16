import { Action } from "./usePerform";

export const addUser = (username: string): Action<void> =>
  ({ socket }) => {
    if (username && username.length) {
      socket.send("SET_USERNAME", { username });
    }
  };
