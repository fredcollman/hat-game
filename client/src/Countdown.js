import { useEffect, useReducer } from "react";

const useCountdown = ({ from, onComplete }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "TICK":
        const completed = action.now - state.start > 1000 * from;
        return { ...state, now: action.now, completed };
      default:
        return state;
    }
  };
  const init = () => {
    const start = new Date();
    return {
      start,
      now: start,
      completed: false,
    };
  };

  const [state, dispatch] = useReducer(reducer, null, init);
  const { start, now, completed } = state;
  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({ type: "TICK", now: new Date() });
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);
  useEffect(() => {
    if (completed) {
      console.log("completing...");
      onComplete();
    }
  }, [completed, onComplete]);

  const elapsed = now - start;
  const remainingMs = 1000 * from - elapsed;
  const remaining = Math.ceil(remainingMs / 1000);
  return { remaining };
};

const Countdown = ({ from, onComplete }) => {
  const { remaining } = useCountdown({ from, onComplete });
  return remaining;
};

export default Countdown;
