import { gql } from "apollo-server-express";
import Store from "./store";

type Context = { store: Store };

export const typeDefs = gql`
  type User {
    username: String
  }

  type Team {
    name: String
    members: [User]
  }

  type Options {
    teams: Int
    turnDurationSeconds: Int
  }

  type Game {
    round: Int
    users: [User]
    teams: [Team]
    options: Options
  }

  type Query {
    game(id: String): Game
    hello: String
  }
`;

export const resolvers = {
  Query: {
    game: async (root: any, args: any, context: Context) => {
      const state = await context.store.readGameState(args.id);
      return state;
    },
    hello: () => "server says yes",
  },
};
