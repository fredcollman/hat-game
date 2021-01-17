import { Action } from "./usePerform";
import { createUser, retrieveGroup } from "./api";
import { Team, User } from "./game";

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

export interface RetrievedGroupMessage {
  teams: Team[];
  users: User[];
  turnDurationSeconds: number;
  numTeams: number;
  suggestionCount: number;
}

export const loadGroupInfo = (groupID: string): Action<void> =>
  async ({
    socket,
    dispatch,
  }) => {
    const result = await retrieveGroup(groupID);
    const data: RetrievedGroupMessage = {
      teams: result.game.teams.map((t) => ({
        name: t.name,
        members: t.members,
      })),
      users: result.game.users.map((u) => ({
        id: u.id,
        username: u.username,
      })),
      turnDurationSeconds: result.game.options.turnDurationSeconds,
      numTeams: result.game.options.teams,
      suggestionCount: result.game.availableSuggestions.length,
    };
    dispatch({
      type: "RETRIEVED_GROUP",
      data,
    });
    console.log("load group info", result.game);
  };
