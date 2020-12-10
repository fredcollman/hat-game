import { useState } from "react";
import Countdown from "./Countdown";

const YourTurn = () => {
  const [status, setStatus] = useState("WAITING");
  const beginTurn = () => {
    setStatus("STARTING");
  };
  const showName = () => {
    setStatus("PLAYING");
  };
  return (
    <>
      <p>It's your turn!</p>
      {status === "WAITING" && (
        <button type="button" onClick={beginTurn}>
          Start
        </button>
      )}
      {status === "STARTING" && <Countdown from={3} onComplete={showName} />}
      {status === "PLAYING" && "playing"}
    </>
  );
};

export default YourTurn;
