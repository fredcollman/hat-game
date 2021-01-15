import { GameState } from "./game";
import SelectGroup from "./SelectGroup";
import GameInProgress from "./GameInProgress";
import GameOver from "./GameOver";
import RoundZero from "./RoundZero";
import Signup from "./Signup";
import { assertNever } from "./utils";

interface Props {
  gameState: GameState;
}

const CurrentPhase = ({ gameState }: Props) => {
  const { state } = gameState;
  const { phase } = state;
  switch (phase) {
    case "CHOOSE_GROUP":
      return <SelectGroup />;
    case "SIGN_UP":
      return <Signup />;
    case "CONFIGURE_GAME":
      return <RoundZero gameState={gameState} />;
    case "PLAY":
      return <GameInProgress gameState={gameState} />;
    case "GAME_OVER":
      return <GameOver state={state} />;
    default:
      return assertNever(phase);
  }
};

export default CurrentPhase;
