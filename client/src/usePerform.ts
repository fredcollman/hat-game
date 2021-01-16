import { Dispatch } from "react";
import { Socket } from "socket.io-client";
import useSocket from "./useSocket";
import useDispatch from "./useDispatch";
import { Message } from "./utils";

interface PerformanceContext {
  socket: Socket;
  dispatch: Dispatch<Message>;
}

export type Action<Result extends unknown> = (
  context: PerformanceContext,
) => Result;

const usePerform = <Result extends unknown>() => {
  const socket = useSocket();
  const dispatch = useDispatch();
  return (action: Action<Result>) => {
    if (socket && dispatch) {
      action({ socket, dispatch });
    }
  };
};

export default usePerform;
