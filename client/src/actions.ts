import { Action } from "./usePerform";
import { createUser } from "./api";

export const addUser = (username: string): Action<void> =>
  ({ socket }) => {
    if (username && username.length) {
      socket.emit("SET_USERNAME", { username });
      createUser(username);
    }
  };
