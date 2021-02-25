import { useEffect } from "react";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import usePerform from "./usePerform";
import GroupInfo from "./GroupInfo";
import { ConfigureGamePhase } from "./game";
import { loadGroupInfo, startGame } from "./actions";
import { useGroupUpdates, useTurnStartNotifications } from "./subscriptions";

interface Props {
  state: ConfigureGamePhase;
}

const RoundZero = ({ state }: Props) => {
  const perform = usePerform();
  const { suggestionCount, groupID, teams, turnDurationSeconds } = state;

  useEffect(() => {
    if (groupID) {
      perform(loadGroupInfo(groupID));
    }
  }, [perform, groupID]);
  useGroupUpdates(groupID);
  useTurnStartNotifications(groupID);

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
