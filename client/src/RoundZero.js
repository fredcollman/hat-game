import Signup from "./Signup";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";

const RoundZero = ({ gameState }) => {
  const { state, actions, user } = gameState;
  if (!user) {
    return <Signup setUsername={actions.setUsername} />;
  }
  return (
    <>
      <Suggestions
        yourSuggestions={state.yourSuggestions}
        addSuggestion={actions.addSuggestion}
        count={state.suggestionCount}
      />
      <StartGame startGame={actions.startGame} />
    </>
  );
};

export default RoundZero;
