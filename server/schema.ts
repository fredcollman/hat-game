import { gql, PubSub, withFilter } from "apollo-server-express";
import Store, { Group } from "./store";
import {
  addSuggestion,
  endTurn,
  getCurrentTurnDetails,
  getNextSuggestion,
  getScores,
  guessCorrectly,
  skip,
  start,
  State,
  User,
} from "./game";

type Context = { store: Store; user: User | null };

const pubsub = new PubSub();

export const typeDefs = gql`
  type User {
    id: String!
    username: String!
  }

  type UserInfo {
    id: ID
    username: String
  }

  type Team {
    name: String!
    members: [User!]!
  }

  type Options {
    teams: Int!
    turnDurationSeconds: Int!
  }

  type Suggestions {
    count: Int!
    yours: [String!]!
  }

  type Game {
    round: Int!
    users: [User!]!
    teams: [Team!]!
    options: Options!
    suggestions: Suggestions
    scores: [Score!]!
  }

  type Group {
    game: Game!
    id: String!
  }

  type Describer {
    id: String!
    username: String!
    team: String!
  }

  type Turn {
    round: Int!
    duration: Int!
    describer: Describer!
  }

  type Score {
    name: String!
    correct: Int!
    skips: Int!
  }

  type DescriberUpdate {
    scores: [Score!]!
    suggestion: String
  }

  type Query {
    game(id: String!): Game
    suggestion(groupID: String!): String
    hello: String
  }

  type Mutation {
    registerUser(username: String!): UserInfo!
    startGroup: Group!
    joinGroup(id: String!): Group!
    addSuggestion(groupID: String!, suggestion: String!): Game!
    startGame(groupID: String!): Turn!
    guessCorrectly(groupID: String!, suggestion: String!): DescriberUpdate!
    skip(groupID: String!, suggestion: String!): DescriberUpdate!
    endTurn(groupID: String!): Turn!
  }

  type Subscription {
    playerJoined: User!
    groupUpdated(groupID: String!): Group!
    turnStarted(groupID: String!): Turn!
  }
`;

const PLAYER_JOINED = "PLAYER_JOINED";
const GROUP_UPDATED = "GROUP_UPDATED";
const TURN_STARTED = "TURN_STARTED";

interface TeamScore {
  name: string;
  correct: number;
  skips: number;
}

interface DescriberUpdate {
  scores: TeamScore[];
  suggestion: string | null;
}

interface Turn {
  round: number;
  duration: number;
  describer: {
    id: string;
    username: string;
    team: string;
  };
}

interface Team {
  name: string;
  members: User[];
}

interface Suggestions {
  count: number;
  yours: string[];
}

interface Game {
  round: number;
  users: User[];
  teams: Team[];
  scores: TeamScore[];
  options: {};
  suggestions: Suggestions;
}

const formatGame = (game: State, userID: String): Game => {
  const suggestions = { count: game.suggestions.length, yours: [] };
  const scores = getScores(game);
  return { ...game, scores, suggestions };
};

const formatGroup = (group: Group, userID: String) => {
  return { ...group, game: formatGame(group.game, userID) };
};

const notifyNewTurn = (groupID: string, game: State): Turn => {
  const turn = getCurrentTurnDetails(game);
  pubsub.publish(TURN_STARTED, {
    groupID: groupID,
    turnStarted: turn,
  });
  return turn;
};

export const resolvers = {
  Query: {
    game: async (
      root: any,
      args: any,
      context: Context,
    ): Promise<Game | undefined> => {
      if (!context.user) return; // TODO: what should we do here, throw an error instead?
      const state = await context.store.readGameState(args.id);
      return formatGame(state, context.user.id);
    },
    suggestion: async (
      root: any,
      args: any,
      context: Context,
    ): Promise<string | undefined> => {
      if (!context.user) return;
      const state = await context.store.readGameState(args.groupID);
      return getNextSuggestion(state)?.name;
    },
    hello: () => "server says yes",
  },
  Mutation: {
    registerUser: async (root: any, args: any, context: Context) => {
      const { username } = args;
      const user = await context.store.addUser({ username });
      pubsub.publish(PLAYER_JOINED, { playerJoined: user });
      return user;
    },
    startGroup: async (root: any, args: any, context: Context) => {
      if (!context.user) return;
      const group = await context.store.addGroup(context.user.id);
      return group;
    },
    joinGroup: async (root: any, args: any, context: Context) => {
      if (!context.user) return;
      const group = await context.store.joinGroup({
        userID: context.user.id,
        groupID: args.id,
      });
      const groupUpdated = formatGroup(group, context.user.id);
      pubsub.publish(GROUP_UPDATED, { groupUpdated });
      return groupUpdated;
    },
    addSuggestion: async (root: any, args: any, context: Context) => {
      if (!context.user) return;
      const game = await context.store.withGame(args.groupID)(
        addSuggestion(args.suggestion),
      );
      const groupUpdated = formatGroup(
        { id: args.groupID, game },
        context.user.id,
      );
      pubsub.publish(GROUP_UPDATED, { groupUpdated });
      return groupUpdated.game;
    },
    startGame: async (
      root: any,
      args: any,
      context: Context,
    ): Promise<Turn | undefined> => {
      if (!context.user) return;
      const game = await context.store.withGame(args.groupID)(start);
      return notifyNewTurn(args.groupID, game);
    },
    guessCorrectly: async (
      root: any,
      args: any,
      context: Context,
    ): Promise<DescriberUpdate | undefined> => {
      if (!context.user) return;
      let suggestion: string | null = null;
      const finalState = await context.store.withGame(args.groupID)(
        (initial) => {
          let game = initial;
          game = guessCorrectly(args.suggestion)(game);
          suggestion = getNextSuggestion(game)?.name;
          if (!suggestion) {
            game = endTurn(game);
            notifyNewTurn(args.groupID, game);
          }
          return game;
        },
      );
      return { scores: getScores(finalState), suggestion };
    },
    skip: async (
      root: any,
      args: any,
      context: Context,
    ): Promise<DescriberUpdate | undefined> => {
      if (!context.user) return;
      let suggestion: string | null = null;
      const finalState = await context.store.withGame(args.groupID)(
        (initial) => {
          let game = initial;
          game = skip(args.suggestion)(game);
          suggestion = getNextSuggestion(game)?.name;
          if (!suggestion) {
            game = endTurn(game);
            notifyNewTurn(args.groupID, game);
          }
          return game;
        },
      );
      return { scores: getScores(finalState), suggestion } as DescriberUpdate;
    },
    endTurn: async (
      root: any,
      args: any,
      context: Context,
    ): Promise<Turn | undefined> => {
      if (!context.user) return;
      const game = await context.store.withGame(args.groupID)(endTurn);
      return notifyNewTurn(args.groupID, game);
    },
  },
  Subscription: {
    playerJoined: {
      subscribe: () => pubsub.asyncIterator([PLAYER_JOINED]),
    },
    groupUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(GROUP_UPDATED),
        (payload, variables) => payload.groupUpdated.id === variables.groupID,
      ),
    },
    turnStarted: {
      subscribe: withFilter(
        () => {
          console.log("notify subscription:turnStarted");
          return pubsub.asyncIterator(TURN_STARTED);
        },
        (payload, variables) => payload.groupID === variables.groupID,
      ),
    },
  },
};
