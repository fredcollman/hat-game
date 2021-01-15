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

export interface State {
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

export interface GameState {
  state: State;
  user: User | null;
}
