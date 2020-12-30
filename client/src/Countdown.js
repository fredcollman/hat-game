import { useEffect, useReducer, useState } from "react";

const Countdown = ({ from, onComplete }) => {
  const [start] = useState(new Date());
  const [now, setNow] = useState(start);
  const [completed, setCompleted] = useState(false);

  const elapsed = now - start;
  const remainingMs = 1000 * from - elapsed;
  const remaining = Math.ceil(remainingMs / 1000);

  useEffect(() => {
    if (completed) {
      // console.log("we are already done");
      return;
    }

    const adjustRemaining = () => {
      // console.log("adjust");
      const now = new Date();
      setNow(now);
      if (now - start > 1000 * from) {
        // console.log(now, "adjustRemaining says we are done");
        setCompleted(true);
        onComplete();
      }
    };

    const interval = window.setInterval(adjustRemaining, 100);
    // console.log("START", interval);
    return () => {
      // console.log("CLEAR", interval);
      clearInterval(interval);
    };
  }, [from, start, completed, onComplete]);

  return remaining;
};

export default Countdown;
