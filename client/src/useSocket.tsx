import { createContext, FC, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: FC = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
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
  if (!socket) {
    return <>{children}</>;
  }
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default useSocket;
