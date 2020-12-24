const StartGame = ({ startGame, numTeams, turnDuration }) => {
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
        <button type="button" onClick={startGame}>
          Start
        </button>
      </div>
    </section>
  );
};

export default StartGame;
