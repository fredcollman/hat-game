import { useEffect, useState } from "react";
import Countdown from "./Countdown";

const TURN_DURATION = 60;
const COUNTDOWN_DURATION = 3;

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
    <div className="stack-m center-text">
      <div className="center-text paper">{suggestion}</div>
      <div className="stack-h-m">
        <button
          className="negative"
          type="button"
          onClick={handleSkip}
          disabled={submitted}
        >
          Skip
        </button>
        <button type="button" onClick={handleGuess} disabled={submitted}>
          Got It!
        </button>
      </div>
      <div>
        Time Remaining:{" "}
        <strong>
          <Countdown from={TURN_DURATION} onComplete={endTurn} />
        </strong>
      </div>
    </div>
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
    <section>
      <h2>It's your turn!</h2>
      {status === "WAITING" && (
        <div className="center-text">
          <button type="button" onClick={beginTurn}>
            Start
          </button>
        </div>
      )}
      {status === "STARTING" && (
        <div>
          <p>
            Get ready. Your turn starts in{" "}
            <strong>
              <Countdown from={COUNTDOWN_DURATION} onComplete={showName} />
            </strong>
            .
          </p>
        </div>
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
    </section>
  );
};

export default YourTurn;
