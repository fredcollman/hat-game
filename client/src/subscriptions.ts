import { gql, useSubscription } from "@apollo/client";
import usePerform from "./usePerform";
import { GAME_DETAILS, GroupDetails, TURN_DETAILS, TurnDetails } from "./dto";
import {
  loadGroupInfo,
  notifyGroupUpdated,
  notifyTurnStarted,
  startGame,
} from "./actions";

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

export const useGroupUpdates = (groupID: string) => {
  const perform = usePerform();
  useSubscription<GroupSubscriptionResult>(GROUP_UPDATED_SUBSCRIPTION, {
    variables: { groupID },
    onSubscriptionData: ({ subscriptionData }) =>
      subscriptionData.data &&
      perform(notifyGroupUpdated(subscriptionData.data.groupUpdated)),
  });
};

export const useTurnStartNotifications = (groupID: string) => {
  console.log("subscribing to turn start");
  const perform = usePerform();
  useSubscription<TurnSubscriptionResult>(TURN_STARTED_SUBSCRIPTION, {
    variables: { groupID },
    onSubscriptionData: ({ subscriptionData }) => {
      console.log("turn started!", subscriptionData);
      subscriptionData.data &&
        perform(notifyTurnStarted(subscriptionData.data.turnStarted));
    },
  });
};
