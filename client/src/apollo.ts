import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getAuth } from "./auth";

const API_ROOT_URL = process.env.PUBLIC_URL;

const httpLink = createHttpLink({
  uri: `${API_ROOT_URL}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: { ...headers, authorization: getAuth() || "" },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
