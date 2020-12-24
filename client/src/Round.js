import YourTurn from "./YourTurn";

const ROUND_DESCRIPTIONS = {
  1: "In Round 1, you can use as many words as you need to describe the name you draw.",
  2: "In Round 2, you can only use a single word. If it helps, you can say it multiple times.",
  3: "In Round 3, you cannot make a sound! You must act out the name instead.",
};

const Turn = ({ describer }) => {
  return (
    <>
      <p>
        It's {describer.team}'s turn, and {describer.username} is describing.
      </p>
    </>
  );
};

const Round = ({ gameState }) => {
  const { state, actions, user } = gameState;
  const { describer, currentSuggestion } = state;
  const round = state.turn.round;
  return (
    <section>
      <h2>Round {round}</h2>
      <p>{ROUND_DESCRIPTIONS[round]}</p>
      {user.clientID === describer.clientID
        ? (
          <YourTurn
            requestSuggestion={actions.requestSuggestion}
            suggestion={currentSuggestion}
            guessCorrectly={actions.guessCorrectly}
            skip={actions.skip}
            endTurn={actions.endTurn}
          />
        )
        : (
          <Turn describer={describer} />
        )}
    </section>
  );
};

export default Round;
