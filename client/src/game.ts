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

export interface GroupState {
  groupID: string | null;
  teams: Team[];
  clientID: string | null;
  users: User[];
}

export interface ChooseGroupPhase extends GroupState {
  phase: "CHOOSE_GROUP";
  turnDurationSeconds: number;
  numTeams: number;
}

export interface SignUpPhase extends GroupState {
  phase: "SIGN_UP";
  turnDurationSeconds: number;
  numTeams: number;
}

export interface ConfigureGamePhase extends GroupState {
  phase: "CONFIGURE_GAME";
  turnDurationSeconds: number;
  suggestionCount: number;
  numTeams: number;
}

export interface PlayPhase extends GroupState {
  phase: "PLAY";
  describer: User | null;
  round: number;
  currentSuggestion: string | null;
  turnDurationSeconds: number;
  scores: TeamScore[];
}

export interface GameOverPhase extends GroupState {
  phase: "GAME_OVER";
  scores: TeamScore[];
}

export type State =
  | ChooseGroupPhase
  | SignUpPhase
  | ConfigureGamePhase
  | PlayPhase
  | GameOverPhase;
