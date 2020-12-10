import { useEffect, useState } from "react";
import "./App.css";
import Signup from "./Signup";
import { io } from "socket.io-client";

const useSocket = () => {
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
    socket.on("WELCOME", ({ users }) => {
      setUsers(users);
    });
    socket.on("USER_LIST", ({ users }) => {
      setUsers(users);
    });
    return () => {
      console.log(`Closing connection to ${socket && socket.id}`);
      socket.close();
    };
  }, []);
  return { socket, users };
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
  const { socket, users } = useSocket();
  const user = socket && users.find((u) => u.clientID === socket.id);
  return (
    <div>
      <header>
        <h1>The Hat Game</h1>
      </header>
      <main>
        {user ? null : <Signup socket={socket} />}
        <UserList users={users} user={user} />
      </main>
    </div>
  );
}

export default App;
