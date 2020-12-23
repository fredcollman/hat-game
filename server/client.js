export default class Client {
  constructor({ io, socket, game }) {
    this.sock = socket;
    this.replyOne = this.sock.emit.bind(this.sock);
    this.replyAll = io.emit.bind(io);
    this.game = game;
  }

  setUsername({ username }) {
    this.game.addUser({ clientID: this.sock.id, username });
    this.replyAll("USER_LIST", { users: this.game.getUsers() });
  }

  welcome() {
    this.replyOne("WELCOME", {
      clientID: this.sock.id,
      users: this.game.getUsers(),
    });
  }

  addSuggestion({ suggestion }) {
    this.game.addSuggestion({ clientID: this.sock.id, suggestion });
    this.replyAll("NEW_SUGGESTION", { count: this.game.countSuggestions() });
  }

  startGame() {
    this.game.start();
    this.replyAll("NEW_TURN", this.game.getCurrentTurnDetails());
  }

  requestSuggestion() {
    const suggestion = this.game.getNextSuggestion();
    if (suggestion) {
      this.replyOne("NEXT_SUGGESTION", { name: suggestion.name });
    } else {
      this.nextTurn();
    }
  }

  notifyScores() {
    this.replyAll("LATEST_SCORES", this.game.getScores());
  }

  guessCorrectly({ name }) {
    this.game.guessCorrectly(name);
    this.notifyScores();
    this.requestSuggestion();
  }

  skip({ name }) {
    this.game.skip(name);
    this.notifyScores();
    this.requestSuggestion();
  }

  nextTurn() {
    this.game.endTurn();
    this.replyAll("NEW_TURN", this.game.getCurrentTurnDetails());
  }

  registerHandler(messageType, handler) {
    this.sock.on(messageType, (data) => {
      try {
        handler.call(this, data);
      } catch (e) {
        console.error(
          `[${this.sock.id}] Failed to handle ${messageType} message due to`,
          e,
        );
      }
    });
  }
}
