import { useEffect, useState } from "react";

const init = () => {
  const start = new Date();
  return {
    start,
    now: start,
    completed: false,
  };
};

const useTick = ({ from }) => {
  const [state, setState] = useState(init);
  const { start, now, completed } = state;
  const tick = () => {
    const now = new Date();
    setState((prev) => {
      const completed = now - prev.start > 1000 * from;
      return { ...prev, now, completed };
    });
  };

  const elapsed = now - start;
  const remainingMs = 1000 * from - elapsed;
  const remaining = Math.ceil(remainingMs / 1000);

  return { start, now, completed, remaining, tick };
};

const useInterval = (func, ms) => {
  useEffect(() => {
    const interval = window.setInterval(func, ms);
    return () => {
      clearInterval(interval);
    };
  }, [func, ms]);
};

const useCountdown = ({ from, onComplete }) => {
  const { completed, tick, remaining } = useTick({ from });
  useInterval(tick, 100);
  useEffect(() => {
    if (completed) {
      console.log("completing...");
      onComplete();
    }
  }, [completed, onComplete]);
  return { remaining };
};

const Countdown = ({ from, onComplete }) => {
  const { remaining } = useCountdown({ from, onComplete });
  return remaining;
};

export default Countdown;
