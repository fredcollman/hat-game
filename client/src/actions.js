export default class Actions {
  constructor({ state, socket, dispatch }) {
    this.socket = socket;
    this.dispatch = dispatch;
    this.state = state;
  }

  _send = (messageType, data) => {
    this.socket.emit(messageType, data);
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
}
