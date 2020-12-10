import { useEffect, useState } from "react";
import "./App.css";
import Signup from "./Signup";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import YourTurn from "./YourTurn";
import { io } from "socket.io-client";

const useSocket = () => {
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState();
  const [yourSuggestions, setYourSuggestions] = useState([]);
  const [suggestionCount, setSuggestionCount] = useState(0);
  const [turn, setTurn] = useState({
    round: 0,
    describer: null,
  });
  const [currentSuggestion, setCurrentSuggestion] = useState();
  useEffect(() => {
    console.log("creating a socket connection!");
    const socket = io();
    setSocket(socket);
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("event", (data) => {
      console.log(data);
    });
    socket.on("WELCOME", ({ users }) => {
      setUsers(users);
    });
    socket.on("USER_LIST", ({ users }) => {
      setUsers(users);
    });
    socket.on("NEW_SUGGESTION", ({ count }) => {
      setSuggestionCount(count);
    });
    socket.on("NEW_TURN", ({ round, describer }) => {
      setTurn({ round, describer });
    });
    socket.on("NEXT_SUGGESTION", ({ name }) => {
      console.log("NEXT_SUGGESTION:", name);
      setCurrentSuggestion(name);
    });
    socket.on("END_TURN", () => {
      console.log("TODO END_TURN");
    });
    return () => {
      console.log(`Closing connection to ${socket && socket.id}`);
      socket.close();
    };
  }, []);

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
    console.log(currentSuggestion);
    socket && socket.emit("REQUEST_SUGGESTION", {});
  };
  const guessCorrectly = (name) => {
    socket && socket.emit("GUESS_CORRECTLY", { name });
  };
  const skip = (name) => {
    socket && socket.emit("SKIP", { name });
  };

  // TODO remove hardcoded params
  // const describer = { clientID: "foo", username: "bar" };
  // const round = 1;
  // const user = describer;
  const user = socket && users.find((u) => u.clientID === socket.id);
  const { round, describer } = turn;
  return {
    socket,
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
  };
};

const UserList = ({ user, users }) => (
  <section>
    <h2>Players</h2>
    <ul>
      {users.map((u) => (
        <li key={u.clientID}>
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
          />
        )
        : (
          <Turn describer={describer} />
        )}
    </section>
  );
};

const App = () => {
  const gameState = useSocket();
  const { users, user, round } = gameState;
  return (
    <div>
      <header>
        <h1>The Hat Game</h1>
      </header>
      <main>
        {round === 0 && <RoundZero gameState={gameState} />}
        {round > 0 && <Round gameState={gameState} />}
        <UserList users={users} user={user} />
      </main>
    </div>
  );
};

export default App;
