import { isThisPlayer } from "./utils";
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
        It's <strong>{describer.team}</strong>'s turn, and{" "}
        <strong>{describer.username}</strong> is describing.
      </p>
    </>
  );
};

const Round = ({ gameState }) => {
  const { state, actions } = gameState;
  const { describer, round, currentSuggestion } = state;
  return (
    <section className="stack-m">
      <h2>Round {round}</h2>
      <p>{ROUND_DESCRIPTIONS[round]}</p>
      {isThisPlayer(state, describer)
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