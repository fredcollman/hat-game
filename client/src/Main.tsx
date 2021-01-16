import { useEffect, useReducer } from "react";
import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import useSocket from "./useSocket";
import Layout from "./Layout";
import CurrentPhase from "./CurrentPhase";
import reducer, { initialize } from "./reducer";
import { DispatchProvider } from "./useDispatch";

const useDispatcher = () => {
  const socket = useSocket();
  const [state, dispatch] = useReducer(reducer, initialize());
  useEffect(() => {
    if (socket) {
      console.log("configuring socket via useDispatcher!");
      socket.on("connect", () => {
        console.log("connected inside useDispatcher");
        dispatch({ type: "SOCKET_CONNECTION", data: socket.id });
      });
      socket.onAny((type, data) => dispatch({ type, data }));
    }
  }, [socket]);

  return { state, dispatch };
};

const Main = () => {
  const { state, dispatch } = useDispatcher();
  return (
    <Layout>
      <DispatchProvider dispatch={dispatch}>
        <CurrentPhase state={state} />
      </DispatchProvider>
    </Layout>
  );
};

export default Main;
