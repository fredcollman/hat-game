import {
  ChooseGroupPhase,
  ConfigureGamePhase,
  GameOverPhase,
  PlayPhase,
  SignUpPhase,
  State,
} from "./game";
import { assertNever } from "./utils";

export const initialize = (): State => ({
  phase: "CHOOSE_GROUP",
  clientID: null,
  groupID: null,
  users: [],
  teams: [],
  suggestionCount: 0,
  round: 0,
  describer: null,
  currentSuggestion: null,
  scores: [],
  turnDurationSeconds: 60,
  numTeams: 2,
});

interface Message {
  type: string;
  data: any;
}

const defaultReducer = (
  state: ChooseGroupPhase | SignUpPhase | ConfigureGamePhase | PlayPhase,
  { type, data }: Message,
): State => {
  switch (type) {
    case "SOCKET_CONNECTION":
      return { ...state, clientID: data };
    case "JOINED_GROUP":
      return {
        ...state,
        groupID: data.groupID,
        users: data.users,
        turnDurationSeconds: data?.options?.turnDurationSeconds,
        numTeams: data?.options?.teams,
        phase: "SIGN_UP",
      };
    case "USER_LIST":
      return {
        ...state,
        users: data.users,
        teams: data.teams,
        phase: "CONFIGURE_GAME",
      };
    case "NEW_SUGGESTION":
      return { ...state, suggestionCount: data.count };
    case "NEW_TURN":
      return {
        ...state,
        round: data.round,
        describer: data.describer,
        currentSuggestion: null,
        phase: data.round <= 3 ? "PLAY" : "GAME_OVER",
      };
    case "NEXT_SUGGESTION":
      console.log("NEXT_SUGGESTION:", data);
      return { ...state, currentSuggestion: data.name };
    case "LATEST_SCORES":
      return { ...state, scores: data };
    default:
      console.warn("unhandled", type);
      return state;
  }
};

const reduceChooseGroup = (state: ChooseGroupPhase, { type, data }: Message) =>
  defaultReducer(state, { type, data });

const reduceSignUp = (state: SignUpPhase, { type, data }: Message) =>
  defaultReducer(state, { type, data });

const reduceConfigureGame = (
  state: ConfigureGamePhase,
  { type, data }: Message,
) => defaultReducer(state, { type, data });

const reducePlay = (state: PlayPhase, { type, data }: Message) =>
  defaultReducer(state, { type, data });

const reduceGameOver = (state: GameOverPhase, { type, data }: Message): State =>
  state;

const reducer = (state: State, message: Message): State => {
  switch (state.phase) {
    case "CHOOSE_GROUP":
      return reduceChooseGroup(state, message);
    case "SIGN_UP":
      return reduceSignUp(state, message);
    case "CONFIGURE_GAME":
      return reduceConfigureGame(state, message);
    case "PLAY":
      return reducePlay(state, message);
    case "GAME_OVER":
      return reduceGameOver(state, message);
    default:
      return assertNever(state);
  }
};

export default reducer;
