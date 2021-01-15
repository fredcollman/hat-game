import { useEffect, useState } from "react";

const REFRESH_MS = 100;

const init = () => {
  const start = new Date();
  return {
    start,
    now: start,
  };
};

const useTick = () => {
  const [state, setState] = useState(init);
  const { start, now } = state;
  const tick = () => {
    setState((prev) => ({ ...prev, now: new Date() }));
  };
  const elapsed = now - start;
  return { elapsed, tick };
};

const useInterval = (func, ms) => {
  useEffect(() => {
    const interval = window.setInterval(func, ms);
    return () => {
      clearInterval(interval);
    };
  }, [func, ms]);
};

const useTimer = () => {
  const { tick, elapsed } = useTick();
  useInterval(tick, REFRESH_MS);
  return { elapsed };
};

const useCountdown = ({ from, onComplete }) => {
  const { elapsed } = useTimer();
  const remainingMs = 1000 * from - elapsed;
  const completed = remainingMs <= 0;

  useEffect(() => {
    if (completed) {
      // console.log("completing...");
      onComplete();
    }
  }, [completed, onComplete]);
  return { remaining: Math.ceil(remainingMs / 1000) };
};

const Countdown = ({ from, onComplete }) => {
  const { remaining } = useCountdown({ from, onComplete });
  return <>{remaining}</>;
};

export default Countdown;
