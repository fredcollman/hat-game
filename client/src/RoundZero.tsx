import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import useSender from "./useSender";
import GroupInfo from "./GroupInfo";
import { State } from "./game";

interface Props {
  state: State;
}

const RoundZero = ({ state }: Props) => {
  const startGame = useSender("START_GAME");
  const { suggestionCount, numTeams, turnDurationSeconds, users } = state;

  return (
    <>
      <GroupInfo state={state} />
      <Suggestions count={suggestionCount} />
      <StartGame
        suggestionCount={suggestionCount}
        users={users}
        numTeams={numTeams}
        turnDuration={turnDurationSeconds}
        startGame={startGame}
      />
    </>
  );
};

export default RoundZero;
