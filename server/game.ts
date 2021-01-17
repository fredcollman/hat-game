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

const addUser = ({ username, id }: User, state: State) => {
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

export interface IGame {
  groupID: string;
  addUser: (user: User) => void;
  getUsers: () => User[];
  getTeamMembers: () => { name: string; members: User[] }[];
  addSuggestion: (data: { suggestion: string }) => void;
  countSuggestions: () => number;
  getOptions: () => GameOptions;
  getCurrentTeam: () => Team | null;
  getCurrentDescriber: () => User | null;
  getCurrentTurnDetails: () => {
    round: number;
    duration: number;
    describer: User;
  } | null;
  getScores: () => {
    name: string;
    correct: number;
    skips: number;
  }[];
  getNextSuggestion: () => { name: string } | null;
  endTurn: () => void;
  start: () => void;
  guessCorrectly: (name: string) => void;
  skip: (name: string) => void;
}

export default class Game implements IGame {
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

  addUser(user: User) {
    if (user?.username?.length) {
      this.#state = addUser(user, this.#state);
      this.#handleChange();
    }
  }

  getUsers() {
    return this.#state.users;
  }

  getTeamMembers() {
    console.log(this.#state);
    return this.#state.teams.map(({ name, members }) => ({
      name,
      members,
    }));
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
    return this.#state.suggestions.length;
  }

  getOptions() {
    return this.#state.options;
  }

  getCurrentTeam() {
    return this.#state.teams[this.#state.currentTeamIndex];
  }

  getCurrentDescriber() {
    const team = this.getCurrentTeam();
    const { id, username } = team.members[team.currentDescriberIndex];
    return {
      id,

      username,
      team: team.name,
    };
  }

  getCurrentTurnDetails() {
    return {
      round: this.#state.round,
      duration: this.#state.options.turnDurationSeconds,
      describer: this.getCurrentDescriber(),
    };
  }

  getScores() {
    return this.#state.teams.map((t) => ({
      name: t.name,
      correct: t.guessedCorrectly,
      skips: t.skips,
    }));
  }

  getNextSuggestion() {
    const nonSkipped = this.#state.availableSuggestions.filter(
      (s) => !s.skipped,
    );
    const randomIndex = Math.floor(Math.random() * nonSkipped.length);
    return nonSkipped[randomIndex];
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
