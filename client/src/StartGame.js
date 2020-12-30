import { pluralise } from "./utils";

const StartGame = ({
  startGame,
  numTeams,
  turnDuration,
  suggestionCount,
  users,
}) => {
  const numPlayers = users.length;
  const hasSuggestions = suggestionCount > 0;
  const hasEnoughPlayers = numPlayers >= numTeams;
  const allowStart = hasSuggestions && hasEnoughPlayers;
  const tryStartGame = () => {
    if (!hasEnoughPlayers) {
      window.alert(
        `Unable to start the game because there are ${numTeams} teams but only ${numPlayers} ${
          pluralise(
            numPlayers,
            "player",
          )
        }.`,
      );
    } else if (!hasSuggestions) {
      window.alert(
        "Unable to start the game because there are no suggestions in the hat.",
      );
    } else {
      startGame();
    }
  };
  return (
    <section>
      <h2>Start Game</h2>
      <p>
        Once everyone has joined and submitted some names, click below to start
        the game.
      </p>
      <p>
        There will be <strong>{numTeams} teams
        </strong>. Each player's turn will last <strong>
          {turnDuration} seconds
        </strong>.
      </p>
      <div className="center-text">
        <button
          type="button"
          onClick={tryStartGame}
          aria-disabled={!allowStart}
        >
          Start
        </button>
      </div>
    </section>
  );
};

export default StartGame;
