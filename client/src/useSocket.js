import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  useEffect(() => {
    console.log("creating a socket connection via SocketProvider!");
    const socket = io({
      path: `${process.env.PUBLIC_URL}/socket.io`,
    });
    setSocket(socket);
    socket.on("connect", () => {
      console.log("connected via SocketProvider");
    });
    return () => {
      console.log(`Closing connection to ${socket && socket.id}`);
      socket.close();
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default useSocket;
