import { useEffect } from "react";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import usePerform from "./usePerform";
import useSender from "./useSender";
import GroupInfo from "./GroupInfo";
import Loading from "./Loading";
import { ConfigureGamePhase } from "./game";
import { loadGroupInfo, notifyGroupUpdated } from "./actions";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { GAME_DETAILS, GameDetails, GroupDetails } from "./dto";

interface Props {
  state: ConfigureGamePhase;
}

const GAME = gql`
  query loadGame($groupID: String!) {
    game(id: $groupID) {
      ...GameDetails
    }
  }
  ${GAME_DETAILS}
`;

interface GameQueryResult {
  game: GameDetails;
}

const GROUP_UPDATED_SUBSCRIPTION = gql`
  subscription OnGroupUpdated($groupID: String!) {
    groupUpdated(groupID: $groupID) {
      id
      game {
        ...GameDetails
      }
    }
  }
  ${GAME_DETAILS}
`;

interface SubscriptionResult {
  groupUpdated: GroupDetails;
}

const RoundZero = ({ state }: Props) => {
  const perform = usePerform();
  const startGame = useSender("START_GAME");
  const { suggestionCount, groupID } = state;
  const result = useQuery<GameQueryResult>(GAME, { variables: { groupID } });
  useSubscription<SubscriptionResult>(GROUP_UPDATED_SUBSCRIPTION, {
    variables: { groupID },
    onSubscriptionData: ({ subscriptionData }) =>
      subscriptionData.data &&
      perform(notifyGroupUpdated(subscriptionData.data.groupUpdated)),
  });

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
      <Suggestions count={suggestionCount} groupID={groupID} />
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
