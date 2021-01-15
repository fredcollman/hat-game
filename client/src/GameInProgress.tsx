import { State } from "./game";
import GroupInfo from "./GroupInfo";
import Round from "./Round";

interface Props {
  state: State;
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
