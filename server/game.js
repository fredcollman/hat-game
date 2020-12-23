export default class Game {
  #state;

  static create() {
    return new this({
      round: 0,
      users: [],
      teams: [],
      suggestions: [],
      options: {
        teams: 2,
        turnDurationSeconds: 60,
      },
      currentTeamIndex: 0,
      availableSuggestions: [],
    });
  }

  constructor(state) {
    this.#state = state;
  }

  addUser({ clientID, username }) {
    if (username && username.length) {
      this.#state.users = [
        ...this.#state.users.filter((u) => u.clientID !== clientID),
        { clientID, username },
      ];
    }
  }

  getUsers() {
    return this.#state.users;
  }

  addSuggestion({ clientID, suggestion }) {
    if (suggestion && suggestion.length) {
      this.#state.suggestions = [
        ...this.#state.suggestions,
        { clientID, name: suggestion },
      ];
    }
  }

  countSuggestions() {
    return this.#state.suggestions.length;
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
      this.startRound(this.#state.round + 1);
    }
  }

  startRound(round) {
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
    this.startRound(1);
  }

  guessCorrectly(name) {
    this.#state.availableSuggestions = this.#state.availableSuggestions.filter(
      (s) => s.name !== name,
    );
    this.getCurrentTeam().guessedCorrectly++;
    console.log("correct", name);
  }

  skip(name) {
    this.#state.availableSuggestions = this.#state.availableSuggestions.map(
      (s) => (s.name === name ? { ...s, skipped: true } : s),
    );
    this.getCurrentTeam().skips++;
    console.log("skipped", name);
  }
}
