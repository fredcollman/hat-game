import Signup from "./Signup";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import useSender from "./useSender";
import { GameState } from "./game";

interface Props {
  gameState: GameState;
}

const RoundZero = ({ gameState }: Props) => {
  const setUsername = useSender("SET_USERNAME");
  const startGame = useSender("START_GAME");
  const { state, user } = gameState;
  const { suggestionCount, numTeams, turnDurationSeconds, users } = state;

  if (!user) {
    return <Signup setUsername={setUsername} />;
  }
  return (
    <>
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
