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
  const elapsed = now.valueOf() - start.valueOf();
  return { elapsed, tick };
};

const useInterval = (func: () => void, ms: number) => {
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

interface Props {
  from: number;
  onComplete: () => void;
}

const useCountdown = ({ from, onComplete }: Props) => {
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

const Countdown = ({ from, onComplete }: Props) => {
  const { remaining } = useCountdown({ from, onComplete });
  return <>{remaining}</>;
};

export default Countdown;
