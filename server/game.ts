interface User {
  id: string;
  username: string;
}

interface Team {
  name: string;
  members: User[];
  currentDescriberIndex: number;
  guessedCorrectly: number;
  skips: number;
}

interface GameOptions {
  teams: number;
  turnDurationSeconds: number;
}

export interface State {
  round: number;
  users: User[];
  teams: Team[];
  suggestions: { name: string }[];
  options: GameOptions;
  currentTeamIndex: number;
  availableSuggestions: { name: string; skipped: boolean }[];
}

type ChangeHandler = (state: State) => void;

const DEFAULT_TEAMS = 2;

export const initialState = (): State => ({
  round: 0,
  users: [],
  teams: Array.from({ length: DEFAULT_TEAMS }).map((_, teamIdx) => ({
    name: `Team ${teamIdx + 1}`,
    members: [],
    currentDescriberIndex: 0,
    guessedCorrectly: 0,
    skips: 0,
  })),
  suggestions: [],
  options: {
    teams: DEFAULT_TEAMS,
    turnDurationSeconds: 60,
  },
  currentTeamIndex: 0,
  availableSuggestions: [],
});

const addMember = (member: User, team: Team) => ({
  ...team,
  members: [...team.members, member],
});

export const addUser = ({ username, id }: User, state: State) => {
  const user = { id, username };
  const teamToJoin = state.users.length % state.options.teams;
  const newUsers = [...state.users.filter((u) => u.id !== id), user];
  return {
    ...state,
    users: newUsers,
    teams: state.teams.map((team, idx) =>
      idx === teamToJoin ? addMember(user, team) : team
    ),
  };
};

export const getUsers = (state: State) => {
  return [...state.users];
};

export const getTeamMembers = (state: State) => {
  return state.teams.map(({ name, members }) => ({
    name,
    members,
  }));
};

export const getScores = (state: State) => {
  return state.teams.map((t) => ({
    name: t.name,
    correct: t.guessedCorrectly,
    skips: t.skips,
  }));
};

export const getNextSuggestion = (state: State) => {
  const nonSkipped = state.availableSuggestions.filter((s) => !s.skipped);
  const randomIndex = Math.floor(Math.random() * nonSkipped.length);
  return nonSkipped[randomIndex];
};

const getCurrentTeam = (state: State) => {
  return state.teams[state.currentTeamIndex];
};

const getCurrentDescriber = (state: State) => {
  const team = getCurrentTeam(state);
  const { id, username } = team.members[team.currentDescriberIndex];
  return {
    id,
    username,
    team: team.name,
  };
};

export const getCurrentTurnDetails = (state: State) => {
  return {
    round: state.round,
    duration: state.options.turnDurationSeconds,
    describer: getCurrentDescriber(state),
  };
};

export const countSuggestions = (state: State) => state.suggestions.length;

export default class Game {
  #state: State;
  #handleChange: () => void;
  groupID: string;

  static resume({
    state,
    groupID,
    onChange,
  }: {
    state?: State;
    groupID: string;
    onChange: ChangeHandler;
  }) {
    return new this(state || initialState(), groupID, onChange);
  }

  constructor(state: State, groupID: string, onChange: ChangeHandler) {
    this.#state = state;
    this.groupID = groupID;
    this.#handleChange = () => onChange(this.#state);
  }

  getState = () => this.#state;

  addUser(user: User) {
    if (user?.username?.length) {
      this.#state = addUser(user, this.#state);
      this.#handleChange();
    }
  }

  getUsers() {
    return getUsers(this.#state);
  }

  getTeamMembers() {
    console.log(this.#state);
    return getTeamMembers(this.#state);
  }

  addSuggestion({ suggestion }: { suggestion: string }) {
    if (suggestion && suggestion.length) {
      this.#state.suggestions = [
        ...this.#state.suggestions,
        { name: suggestion },
      ];
      this.#handleChange();
    }
  }

  countSuggestions() {
    return countSuggestions(this.#state);
  }

  getOptions() {
    return this.#state.options;
  }

  getCurrentTeam() {
    return getCurrentTeam(this.#state);
  }

  getCurrentDescriber() {
    return getCurrentDescriber(this.#state);
  }

  getCurrentTurnDetails() {
    return getCurrentTurnDetails(this.#state);
  }

  getScores() {
    return getScores(this.#state);
  }

  getNextSuggestion() {
    return getNextSuggestion(this.#state);
  }

  endTurn() {
    console.log(this.#state);
    const team = this.#state.teams[this.#state.currentTeamIndex];
    team.currentDescriberIndex = (team.currentDescriberIndex + 1) %
      team.members.length;
    this.#state.currentTeamIndex = (this.#state.currentTeamIndex + 1) %
      this.#state.teams.length;
    this.#state.availableSuggestions = this.#state.availableSuggestions.map(
      (s) => ({
        ...s,
        skipped: false,
      }),
    );
    if (!this.#state.availableSuggestions.length) {
      this._startRound(this.#state.round + 1);
    }
    this.#handleChange();
  }

  _startRound(round: number) {
    this.#state.round = round;
    this.#state.availableSuggestions = this.#state.suggestions.map((s) => ({
      ...s,
      skipped: false,
    }));
  }

  start() {
    this.#state.currentTeamIndex = 0;
    this._startRound(1);
    this.#handleChange();
  }

  guessCorrectly(name: string) {
    this.#state.availableSuggestions = this.#state.availableSuggestions.filter(
      (s) => s.name !== name,
    );
    this.getCurrentTeam().guessedCorrectly++;
    this.#handleChange();
    console.log("correct", name);
  }

  skip(name: string) {
    this.#state.availableSuggestions = this.#state.availableSuggestions.map(
      (s) => (s.name === name ? { ...s, skipped: true } : s),
    );
    this.getCurrentTeam().skips++;
    this.#handleChange();
    console.log("skipped", name);
  }
}

export const summariseConfiguration = (game: State) => {
  return {
    teams: game.teams,
    users: game.users,
    options: game.options,
    suggestionCount: game.suggestions.length,
  };
};

export const addSuggestion = (suggestion: string) =>
  (game: Game) => game.addSuggestion({ suggestion });

export const start = (game: Game) => game.start();

export const guessCorrectly = (name: string) =>
  (game: Game) => game.guessCorrectly(name);

export const skip = (name: string) => (game: Game) => game.skip(name);

export const endTurn = (game: Game) => game.endTurn();
