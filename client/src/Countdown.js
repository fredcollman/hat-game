import { useEffect, useReducer, useState } from "react";

const useCountdown = ({ from, onComplete }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "TICK":
        return { ...state, now: action.now };
      case "COMPLETE":
        return { ...state, completed: true };
      default:
        return state;
    }
  };

  const debugReduce = (state, action) => {
    // console.log("before reduce", state, action);
    const result = reducer(state, action);
    // console.log("after reduce", state, action);
    return result;
  };

  const init = () => {
    const start = new Date();
    return {
      start,
      now: start,
      completed: false,
    };
  };

  const [state, dispatch] = useReducer(debugReduce, null, init);
  return [state, dispatch];
};

const Countdown = ({ from, onComplete }) => {
  const [state, dispatch] = useCountdown({ from, onComplete });

  const elapsed = state.now - state.start;
  const remainingMs = 1000 * from - elapsed;
  const remaining = Math.ceil(remainingMs / 1000);

  useEffect(() => {
    if (state.completed) {
      // console.log("we are already done");
      return;
    }

    const adjustRemaining = () => {
      // console.log("adjust");
      const now = new Date();
      dispatch({ type: "TICK", now });
      if (now - state.start > 1000 * from) {
        // console.log(now, "adjustRemaining says we are done");
        dispatch({ type: "COMPLETE", onComplete });
      }
    };

    const interval = window.setInterval(adjustRemaining, 100);
    // console.log("START", interval);
    dispatch({ type: "START", interval });
    return () => {
      // console.log("CLEAR", interval);
      dispatch({ type: "CLEAR", interval });
      clearInterval(interval);
    };
  }, [from, state.start, state.completed, onComplete, dispatch]);

  useEffect(() => {
    if (state.completed) {
      onComplete();
    }
  }, [state.completed, onComplete]);

  return remaining;
};

export default Countdown;
