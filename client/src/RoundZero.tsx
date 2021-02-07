import { useEffect } from "react";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import usePerform from "./usePerform";
import useSender from "./useSender";
import GroupInfo from "./GroupInfo";
import Loading from "./Loading";
import { ConfigureGamePhase } from "./game";
import { loadGroupInfo } from "./actions";
import { gql, useQuery } from "@apollo/client";

interface Props {
  state: ConfigureGamePhase;
}

const GAME = gql`
  query loadGame($groupID: String) {
    game(id: $groupID) {
      round
      teams {
        name
        members {
          username
        }
      }
      users {
        username
      }
      options {
        turnDurationSeconds
      }
    }
  }
`;

interface GameQuery {
  game: {
    round: number;
    teams: {
      name: string;
      members: {
        username: string;
      }[];
    }[];
    options: { turnDurationSeconds: number };
  };
}

const RoundZero = ({ state }: Props) => {
  const perform = usePerform();
  const startGame = useSender("START_GAME");
  const { suggestionCount, groupID } = state;
  const result = useQuery<GameQuery>(GAME, { variables: { groupID } });
  console.log(result);

  useEffect(() => {
    if (groupID) {
      perform(loadGroupInfo(groupID));
    }
  }, [perform, groupID]);

  if (result.loading) return <Loading />;
  if (!result.data) return <>Error: data not found</>;

  const { teams, options } = result.data.game;
  const numTeams = teams.length;
  const numPlayers = teams
    .map((t) => t.members.length)
    .reduce((acc, val) => acc + val, 0);
  const { turnDurationSeconds } = options;

  return (
    <>
      <GroupInfo state={state} />
      <Suggestions count={suggestionCount} />
      <StartGame
        suggestionCount={suggestionCount}
        numPlayers={numPlayers}
        numTeams={numTeams}
        turnDuration={turnDurationSeconds}
        startGame={startGame}
      />
    </>
  );
};

export default RoundZero;
