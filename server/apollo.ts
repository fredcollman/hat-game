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

const apolloServer = ({ app, db }: { app: Application; db: Database }) => {
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const store = new Store(db);
      const user = await getUser({ req, store });
      console.log("apolloServer user", user);
      return { store, user };
    },
  });
  apollo.applyMiddleware({ app });
  return apollo;
};

export default apolloServer;
