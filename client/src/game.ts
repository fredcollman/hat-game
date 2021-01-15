export interface Describer {
  team: string;
  username: string;
}

export interface State {
  describer: Describer;
  round: number;
  currentSuggestion: string;
  turnDurationSeconds: number;
}

export interface GameState {
  state: State;
}
