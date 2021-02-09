import { gql, PubSub, withFilter } from "apollo-server-express";
import Store, { Group } from "./store";
import { addSuggestion, State, User } from "./game";

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
  }

  type Group {
    game: Game!
    id: String!
  }

  type Query {
    game(id: String!): Game
    hello: String
  }

  type Mutation {
    registerUser(username: String!): UserInfo!
    startGroup: Group!
    joinGroup(id: String!): Group!
    addSuggestion(groupID: String!, suggestion: String!): Game!
  }

  type Subscription {
    playerJoined: User!
    groupUpdated(groupID: String!): Group!
  }
`;

const PLAYER_JOINED = "PLAYER_JOINED";
const GROUP_UPDATED = "GROUP_UPDATED";

const formatGame = (game: State, userID: String) => {
  const suggestions = { count: game.suggestions.length, yours: [] };
  return { ...game, suggestions };
};

const formatGroup = (group: Group, userID: String) => {
  return { ...group, game: formatGame(group.game, userID) };
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
  },
};
