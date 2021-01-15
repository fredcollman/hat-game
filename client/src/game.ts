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

interface ChooseGroupPhase {
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

interface SignUpPhase {
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

export interface ConfigureGamePhase {
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

export interface PlayPhase {
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

export interface GameOverPhase {
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

export type State =
  | ChooseGroupPhase
  | SignUpPhase
  | ConfigureGamePhase
  | PlayPhase
  | GameOverPhase;
