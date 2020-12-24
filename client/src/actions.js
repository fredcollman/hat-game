export default class Actions {
  constructor({ state, socket, dispatch }) {
    this.socket = socket;
    this.dispatch = dispatch;
    this.state = state;
  }

  startGroup = () => {
    this.socket.emit("START_GROUP", {});
  };

  joinGroup = (groupID) => {
    this.socket.emit("JOIN_GROUP", { groupID });
  };

  setUsername = (username) => {
    if (username && username.length) {
      this.socket.emit("SET_USERNAME", { username });
    }
  };

  addSuggestion = (suggestion) => {
    if (
      suggestion &&
      suggestion.length &&
      !this.state.yourSuggestions.includes(suggestion)
    ) {
      this.socket.emit("ADD_SUGGESTION", { suggestion });
      this.dispatch({ type: "ADD_SUGGESTION", data: { suggestion } });
    }
  };

  startGame = () => {
    this.socket.emit("START_GAME", {});
  };

  requestSuggestion = () => {
    console.log(this.state.currentSuggestion);
    this.socket.emit("REQUEST_SUGGESTION", {});
  };

  guessCorrectly = (name) => {
    this.socket.emit("GUESS_CORRECTLY", { name });
  };

  skip = (name) => {
    this.socket.emit("SKIP", { name });
  };

  endTurn = () => {
    // setCurrentSuggestion(null); TODO is this ok?
    this.socket.emit("END_TURN", {});
  };
}
