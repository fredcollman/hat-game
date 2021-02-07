import { gql, PubSub } from "apollo-server-express";
import Store from "./store";
import { User } from "./game";

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

  type Game {
    round: Int!
    users: [User!]!
    teams: [Team!]!
    options: Options!
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
  }

  type Subscription {
    playerJoined: User!
  }
`;

const PLAYER_JOINED = "PLAYER_JOINED";

export const resolvers = {
  Query: {
    game: async (root: any, args: any, context: Context) => {
      const state = await context.store.readGameState(args.id);
      return state;
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
      if (!context.user) return; // TODO: what should we do here, throw an error instead?
      const data = await context.store.addGroup(context.user.id);
      return data;
    },
    joinGroup: async (root: any, args: any, context: Context) => {
      if (!context.user) return; // TODO: what should we do here, throw an error instead?
      const data = await context.store.joinGroup({
        userID: context.user.id,
        groupID: args.id,
      });
      return data;
    },
  },
  Subscription: {
    playerJoined: {
      subscribe: () => pubsub.asyncIterator([PLAYER_JOINED]),
    },
  },
};
