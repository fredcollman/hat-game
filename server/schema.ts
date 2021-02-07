import { PubSub } from "apollo-server-express";
import { gql } from "apollo-server-express";
import Store from "./store";

type Context = { store: Store };

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
  },
  Subscription: {
    playerJoined: {
      subscribe: () => pubsub.asyncIterator([PLAYER_JOINED]),
    },
  },
};
