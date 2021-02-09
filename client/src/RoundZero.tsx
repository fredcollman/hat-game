import { useEffect } from "react";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import usePerform from "./usePerform";
import useSender from "./useSender";
import GroupInfo from "./GroupInfo";
import { ConfigureGamePhase } from "./game";
import { loadGroupInfo, notifyGroupUpdated } from "./actions";
import { gql, useSubscription } from "@apollo/client";
import { GAME_DETAILS, GroupDetails } from "./dto";

interface Props {
  state: ConfigureGamePhase;
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
  const { suggestionCount, groupID, teams, turnDurationSeconds } = state;
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

  const numTeams = teams.length;
  const numPlayers = teams
    .map((t) => t.members.length)
    .reduce((acc, val) => acc + val, 0);

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
