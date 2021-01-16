import { Socket } from "socket.io-client";
import useSocket from "./useSocket";

interface PerformanceContext {
  socket: Socket;
}

export type Action<Result extends unknown> = (
  context: PerformanceContext,
) => Result;

const usePerform = <Result extends unknown>() => {
  const socket = useSocket();
  return (action: Action<Result>) => (socket ? action({ socket }) : null);
};

export default usePerform;
