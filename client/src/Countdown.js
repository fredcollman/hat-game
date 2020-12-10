import { useEffect, useState } from "react";

const Countdown = ({ from, onComplete }) => {
  const [timer, setTimer] = useState(from);
  useEffect(() => {
    // console.log("tick");
    if (timer <= 0) {
      onComplete();
    } else {
      const timeout = setTimeout(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [timer, onComplete]);
  return <>{timer}</>;
};

export default Countdown;
