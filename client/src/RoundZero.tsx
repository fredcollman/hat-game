import { useEffect } from "react";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import usePerform from "./usePerform";
import GroupInfo from "./GroupInfo";
import { ConfigureGamePhase } from "./game";
import {
  loadGroupInfo,
  notifyGroupUpdated,
  notifyTurnStarted,
  startGame,
} from "./actions";
import { gql, useSubscription } from "@apollo/client";
import { GAME_DETAILS, GroupDetails, TURN_DETAILS, TurnDetails } from "./dto";

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

const TURN_STARTED_SUBSCRIPTION = gql`
  subscription OnTurnStarted($groupID: String!) {
    turnStarted(groupID: $groupID) {
      ...TurnDetails
    }
  }
  ${TURN_DETAILS}
`;

interface GroupSubscriptionResult {
  groupUpdated: GroupDetails;
}

interface TurnSubscriptionResult {
  turnStarted: TurnDetails;
}

const RoundZero = ({ state }: Props) => {
  const perform = usePerform();
  const { suggestionCount, groupID, teams, turnDurationSeconds } = state;

  useEffect(() => {
    if (groupID) {
      perform(loadGroupInfo(groupID));
    }
  }, [perform, groupID]);
  useSubscription<GroupSubscriptionResult>(GROUP_UPDATED_SUBSCRIPTION, {
    variables: { groupID },
    onSubscriptionData: ({ subscriptionData }) =>
      subscriptionData.data &&
      perform(notifyGroupUpdated(subscriptionData.data.groupUpdated)),
  });
  useSubscription<TurnSubscriptionResult>(TURN_STARTED_SUBSCRIPTION, {
    variables: { groupID },
    onSubscriptionData: ({ subscriptionData }) => {
      subscriptionData.data &&
        perform(notifyTurnStarted(subscriptionData.data.turnStarted));
    },
  });

  const doStartGame = () => {
    perform(startGame(groupID));
  };

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
        startGame={doStartGame}
      />
    </>
  );
};

export default RoundZero;
