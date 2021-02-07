import { gql } from "@apollo/client";
import { Action } from "./usePerform";
import { retrieveGroup } from "./api";
import { Team, User } from "./game";
import { setAuth } from "./auth";

const ADD_USER = gql`
  mutation AddUser($username: String!) {
    registerUser(username: $username) {
      username
      id
    }
  }
`;

const START_GROUP = gql`
  mutation StartGroup {
    startGroup {
      id
      game {
        teams {
          name
        }
      }
    }
  }
`;

const JOIN_GROUP = gql`
  mutation JoinGroup($groupID: String!) {
    joinGroup(id: $groupID) {
      id
      game {
        teams {
          name
        }
      }
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
      const user = mutated.data.registerUser;
      setAuth(user);
      dispatch({
        type: "CREATED_USER",
        data: user,
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

export const startGroup = (): Action<void> =>
  async ({ apollo, dispatch }) => {
    const mutated = await apollo.mutate({
      mutation: START_GROUP,
    });
    const { id } = mutated.data.startGroup;
    dispatch({ type: "JOINED_GROUP", data: { groupID: id } });
  };

export const joinGroup = ({
  userID,
  groupID,
}: {
  userID: string;
  groupID: string;
}): Action<void> =>
  async ({ apollo, dispatch }) => {
    const mutated = await apollo.mutate({
      mutation: JOIN_GROUP,
      variables: { groupID: groupID.toUpperCase() },
    });
    const { id } = mutated.data.joinGroup;
    dispatch({ type: "JOINED_GROUP", data: { groupID: id } });
  };
