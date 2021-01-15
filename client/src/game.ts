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

export interface GameOptions {
  turnDurationSeconds: number;
  numTeams: number;
}

export interface ChooseGroupPhase extends GameOptions {
  phase: "CHOOSE_GROUP";
  clientID: string | null;
}

export interface SignUpPhase extends GameOptions {
  phase: "SIGN_UP";
  clientID: string | null;
  groupID: string | null;
  users: User[];
}

export interface ConfigureGamePhase extends GroupState, GameOptions {
  phase: "CONFIGURE_GAME";
  suggestionCount: number;
}

export interface PlayPhase extends GroupState, GameOptions {
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
