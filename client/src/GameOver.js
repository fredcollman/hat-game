const GameOver = ({ scores }) => {
  const ordered = scores.sort(
    (a, b) => b.correct - a.correct || a.skips - b.skips,
  );
  return (
    <>
      <h2>Congrats to {ordered[0].name}!</h2>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Points</th>
            <th>Skips</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((team) => (
            <tr key={team.name}>
              <td>{team.name}</td>
              <td>{team.correct}</td>
              <td>{team.skips}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default GameOver;
