import { Action } from "./usePerform";
import { createUser, retrieveGroup } from "./api";

export const addUser = (username: string): Action<void> =>
  async ({
    socket,
    dispatch,
  }) => {
    if (username && username.length) {
      const user = await createUser(username);
      dispatch({
        type: "CREATED_USER",
        data: user,
      });
      socket.emit("SET_USERNAME", user);
    }
  };

export const loadGroupInfo = (groupID: string): Action<void> =>
  async ({
    socket,
    dispatch,
  }) => {
    const result = await retrieveGroup(groupID);
    dispatch({
      type: "RETRIEVED_GROUP",
      data: result,
    });
    console.log("load group info", result.game);
  };
