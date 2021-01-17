import { useEffect } from "react";
import StartGame from "./StartGame";
import Suggestions from "./Suggestions";
import usePerform from "./usePerform";
import useSender from "./useSender";
import GroupInfo from "./GroupInfo";
import { ConfigureGamePhase } from "./game";
import { loadGroupInfo } from "./actions";

interface Props {
  state: ConfigureGamePhase;
}

const RoundZero = ({ state }: Props) => {
  const perform = usePerform();
  const startGame = useSender("START_GAME");
  const {
    suggestionCount,
    numTeams,
    turnDurationSeconds,
    users,
    groupID,
  } = state;

  useEffect(() => {
    console.log(perform);
    if (groupID) {
      perform(loadGroupInfo(groupID));
    }
  }, [perform, groupID]);

  return (
    <>
      <GroupInfo state={state} />
      <Suggestions count={suggestionCount} />
      <StartGame
        suggestionCount={suggestionCount}
        users={users}
        numTeams={numTeams}
        turnDuration={turnDurationSeconds}
        startGame={startGame}
      />
    </>
  );
};

export default RoundZero;
