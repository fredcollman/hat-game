import { Server } from "http";
import { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { validate } from "uuid";
import { resolvers, typeDefs } from "./schema";
import Store, { Database } from "./store";

const resolveToken = async (auth: string | null | undefined, store: Store) => {
  if (!auth) return null;
  const isUuid = validate(auth);
  if (!isUuid) return null;
  const user = await store.findUserByID(auth);
  return user;
};

const apolloServer = ({
  app,
  db,
  httpServer,
}: {
  app: Application;
  db: Database;
  httpServer: Server;
}) => {
  const store = new Store(db);
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
      if (connection) {
        console.log("apollo subscription user", connection.context);
        return { store, ...connection.context };
      } else {
        const user = await resolveToken(req?.headers?.authorization, store);
        console.log("apolloServer user", user);
        return { store, user };
      }
    },
    subscriptions: {
      onConnect: async (params, ws) => {
        const { authToken } = params as {
          authToken: string | null | undefined;
        };
        const user = await resolveToken(authToken, store);
        return { user };
      },
    },
  });
  apollo.applyMiddleware({ app });
  apollo.installSubscriptionHandlers(httpServer);
  return apollo;
};

export default apolloServer;
