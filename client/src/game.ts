export interface User {
  id: string;
  username: string;
}

export interface Describer extends User {
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
  userID: string | null;
  users: User[];
}

export interface GameOptions {
  turnDurationSeconds: number;
  numTeams: number;
}

export interface ChooseGroupPhase extends GameOptions {
  phase: "CHOOSE_GROUP";
}

export interface SignUpPhase extends GameOptions {
  phase: "SIGN_UP";
  groupID: string | null;
  userID: string | null; // TODO: setting this should move to ConfigureGamePhase
  users: User[];
}

export interface ConfigureGamePhase extends GroupState, GameOptions {
  phase: "CONFIGURE_GAME";
  suggestionCount: number;
}

export interface PlayPhase extends GroupState, GameOptions {
  phase: "PLAY";
  describer: Describer | null;
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
