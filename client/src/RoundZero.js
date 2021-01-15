import Signup from "./Signup";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import useSender from "./useSender";

const RoundZero = ({ gameState }) => {
  const setUsername = useSender("SET_USERNAME");
  const startGame = useSender("START_GAME");
  const { state, user } = gameState;
  const {
    suggestionCount,
    yourSuggestions,
    numTeams,
    turnDurationSeconds,
    users,
  } = state;

  if (!user) {
    return <Signup setUsername={setUsername} />;
  }
  return (
    <>
      <Suggestions yourSuggestions={yourSuggestions} count={suggestionCount} />
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
