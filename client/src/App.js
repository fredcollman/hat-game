import { useEffect, useReducer, useState } from "react";
import { io } from "socket.io-client";
import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import Actions from "./actions";
import SelectGroup from "./SelectGroup";
import GroupInfo from "./GroupInfo";
import GameOver from "./GameOver";
import UserList from "./UserList";
import RoundZero from "./RoundZero";
import Round from "./Round";

const INITIAL_STATE = {
  groupID: null,
  users: [],
  yourSuggestions: [],
  suggestionCount: 0,
  turn: {
    round: 0,
    describer: null,
  },
  currentSuggestion: null,
  scores: [],
};

const reducer = (state, { type, data }) => {
  switch (type) {
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
        turn: { round: data.round, describer: data.describer },
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
    });
    socket.onAny((type, data) => dispatch({ type, data }));
    return () => {
      console.log(`Closing connection to ${socket && socket.id}`);
      socket.close();
    };
  }, []);
  const actions = new Actions({ state, socket, dispatch });

  const {
    startGroup,
    joinGroup,
    addSuggestion,
    startGame,
    requestSuggestion,
    guessCorrectly,
    skip,
    endTurn,
  } = actions;

  const {
    turn,
    groupID,
    users,
    currentSuggestion,
    scores,
    suggestionCount,
    yourSuggestions,
  } = state;
  const user = socket && users.find((u) => u.clientID === socket.id);
  const { round, describer } = turn;
  return {
    state,
    actions,
    groupID,
    startGroup,
    joinGroup,
    users,
    addSuggestion,
    yourSuggestions,
    startGame,
    suggestionCount,
    user,
    round,
    describer,
    requestSuggestion,
    guessCorrectly,
    skip,
    currentSuggestion,
    endTurn,
    scores,
  };
};

const App = () => {
  const gameState = useSocket();
  const {
    users,
    user,
    round,
    scores,
    groupID,
    startGroup,
    joinGroup,
  } = gameState;
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
              <UserList users={users} user={user} />
            </>
          )
          : (
            <SelectGroup startGroup={startGroup} joinGroup={joinGroup} />
          )}
      </main>
    </div>
  );
};

export default App;
