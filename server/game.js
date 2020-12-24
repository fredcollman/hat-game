const DEFAULT_TEAMS = 2;

const initialState = () => ({
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
    turnDurationSeconds: 6, // TODO: change back to 60
  },
  currentTeamIndex: 0,
  availableSuggestions: [],
});

const addMember = (member, team) => ({
  ...team,
  members: [...team.members, member],
});

const addUser = ({ clientID, username }, state) => {
  const user = { clientID, username };
  const teamToJoin = state.users.length % state.options.teams;
  const newUsers = [
    ...state.users.filter((u) => u.clientID !== clientID),
    user,
  ];
  return {
    ...state,
    users: newUsers,
    teams: state.teams.map((team, idx) =>
      idx === teamToJoin ? addMember(user, team) : team
    ),
  };
};

export default class Game {
  #state;
  #handleChange;

  static resume({ state, onChange }) {
    return new this(state || initialState(), onChange);
  }

  static create({ onChange }) {
    return new this(initialState(), onChange);
  }

  constructor(state, onChange) {
    this.#state = state;
    this.#handleChange = () => onChange(this.#state);
  }

  addUser(user) {
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

  addSuggestion({ clientID, suggestion }) {
    if (suggestion && suggestion.length) {
      this.#state.suggestions = [
        ...this.#state.suggestions,
        { clientID, name: suggestion },
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
    const { clientID, username } = team.members[team.currentDescriberIndex];
    return {
      clientID,
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

  _startRound(round) {
    this.#state.round = round;
    this.#state.availableSuggestions = this.#state.suggestions.map((s) => ({
      ...s,
      skipped: false,
    }));
  }

  start() {
    const numTeams = this.#state.options.teams;
    const teams = Array.from({ length: numTeams }).map((_, teamIdx) => ({
      name: `Team ${teamIdx + 1}`,
      members: this.#state.users.filter(
        (_, userIdx) => userIdx % numTeams === teamIdx,
      ),
      currentDescriberIndex: 0,
      guessedCorrectly: 0,
      skips: 0,
    }));
    this.#state.teams = teams;
    this.#state.currentTeamIndex = 0;
    this._startRound(1);
    this.#handleChange();
  }

  guessCorrectly(name) {
    this.#state.availableSuggestions = this.#state.availableSuggestions.filter(
      (s) => s.name !== name,
    );
    this.getCurrentTeam().guessedCorrectly++;
    this.#handleChange();
    console.log("correct", name);
  }

  skip(name) {
    this.#state.availableSuggestions = this.#state.availableSuggestions.map(
      (s) => (s.name === name ? { ...s, skipped: true } : s),
    );
    this.getCurrentTeam().skips++;
    this.#handleChange();
    console.log("skipped", name);
  }
}
