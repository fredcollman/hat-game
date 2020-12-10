import { useEffect, useState } from "react";
import Countdown from "./Countdown";

const TURN_DURATION = 6;
const COUNTDOWN_DURATION = 1;

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
        Time Remaining: <Countdown from={TURN_DURATION} onComplete={endTurn} />
      </div>
    </>
  );
};

const YourTurn = ({
  suggestion,
  requestSuggestion,
  guessCorrectly,
  skip,
  endTurn,
}) => {
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
  const finishTurn = () => {
    setStatus("FINISHED");
    endTurn();
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
      {status === "STARTING" && (
        <Countdown from={COUNTDOWN_DURATION} onComplete={showName} />
      )}
      {status === "PLAYING" && (
        <Describe
          suggestion={suggestion}
          guessCorrectly={guessCorrectly}
          skip={skip}
          endTurn={finishTurn}
        />
      )}
      {status === "FINISHED" && "You can relax now, your turn is over."}
    </>
  );
};

export default YourTurn;
