import { gql } from "@apollo/client";
import { Action } from "./usePerform";
import { createUser, retrieveGroup } from "./api";
import { Team, User } from "./game";

const ADD_USER = gql`
  mutation AddUser($username: String!) {
    registerUser(username: $username) {
      username
      id
    }
  }
`;

export const addUser = (username: string): Action<void> =>
  async ({
    dispatch,
    apollo,
  }) => {
    if (username && username.length) {
      const mutated = await apollo.mutate({
        mutation: ADD_USER,
        variables: { username },
      });
      console.log(mutated);
      dispatch({
        type: "CREATED_USER",
        data: mutated.data.registerUser,
      });
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
      suggestionCount: result.game.suggestionCount,
    };
    dispatch({
      type: "RETRIEVED_GROUP",
      data,
    });
  };

export const startGroup = (userID: string): Action<void> =>
  async ({
    socket,
  }) => {
    socket.emit("START_GROUP", { userID });
  };

export const joinGroup = ({
  userID,
  groupID,
}: {
  userID: string;
  groupID: string;
}): Action<void> =>
  async ({ socket }) => {
    socket.emit("JOIN_GROUP", { userID, groupID: groupID.toUpperCase() });
  };
