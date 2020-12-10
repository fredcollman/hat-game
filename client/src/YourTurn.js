import { useEffect, useState } from "react";
import Countdown from "./Countdown";

const Describe = ({ suggestion, endTurn, guessCorrectly, skip }) => {
  return (
    <>
      <div>{suggestion}</div>
      <button type="button" onClick={() => skip(suggestion)}>
        Skip
      </button>
      <button type="button" onClick={() => guessCorrectly(suggestion)}>
        Got It!
      </button>
      <div>
        Time Remaining: <Countdown from={60} onComplete={endTurn} />
      </div>
    </>
  );
};

const YourTurn = ({ suggestion, requestSuggestion, guessCorrectly, skip }) => {
  const [status, setStatus] = useState("WAITING");
  useEffect(() => {
    requestSuggestion();
  }, [requestSuggestion]);
  const beginTurn = () => {
    setStatus("STARTING");
  };
  const showName = () => {
    setStatus("PLAYING");
  };
  const endTurn = () => {
    setStatus("FINISHED");
  };
  if (!suggestion) {
    return "Loading...";
  }
  return (
    <>
      <p>It's your turn!</p>
      {status === "WAITING" && (
        <button type="button" onClick={beginTurn}>
          Start
        </button>
      )}
      {status === "STARTING" && <Countdown from={3} onComplete={showName} />}
      {status === "PLAYING" && (
        <Describe
          suggestion={suggestion}
          guessCorrectly={guessCorrectly}
          skip={skip}
          endTurn={endTurn}
        />
      )}
      {status === "FINISHED" && "You can relax now, your turn is over."}
    </>
  );
};

export default YourTurn;
