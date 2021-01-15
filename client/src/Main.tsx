import { useEffect, useReducer } from "react";
import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import useSocket from "./useSocket";
import { currentPlayer } from "./utils";
import Layout from "./Layout";
import CurrentPhase from "./CurrentPhase";
import { State } from "./game";

const INITIAL_STATE: State = {
  phase: "CHOOSE_GROUP",
  clientID: null,
  groupID: null,
  users: [],
  teams: [],
  suggestionCount: 0,
  round: 0,
  describer: null,
  currentSuggestion: null,
  scores: [],
  turnDurationSeconds: 60,
  numTeams: 2,
};

interface Message {
  type: string;
  data: any;
}

const reducer = (state: State, { type, data }: Message): State => {
  switch (type) {
    case "SOCKET_CONNECTION":
      return { ...state, clientID: data };
    case "JOINED_GROUP":
      return {
        ...state,
        groupID: data.groupID,
        users: data.users,
        turnDurationSeconds: data?.options?.turnDurationSeconds,
        numTeams: data?.options?.teams,
        phase: "SIGN_UP",
      };
    case "USER_LIST":
      return {
        ...state,
        users: data.users,
        teams: data.teams,
        phase: "CONFIGURE_GAME",
      };
    case "NEW_SUGGESTION":
      return { ...state, suggestionCount: data.count };
    case "NEW_TURN":
      return {
        ...state,
        round: data.round,
        describer: data.describer,
        currentSuggestion: null,
        phase: data.round <= 3 ? "PLAY" : "GAME_OVER",
      };
    case "NEXT_SUGGESTION":
      console.log("NEXT_SUGGESTION:", data);
      return { ...state, currentSuggestion: data.name };
    case "LATEST_SCORES":
      return { ...state, scores: data };
    default:
      console.warn("unhandled", type);
      return state;
  }
};

const useDispatcher = () => {
  const socket = useSocket();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  useEffect(() => {
    if (socket) {
      console.log("configuring socket via useDispatcher!");
      socket.on("connect", () => {
        console.log("connected inside useDispatcher");
        dispatch({ type: "SOCKET_CONNECTION", data: socket.id });
      });
      socket.onAny((type, data) => dispatch({ type, data }));
      return () => {
        console.log(`Closing connection to ${socket && socket.id}`);
        socket.close();
      };
    }
  }, [socket]);

  const user = (socket && currentPlayer(state)) || null;
  return {
    state,
    user,
  };
};

const Main = () => {
  const gameState = useDispatcher();
  return (
    <Layout>
      <CurrentPhase gameState={gameState} />
    </Layout>
  );
};

export default Main;
