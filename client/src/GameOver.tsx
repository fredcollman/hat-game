import { isThisTeam } from "./utils";
import { GameOverPhase } from "./game";
import GroupInfo from "./GroupInfo";

interface Props {
  state: GameOverPhase;
}

const GameOver = ({ state }: Props) => {
  const { scores } = state;
  const ordered = scores.sort(
    (a, b) => b.correct - a.correct || a.skips - b.skips,
  );
  return (
    <>
      <GroupInfo state={state} />
      <section>
        <h2>Congrats to {ordered[0].name}!</h2>
        <table
          className="width-m grid grid-equal-columns"
          style={{ ["--columns" as any]: 3 }}
        >
          <thead>
            <tr>
              <th className="justify-self-start">Team</th>
              <th className="justify-self-end">Points</th>
              <th className="justify-self-end">Skips</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((team) => (
              <tr
                className={isThisTeam(state, team.name) ? "text-highlight" : ""}
                key={team.name}
              >
                <td className="justify-self-start">{team.name}</td>
                <td className="justify-self-end">{team.correct}</td>
                <td className="justify-self-end">{team.skips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default GameOver;
