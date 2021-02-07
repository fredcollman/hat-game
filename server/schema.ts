import { gql, PubSub } from "apollo-server-express";
import Store from "./store";
import { addSuggestion, State, User } from "./game";

type Context = { store: Store; user: User | null };

const pubsub = new PubSub();

export const typeDefs = gql`
  type User {
    username: String!
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
  }

  type Group {
    game: Game!
    id: String!
  }

  type Query {
    game(id: String!): Game
    hello: String
  }

  type UserInfo {
    username: String
    id: ID
  }

  type Mutation {
    registerUser(username: String!): UserInfo
    startGroup: Group
    joinGroup(id: String!): Group
    addSuggestion(groupID: String!, suggestion: String!): Game
  }

  type Subscription {
    playerJoined: User!
  }
`;

const PLAYER_JOINED = "PLAYER_JOINED";

const formatGame = (game: State, userID: String) => {
  const suggestions = { count: game.suggestions.length, yours: [] };
  return { ...game, suggestions };
};

export const resolvers = {
  Query: {
    game: async (root: any, args: any, context: Context) => {
      if (!context.user) return; // TODO: what should we do here, throw an error instead?
      const state = await context.store.readGameState(args.id);
      return formatGame(state, context.user.id);
    },
    hello: () => "server says yes",
  },
  Mutation: {
    registerUser: async (root: any, args: any, context: Context) => {
      const { username } = args;
      const data = await context.store.addUser({ username });
      pubsub.publish(PLAYER_JOINED, { playerJoined: data });
      return data;
    },
    startGroup: async (root: any, args: any, context: Context) => {
      if (!context.user) return;
      const data = await context.store.addGroup(context.user.id);
      return data;
    },
    joinGroup: async (root: any, args: any, context: Context) => {
      if (!context.user) return;
      const data = await context.store.joinGroup({
        userID: context.user.id,
        groupID: args.id,
      });
      return data;
    },
    addSuggestion: async (root: any, args: any, context: Context) => {
      if (!context.user) return;
      const data = await context.store.withGame(args.groupID)(
        addSuggestion(args.suggestion),
      );
      return formatGame(data, context.user.id);
    },
  },
  Subscription: {
    playerJoined: {
      subscribe: () => pubsub.asyncIterator([PLAYER_JOINED]),
    },
  },
};
