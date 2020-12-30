import { useEffect, useState } from "react";

const Countdown = ({ from, onComplete }) => {
  const [start] = useState(new Date());
  const [remaining, setRemaining] = useState(from * 1000);
  useEffect(() => {
    const checkDone = () => {
      const now = new Date();
      const elapsed = now - start;
      const remainingMs = 1000 * from - elapsed;
      const remaining = Math.ceil(remainingMs / 1000);
      setRemaining(remaining);
      if (remaining > 0) {
        const timeout = setTimeout(checkDone, 300);
        return () => clearTimeout(timeout);
      } else {
        onComplete();
      }
    };
    return checkDone();
  }, [start, from, onComplete]);
  return <div>{remaining}</div>;
};

export default Countdown;
