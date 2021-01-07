import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import Layout from "./Layout";
import Main from "./Main";
import { WithPlayer } from "./usePlayer";

const App = () => {
  return (
    <WithPlayer>
      <Layout>
        <Main />
      </Layout>
    </WithPlayer>
  );
};

export default App;
