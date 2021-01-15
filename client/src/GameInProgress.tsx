import { GameState } from "./game";
import GroupInfo from "./GroupInfo";
import Round from "./Round";

interface Props {
  gameState: GameState;
}

const GameInProgress = ({ gameState }: Props) => {
  const { state } = gameState;
  return (
    <>
      <GroupInfo state={state} />
      <Round gameState={gameState} />
    </>
  );
};

export default GameInProgress;
