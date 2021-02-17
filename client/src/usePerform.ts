import { Dispatch, useCallback } from "react";
import { Socket } from "socket.io-client";
import { ApolloClient, useApolloClient } from "@apollo/client";
import useSocket from "./useSocket";
import useDispatch from "./useDispatch";
import { Message } from "./utils";

interface PerformanceContext {
  socket: Socket;
  dispatch: Dispatch<Message>;
  apollo: ApolloClient<object>;
}

export type Action<Result extends unknown> = (
  context: PerformanceContext,
) => Result;

const usePerform = <Result extends unknown>() => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const apollo = useApolloClient();
  return useCallback(
    (action: Action<Result>) => {
      if (socket && dispatch) {
        action({ socket, dispatch, apollo });
      }
    },
    [socket, dispatch, apollo],
  );
};

export default usePerform;
