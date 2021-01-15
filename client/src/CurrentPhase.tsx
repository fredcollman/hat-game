import { GameState } from "./game";
import SelectGroup from "./SelectGroup";
import GroupInfo from "./GroupInfo";
import GameOver from "./GameOver";
import RoundZero from "./RoundZero";
import Round from "./Round";

interface Props {
  gameState: GameState;
}

const CurrentPhase = ({ gameState }: Props) => {
  const { state } = gameState;
  const { groupID, round } = state;
  return groupID
    ? (
      <>
        <GroupInfo state={state} />
        {round === 0 && <RoundZero gameState={gameState} />}
        {round > 0 && round < 4 && <Round gameState={gameState} />}
        {round === 4 && <GameOver state={state} />}
      </>
    )
    : (
      <SelectGroup />
    );
};

export default CurrentPhase;
