export interface User {
  clientID: string;
  username: string;
  team: string;
}

interface Team {
  name: string;
  members: User[];
}

interface TeamScore {
  name: string;
  correct: number;
  skips: number;
}

interface ChooseGroup {
  phase: "CHOOSE_GROUP";
  describer: User | null;
  round: number;
  currentSuggestion: string | null;
  turnDurationSeconds: number;
  scores: TeamScore[];
  groupID: string | null;
  teams: Team[];
  clientID: string | null;
  users: User[];
  suggestionCount: number;
  numTeams: number;
}

interface SignUp {
  phase: "SIGN_UP";
  describer: User | null;
  round: number;
  currentSuggestion: string | null;
  turnDurationSeconds: number;
  scores: TeamScore[];
  groupID: string | null;
  teams: Team[];
  clientID: string | null;
  users: User[];
  suggestionCount: number;
  numTeams: number;
}

interface ConfigureGame {
  phase: "CONFIGURE_GAME";
  describer: User | null;
  round: number;
  currentSuggestion: string | null;
  turnDurationSeconds: number;
  scores: TeamScore[];
  groupID: string | null;
  teams: Team[];
  clientID: string | null;
  users: User[];
  suggestionCount: number;
  numTeams: number;
}

interface Play {
  phase: "PLAY";
  describer: User | null;
  round: number;
  currentSuggestion: string | null;
  turnDurationSeconds: number;
  scores: TeamScore[];
  groupID: string | null;
  teams: Team[];
  clientID: string | null;
  users: User[];
  suggestionCount: number;
  numTeams: number;
}

interface GameOver {
  phase: "GAME_OVER";
  describer: User | null;
  round: number;
  currentSuggestion: string | null;
  turnDurationSeconds: number;
  scores: TeamScore[];
  groupID: string | null;
  teams: Team[];
  clientID: string | null;
  users: User[];
  suggestionCount: number;
  numTeams: number;
}

export type State = ChooseGroup | SignUp | ConfigureGame | Play | GameOver;
