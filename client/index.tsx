import { React } from "./deps.tsx";
import ReactDOM from "https://esm.sh/react-dom@17.0.1";
import App from "./App.tsx";

ReactDOM.hydrate(
  <App />,
  //@ts-ignore
  document.getElementById("root"),
);
