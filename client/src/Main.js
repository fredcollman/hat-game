import { useEffect, useReducer, useState } from "react";
import { io } from "socket.io-client";
import Actions from "./actions";
import SelectGroup from "./SelectGroup";
import GroupInfo from "./GroupInfo";
import GameOver from "./GameOver";
import RoundZero from "./RoundZero";
import Round from "./Round";
import NewPlayer from "./NewPlayer";
import usePlayer from "./usePlayer";
import PlayerInfo from "./PlayerInfo";

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

  return {
    state,
    actions,
  };
};

// TODO: consolidate to a genuine single source of state
const combine = ({ player, gameState }) => {
  if (!player) {
    return gameState;
  }

  const { actions, state } = gameState;
  console.log(player, state);
  const combinedState = {
    ...state,
    groupID: player.groupID,
  };
  return { actions, state: combinedState };
};

const Main = () => {
  const gameState = useSocket();
  const { player } = usePlayer();
  const combined = combine({ player, gameState });
  const { actions, state } = combined;
  const { groupID, round } = state;
  if (!player) {
    return <NewPlayer />;
  }
  return (
    <>
      <PlayerInfo player={player} />
      {groupID
        ? (
          <>
            <GroupInfo state={state} />
            {round === 0 && <RoundZero gameState={combined} />}
            {round > 0 && round < 4 && <Round gameState={combined} />}
            {round === 4 && <GameOver state={state} />}
          </>
        )
        : (
          <SelectGroup actions={actions} />
        )}
    </>
  );
};

export default Main;
