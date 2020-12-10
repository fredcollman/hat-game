import { useEffect, useState } from "react";
import Countdown from "./Countdown";

const Describe = ({ suggestion, endTurn, guessCorrectly, skip }) => {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    setSubmitted(false);
  }, [suggestion]);
  const handleSkip = () => {
    setSubmitted(true);
    skip(suggestion);
  };
  const handleGuess = () => {
    setSubmitted(true);
    guessCorrectly(suggestion);
  };
  return (
    <>
      <div>{suggestion}</div>
      <button type="button" onClick={handleSkip} disabled={submitted}>
        Skip
      </button>
      <button type="button" onClick={handleGuess} disabled={submitted}>
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
    if (!suggestion) {
      requestSuggestion();
    }
  }, [suggestion, requestSuggestion]);
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
