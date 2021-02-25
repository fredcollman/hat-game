import { Dispatch, useCallback } from "react";
import { ApolloClient, useApolloClient } from "@apollo/client";
import useDispatch from "./useDispatch";
import { Message } from "./utils";

interface PerformanceContext {
  dispatch: Dispatch<Message>;
  apollo: ApolloClient<object>;
}

export type Action<Result extends unknown> = (
  context: PerformanceContext,
) => Result;

const usePerform = <Result extends unknown>() => {
  const dispatch = useDispatch();
  const apollo = useApolloClient();
  return useCallback(
    (action: Action<Result>) => {
      if (dispatch) {
        action({ dispatch, apollo });
      }
    },
    [dispatch, apollo],
  );
};

export default usePerform;
