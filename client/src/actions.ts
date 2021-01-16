import { Action } from "./usePerform";
import { createUser } from "./api";

export const addUser = (username: string): Action<void> =>
  async ({
    socket,
    dispatch,
  }) => {
    if (username && username.length) {
      const user = await createUser(username);
      // dispatch({
      //   type: "CREATED_USER",
      //   data: user,
      // });
      socket.emit("SET_USERNAME", user);
    }
  };
