import { useEffect, useReducer } from "react";
import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import useSocket from "./useSocket";
import { currentPlayer } from "./utils";
import SelectGroup from "./SelectGroup";
import GroupInfo from "./GroupInfo";
import GameOver from "./GameOver";
import RoundZero from "./RoundZero";
import Round from "./Round";

const INITIAL_STATE = {
  clientID: null,
  groupID: null,
  users: [],
  teams: [],
  yourSuggestions: [],
  suggestionCount: 0,
  round: 0,
  describer: null,
  currentSuggestion: null,
  scores: [],
  turnDurationSeconds: 60,
  numTeams: 2,
};

const reducer = (state, { type, data }) => {
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
      };
    case "USER_LIST":
      return { ...state, users: data.users, teams: data.teams };
    case "NEW_SUGGESTION":
      return { ...state, suggestionCount: data.count };
    case "ADD_SUGGESTION":
      return {
        ...state,
        yourSuggestions: [...state.yourSuggestions, data.suggestion],
      };
    case "NEW_TURN":
      return {
        ...state,
        round: data.round,
        describer: data.describer,
        currentSuggestion: null,
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

const useDispatcher = ({ socket }) => {
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

  // TODO: find a better place
  const addSuggestion = (suggestion) => {
    if (
      suggestion &&
      suggestion.length &&
      !state.yourSuggestions.includes(suggestion)
    ) {
      socket.emit("ADD_SUGGESTION", { suggestion });
      dispatch({ type: "ADD_SUGGESTION", data: { suggestion } });
    }
  };

  const user = socket && currentPlayer(state);
  return {
    state,
    user,
    addSuggestion,
  };
};

const Main = () => {
  const socket = useSocket();
  const gameState = useDispatcher({ socket });
  const { state } = gameState;
  const { groupID, round } = state;
  return (
    <div className="wrapper center-h padding-m">
      <header className="debug center-text">
        <h1>The Hat Game</h1>
      </header>
      <main>
        {groupID
          ? (
            <>
              <GroupInfo state={state} />
              {round === 0 && <RoundZero gameState={gameState} />}
              {round > 0 && round < 4 && <Round gameState={gameState} />}
              {round === 4 && <GameOver state={state} />}
            </>
          )
          : (
            <SelectGroup />
          )}
      </main>
    </div>
  );
};

export default Main;
