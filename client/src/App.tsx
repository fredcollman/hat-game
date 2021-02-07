import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import { SocketProvider } from "./useSocket";
import Main from "./Main";

const API_ROOT_URL = process.env.PUBLIC_URL;

const client = new ApolloClient({
  uri: `${API_ROOT_URL}/graphql`,
  cache: new InMemoryCache(),
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <SocketProvider>
        <Main />
      </SocketProvider>
    </ApolloProvider>
  );
};

export default App;
