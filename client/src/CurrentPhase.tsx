import { GameState } from "./game";
import SelectGroup from "./SelectGroup";
import GroupInfo from "./GroupInfo";
import GameOver from "./GameOver";
import RoundZero from "./RoundZero";
import Round from "./Round";
import Signup from "./Signup";

interface Props {
  gameState: GameState;
}

const CurrentPhase = ({ gameState }: Props) => {
  const { state } = gameState;
  const { round, phase } = state;
  switch (phase) {
    case "CHOOSE_GROUP":
      return <SelectGroup />;
    case "SIGN_UP":
      return <Signup />;
    case "CONFIGURE_GAME":
    case "PLAY":
    case "GAME_OVER":
    default:
      return (
        <>
          <GroupInfo state={state} />
          {round === 0 && <RoundZero gameState={gameState} />}
          {round > 0 && round < 4 && <Round gameState={gameState} />}
          {round === 4 && <GameOver state={state} />}
        </>
      );
  }
};

export default CurrentPhase;
