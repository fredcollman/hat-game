import { PlayPhase } from "./game";
import GroupInfo from "./GroupInfo";
import Round from "./Round";

interface Props {
  state: PlayPhase;
}

const GameInProgress = ({ state }: Props) => {
  return (
    <>
      <GroupInfo state={state} />
      <Round state={state} />
    </>
  );
};

export default GameInProgress;
