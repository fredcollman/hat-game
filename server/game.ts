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

const incrementRound = (state: State) => {
  return {
    ...state,
    round: state.round + 1,
    availableSuggestions: state.suggestions.map((s) => ({
      ...s,
      skipped: false,
    })),
  };
};

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

  endTurn() {
    this.#state = endTurn(this.#state);
    this.#handleChange();
  }

  start() {
    this.#state = start(this.#state);
    this.#handleChange();
  }

  guessCorrectly(name: string) {
    this.#state = guessCorrectly(name)(this.#state);
    this.#handleChange();
  }

  skip(name: string) {
    this.#state = skip(name)(this.#state);
    this.#handleChange();
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
  (state: State): State => {
    if (suggestion && suggestion.length) {
      return {
        ...state,
        suggestions: [...state.suggestions, { name: suggestion }],
      };
    }
    return state;
  };

const start = (state: State) => {
  return incrementRound({
    ...state,
    currentTeamIndex: 0,
  });
};

const markCorrectGuess = ({ guessedCorrectly, ...rest }: Team) => ({
  ...rest,
  guessedCorrectly: guessedCorrectly + 1,
});

const markSkip = ({ skips, ...rest }: Team) => ({
  ...rest,
  skips: skips + 1,
});

const incrementDescriber = (team: Team): Team => {
  return {
    ...team,
    currentDescriberIndex: (team.currentDescriberIndex + 1) %
      team.members.length,
  };
};

const incrementTeam = (state: State): State => {
  return {
    ...state,
    currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length,
    availableSuggestions: state.availableSuggestions.map((s) => ({
      ...s,
      skipped: false,
    })),
  };
};

const updateCurrentTeam = (update: (team: Team) => Team) =>
  ({
    teams,
    currentTeamIndex,
    ...rest
  }: State): State => ({
    ...rest,
    currentTeamIndex,
    teams: teams.map((t, idx) => (idx === currentTeamIndex ? update(t) : t)),
  });

const guessCorrectly = (name: string) =>
  ({
    availableSuggestions,
    ...rest
  }: State): State => {
    console.log("correct", name);
    const updateScore = updateCurrentTeam(markCorrectGuess);
    return updateScore({
      ...rest,
      availableSuggestions: availableSuggestions.filter((s) => s.name !== name),
    });
  };

const skip = (name: string) =>
  ({
    availableSuggestions,
    ...rest
  }: State): State => {
    console.log("skipped", name);
    const updateScore = updateCurrentTeam(markSkip);
    return updateScore({
      ...rest,
      availableSuggestions: availableSuggestions.map((s) =>
        s.name === name ? { ...s, skipped: true } : s
      ),
    });
  };

const endTurn = (state: State): State => {
  console.log(state);
  let newState = state;
  newState = updateCurrentTeam(incrementDescriber)(newState);
  if (!newState.availableSuggestions.length) {
    newState = incrementRound(newState);
  }
  newState = incrementTeam(newState);
  return newState;
};
