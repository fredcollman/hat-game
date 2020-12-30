import Signup from "./Signup";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";

const RoundZero = ({ gameState }) => {
  const { state, actions, user } = gameState;
  const {
    suggestionCount,
    yourSuggestions,
    numTeams,
    turnDurationSeconds,
    users,
  } = state;
  if (!user) {
    return <Signup setUsername={actions.setUsername} />;
  }
  return (
    <>
      <Suggestions
        yourSuggestions={yourSuggestions}
        addSuggestion={actions.addSuggestion}
        count={suggestionCount}
      />
      <StartGame
        suggestionCount={suggestionCount}
        users={users}
        numTeams={numTeams}
        turnDuration={turnDurationSeconds}
        startGame={actions.startGame}
      />
    </>
  );
};

export default RoundZero;
