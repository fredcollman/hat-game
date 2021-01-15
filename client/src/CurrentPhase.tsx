import { State } from "./game";
import SelectGroup from "./SelectGroup";
import GameInProgress from "./GameInProgress";
import GameOver from "./GameOver";
import RoundZero from "./RoundZero";
import Signup from "./Signup";
import { assertNever } from "./utils";

interface Props {
  state: State;
}

const CurrentPhase = ({ state }: Props) => {
  const { phase } = state;
  switch (phase) {
    case "CHOOSE_GROUP":
      return <SelectGroup />;
    case "SIGN_UP":
      return <Signup />;
    case "CONFIGURE_GAME":
      return <RoundZero state={state} />;
    case "PLAY":
      return <GameInProgress state={state} />;
    case "GAME_OVER":
      return <GameOver state={state} />;
    default:
      return assertNever(phase);
  }
};

export default CurrentPhase;
