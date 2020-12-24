import { useEffect, useReducer, useState } from "react";
import { io } from "socket.io-client";
import "./reset.css";
import "./variables.css";
import "./global.css";
import "./utility.css";
import SelectGroup from "./SelectGroup";
import GroupInfo from "./GroupInfo";
import Signup from "./Signup";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import YourTurn from "./YourTurn";

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
      console.log("unhandled", type);
  }
};

const useSocket = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [socket, setSocket] = useState();
  const [yourSuggestions, setYourSuggestions] = useState([]);
  useEffect(() => {
    console.log("creating a socket connection!");
    const socket = io({
      path: `${process.env.PUBLIC_URL}/socket.io`,
    });
    setSocket(socket);
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("event", (data) => {
      console.log(data);
    });
    [
      "JOINED_GROUP",
      "USER_LIST",
      "NEW_SUGGESTION",
      "NEW_TURN",
      "NEXT_SUGGESTION",
      "LATEST_SCORES",
    ].forEach((type) => {
      socket.on(type, (data) => dispatch({ type, data }));
    });
    return () => {
      console.log(`Closing connection to ${socket && socket.id}`);
      socket.close();
    };
  }, []);

  const startGroup = () => {
    socket.emit("START_GROUP", {});
  };
  const joinGroup = (groupID) => {
    socket.emit("JOIN_GROUP", { groupID });
  };
  const addSuggestion = (suggestion) => {
    if (
      suggestion &&
      suggestion.length &&
      !yourSuggestions.includes(suggestion)
    ) {
      socket.emit("ADD_SUGGESTION", { suggestion });
      setYourSuggestions((prev) => [...prev, suggestion]);
    }
  };
  const startGame = () => {
    socket.emit("START_GAME", {});
  };
  const requestSuggestion = () => {
    console.log(state.currentSuggestion);
    socket && socket.emit("REQUEST_SUGGESTION", {});
  };
  const guessCorrectly = (name) => {
    socket && socket.emit("GUESS_CORRECTLY", { name });
  };
  const skip = (name) => {
    socket && socket.emit("SKIP", { name });
  };
  const endTurn = () => {
    // setCurrentSuggestion(null); TODO is this ok?
    socket.emit("END_TURN", {});
  };

  const {
    turn,
    groupID,
    users,
    currentSuggestion,
    scores,
    suggestionCount,
  } = state;
  const user = socket && users.find((u) => u.clientID === socket.id);
  const { round, describer } = turn;
  return {
    socket,
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

const UserList = ({ user, users }) => (
  <section>
    <h2>Players</h2>
    <ul className="flex gap-m">
      {users.map((u) => (
        <li key={u.clientID} className="padding-m bg-light">
          {u.clientID === user?.clientID
            ? (
              <strong>{u.username} (you)</strong>
            )
            : (
              u.username
            )}
        </li>
      ))}
    </ul>
  </section>
);

const RoundZero = ({ gameState }) => {
  const {
    socket,
    addSuggestion,
    yourSuggestions,
    startGame,
    suggestionCount,
    user,
  } = gameState;
  if (!user) {
    return <Signup socket={socket} />;
  }
  return (
    <>
      <Suggestions
        yourSuggestions={yourSuggestions}
        addSuggestion={addSuggestion}
        count={suggestionCount}
      />
      <StartGame startGame={startGame} />
    </>
  );
};

const Turn = ({ describer }) => {
  return (
    <>
      <p>
        It's {describer.team}'s turn, and {describer.username} is describing.
      </p>
    </>
  );
};

const ROUND_DESCRIPTIONS = {
  1: "In Round 1, you can use as many words as you need to describe the name you draw.",
  2: "In Round 2, you can only use a single word. If it helps, you can say it multiple times.",
  3: "In Round 3, you cannot make a sound! You must act out the name instead.",
};

const Round = ({ gameState }) => {
  const {
    user,
    describer,
    requestSuggestion,
    currentSuggestion,
    skip,
    guessCorrectly,
    round,
    endTurn,
  } = gameState;
  return (
    <section>
      <h2>Round {round}</h2>
      <p>{ROUND_DESCRIPTIONS[round]}</p>
      {user.clientID === describer.clientID
        ? (
          <YourTurn
            requestSuggestion={requestSuggestion}
            suggestion={currentSuggestion}
            guessCorrectly={guessCorrectly}
            skip={skip}
            endTurn={endTurn}
          />
        )
        : (
          <Turn describer={describer} />
        )}
    </section>
  );
};

const GameOver = ({ scores }) => {
  const ordered = scores.sort(
    (a, b) => b.correct - a.correct || a.skips - b.skips,
  );
  return (
    <>
      <h2>Congrats to {ordered[0].name}!</h2>
      <table>
        <thead>
          <th>Team</th>
          <th>Points</th>
          <th>Skips</th>
        </thead>
        {ordered.map((team) => (
          <tr key={team.name}>
            <td>{team.name}</td>
            <td>{team.correct}</td>
            <td>{team.skips}</td>
          </tr>
        ))}
      </table>
    </>
  );
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
