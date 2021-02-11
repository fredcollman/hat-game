import { useEffect, useState } from "react";
import Countdown from "./Countdown";
import useSender from "./useSender";
import usePerform from "./usePerform";
import { guessCorrectly, requestSuggestion, skip } from "./actions";

const COUNTDOWN_DURATION = 3;

interface DescribeProps {
  turnDuration: number;
  suggestion: string;
  endTurn: () => void;
  groupID: string;
}

const Describe = ({
  turnDuration,
  suggestion,
  endTurn,
  groupID,
}: DescribeProps) => {
  const perform = usePerform();
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    setSubmitted(false);
  }, [suggestion]);
  const handleSkip = () => {
    setSubmitted(true);
    perform(skip({ groupID, suggestion }));
  };
  const handleGuess = () => {
    setSubmitted(true);
    perform(guessCorrectly({ groupID, suggestion }));
  };
  return (
    <div className="stack-m center-text">
      <div className="center-text paper padding-xl">{suggestion}</div>
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
          <Countdown from={turnDuration} onComplete={endTurn} />
        </strong>
      </div>
    </div>
  );
};

interface Props {
  turnDuration: number;
  suggestion: string | null;
  groupID: string;
}

const YourTurn = ({ turnDuration, suggestion, groupID }: Props) => {
  const [status, setStatus] = useState("WAITING");
  const perform = usePerform();
  const sendEndTurn = useSender("END_TURN");
  useEffect(() => {
    if (!suggestion) {
      perform(requestSuggestion(groupID));
    }
  }, [suggestion, perform, groupID]);
  const beginTurn = () => {
    setStatus("STARTING");
  };
  const showName = () => {
    setStatus("PLAYING");
  };
  const finishTurn = () => {
    setStatus("FINISHED");
    sendEndTurn();
  };
  if (!suggestion) {
    return <>Loading...</>;
  }
  return (
    <>
      <h3>It's your turn!</h3>
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
          turnDuration={turnDuration}
          suggestion={suggestion}
          endTurn={finishTurn}
          groupID={groupID}
        />
      )}
      {status === "FINISHED" && "You can relax now, your turn is over."}
    </>
  );
};

export default YourTurn;
