import { useEffect, useReducer, useState } from "react";
import { io } from "socket.io-client";
import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import { currentPlayer } from "./utils";
import Actions from "./actions";
import SelectGroup from "./SelectGroup";
import GroupInfo from "./GroupInfo";
import GameOver from "./GameOver";
import UserList from "./UserList";
import RoundZero from "./RoundZero";
import Round from "./Round";

const INITIAL_STATE = {
  clientID: null,
  groupID: null,
  users: [],
  yourSuggestions: [],
  suggestionCount: 0,
  round: 0,
  describer: null,
  currentSuggestion: null,
  scores: [],
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
      };
    case "USER_LIST":
      return { ...state, users: data.users };
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

const useSocket = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [socket, setSocket] = useState();
  useEffect(() => {
    console.log("creating a socket connection!");
    const socket = io({
      path: `${process.env.PUBLIC_URL}/socket.io`,
    });
    setSocket(socket);
    socket.on("connect", () => {
      console.log("connected");
      dispatch({ type: "SOCKET_CONNECTION", data: socket.id });
    });
    socket.onAny((type, data) => dispatch({ type, data }));
    return () => {
      console.log(`Closing connection to ${socket && socket.id}`);
      socket.close();
    };
  }, []);
  const actions = new Actions({ state, socket, dispatch });

  const user = socket && currentPlayer(state);
  return {
    state,
    actions,
    user,
  };
};

const App = () => {
  const gameState = useSocket();
  const { actions, state } = gameState;
  const { scores, groupID, round } = state;
  return (
    <div className="wrapper center-h padding-m center-text">
      <header className="debug center-text">
        <h1>The Hat Game</h1>
      </header>
      <main>
        {groupID
          ? (
            <>
              <GroupInfo groupID={groupID} />
              {round === 0 && <RoundZero gameState={gameState} />}
              {round > 0 && round < 4 && <Round gameState={gameState} />}
              {round === 4 && <GameOver scores={scores} />}
              <UserList state={state} />
            </>
          )
          : (
            <SelectGroup actions={actions} />
          )}
      </main>
    </div>
  );
};

export default App;
