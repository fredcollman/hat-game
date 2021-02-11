import { gql } from "@apollo/client";
import { Action } from "./usePerform";
import { Team, User } from "./game";
import { setAuth } from "./auth";
import { GAME_DETAILS, GameDetails, GroupDetails, TurnDetails } from "./dto";

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

const ADD_SUGGESTION = gql`
  mutation AddSuggestion($groupID: String!, $suggestion: String!) {
    addSuggestion(groupID: $groupID, suggestion: $suggestion) {
      suggestions {
        count
        yours
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

const GAME = gql`
  query loadGame($groupID: String!) {
    game(id: $groupID) {
      ...GameDetails
    }
  }
  ${GAME_DETAILS}
`;

export const loadGroupInfo = (groupID: string): Action<void> =>
  async ({
    apollo,
    dispatch,
  }) => {
    const queried = await apollo.query<
      { game: GameDetails },
      { groupID: string }
    >({ query: GAME, variables: { groupID } });
    const { game } = queried.data;
    const message: RetrievedGroupMessage = {
      teams: game.teams.map((t) => ({
        name: t.name,
        members: t.members,
      })),
      users: game.teams.map((t) => t.members).flat(1),
      turnDurationSeconds: game.options.turnDurationSeconds,
      numTeams: game.teams.length,
      suggestionCount: game.suggestions.count,
    };
    dispatch({
      type: "RETRIEVED_GROUP",
      data: message,
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

export const joinGroup = (groupID: string): Action<void> =>
  async ({
    apollo,
    dispatch,
  }) => {
    const mutated = await apollo.mutate({
      mutation: JOIN_GROUP,
      variables: { groupID: groupID.toUpperCase() },
    });
    const { id } = mutated.data.joinGroup;
    dispatch({ type: "JOINED_GROUP", data: { groupID: id } });
  };

export const addSuggestion = ({
  groupID,
  suggestion,
}: {
  groupID: string;
  suggestion: string;
}): Action<void> =>
  async ({ apollo, dispatch }) => {
    const mutated = await apollo.mutate({
      mutation: ADD_SUGGESTION,
      variables: { groupID, suggestion },
    });
    const { suggestions } = mutated.data.addSuggestion;
    dispatch({ type: "NEW_SUGGESTION", data: { count: suggestions.count } });
  };

export type GroupUpdatedMessage = GroupDetails;

export const notifyGroupUpdated = (
  group: GroupDetails,
): Action<void> =>
  async ({ dispatch }) => {
    dispatch({ type: "GROUP_UPDATED", data: group });
  };

const START_GAME = gql`
  mutation StartGame($groupID: String!) {
    startGame(groupID: $groupID) {
      round
    }
  }
`;

export const startGame = (groupID: string): Action<void> =>
  async ({
    apollo,
  }) => {
    await apollo.mutate({ mutation: START_GAME, variables: { groupID } });
  };

export const notifyTurnStarted = (turn: TurnDetails): Action<void> =>
  async ({
    dispatch,
  }) => {
    console.log("notifyTurnStarted", turn);
    dispatch({ type: "NEW_TURN", data: turn });
  };

const REQUEST_SUGGESTION = gql`
  query NextSuggestion($groupID: String!) {
    suggestion(groupID: $groupID)
  }
`;

export const requestSuggestion = (groupID: string): Action<void> =>
  async ({
    apollo,
    dispatch,
  }) => {
    const queried = await apollo.query<
      { suggestion: string },
      { groupID: string }
    >({ query: REQUEST_SUGGESTION, variables: { groupID } });
    dispatch({
      type: "NEXT_SUGGESTION",
      data: { name: queried.data.suggestion },
    });
  };
