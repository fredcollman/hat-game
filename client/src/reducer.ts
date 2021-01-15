import { State } from "./game";

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

const reducer = (state: State, { type, data }: Message): State => {
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

export default reducer;
