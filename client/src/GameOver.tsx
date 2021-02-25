import { gql, useQuery } from "@apollo/client";
import { isThisTeam } from "./utils";
import { GameOverPhase } from "./game";
import GroupInfo from "./GroupInfo";
import { GAME_DETAILS, GameDetails } from "./dto";

interface Props {
  state: GameOverPhase;
}

const GAME = gql`
  query loadGame($groupID: String!) {
    game(id: $groupID) {
      ...GameDetails
    }
  }
  ${GAME_DETAILS}
`;

const GameOver = ({ state }: Props) => {
  const { groupID } = state;
  const { data } = useQuery<{ game: GameDetails }, { groupID: string }>(GAME, {
    variables: { groupID },
    fetchPolicy: "network-only",
  });
  console.log("GAME OVER", data);

  if (!data) return <>Loading...</>;

  const { scores } = data.game;
  const ordered = [...scores].sort(
    (a, b) => b.correct - a.correct || a.skips - b.skips,
  );
  console.log("GAME OVER ORDERED", ordered);
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
