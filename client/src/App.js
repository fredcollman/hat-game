import { useEffect, useState } from "react";
import "./App.css";
import Signup from "./Signup";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import { io } from "socket.io-client";

const useSocket = () => {
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState();
  const [yourSuggestions, setYourSuggestions] = useState([]);
  const [suggestionCount, setSuggestionCount] = useState(0);
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

  return {
    socket,
    users,
    addSuggestion,
    yourSuggestions,
    startGame,
    suggestionCount,
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

function App() {
  const {
    socket,
    users,
    addSuggestion,
    yourSuggestions,
    startGame,
    suggestionCount,
  } = useSocket();
  const user = socket && users.find((u) => u.clientID === socket.id);
  return (
    <div>
      <header>
        <h1>The Hat Game</h1>
      </header>
      <main>
        {user
          ? (
            <>
              <Suggestions
                yourSuggestions={yourSuggestions}
                addSuggestion={addSuggestion}
                count={suggestionCount}
              />
              <StartGame startGame={startGame} />
            </>
          )
          : (
            <Signup socket={socket} />
          )}
        <UserList users={users} user={user} />
      </main>
    </div>
  );
}

export default App;
