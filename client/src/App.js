import { useEffect, useState } from "react";
import "./App.css";
import Signup from "./Signup";
import { io } from "socket.io-client";

function App() {
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState();
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
    socket.on("USER_LIST", ({ users }) => {
      setUsers(users);
    });
  }, []);
  return (
    <div>
      <header>
        <h1>The Hat Game</h1>
      </header>
      <main>
        <Signup socket={socket} />
        <ul>
          {users.map((u) => (
            <li key={u.clientID}>{u.username}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
