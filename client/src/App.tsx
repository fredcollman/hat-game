import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import { SocketProvider } from "./useSocket";
import Main from "./Main";

const App = () => {
  return (
    <SocketProvider>
      <Main />
    </SocketProvider>
  );
};

export default App;
