import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import useSender from "./useSender";
import GroupInfo from "./GroupInfo";
import { GameState } from "./game";

interface Props {
  gameState: GameState;
}

const RoundZero = ({ gameState }: Props) => {
  const startGame = useSender("START_GAME");
  const { state } = gameState;
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
