export interface User {}

interface TeamMember {
  // TODO: = Describer? = Player?
  clientID: string;
  username: string;
}

interface Team {
  name: string;
  members: TeamMember[];
}

interface TeamScore {
  name: string;
  correct: number;
  skips: number;
}

export interface Describer {
  team: string;
  username: string;
}

export interface State {
  describer: Describer | null;
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
