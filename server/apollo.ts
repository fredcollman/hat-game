import { Server } from "http";
import { Application, Request } from "express";
import { ApolloServer } from "apollo-server-express";
import { validate } from "uuid";
import { resolvers, typeDefs } from "./schema";
import Store, { Database } from "./store";

const getUser = async ({ req, store }: { req: Request; store: Store }) => {
  const auth = (req.headers && req.headers.authorization) || "";
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
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req, connection }) => {
      const store = new Store(db);
      if (req) {
        const user = await getUser({ req, store });
        console.log("apolloServer user", user);
        return { store, user };
      }
      return { store, user: null };
    },
  });
  apollo.applyMiddleware({ app });
  apollo.installSubscriptionHandlers(httpServer);
  return apollo;
};

export default apolloServer;
