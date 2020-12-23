export default class Game {
  #state;

  constructor(state) {
    this.#state = state;
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

  startGame() {
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
}
