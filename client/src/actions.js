export default class Actions {
  constructor({ state, socket, dispatch }) {
    this.socket = socket;
    this.dispatch = dispatch;
    this.state = state;
  }

  _send = (messageType, data) => {
    this.socket.emit(messageType, data);
  };

  startGroup = () => {
    this._send("START_GROUP", {});
  };

  joinGroup = (groupID) => {
    this._send("JOIN_GROUP", { groupID });
  };

  setUsername = (username) => {
    if (username && username.length) {
      this._send("SET_USERNAME", { username });
    }
  };

  addSuggestion = (suggestion) => {
    if (
      suggestion &&
      suggestion.length &&
      !this.state.yourSuggestions.includes(suggestion)
    ) {
      this._send("ADD_SUGGESTION", { suggestion });
      this.dispatch({ type: "ADD_SUGGESTION", data: { suggestion } });
    }
  };

  startGame = () => {
    this._send("START_GAME", {});
  };

  requestSuggestion = () => {
    console.log(this.state.currentSuggestion);
    this._send("REQUEST_SUGGESTION", {});
  };

  guessCorrectly = (name) => {
    this._send("GUESS_CORRECTLY", { name });
  };

  skip = (name) => {
    this._send("SKIP", { name });
  };

  endTurn = () => {
    // setCurrentSuggestion(null); TODO is this ok?
    this._send("END_TURN", {});
  };
}
