export default class Client {
  constructor({ io, socket, game }) {
    this.sock = socket;
    this.io = io;
    this.game = game;
  }

  static prepare({ io, socket, game }) {
    const client = new this({ io, socket, game });
    client.welcome();

    client.registerHandler("SET_USERNAME", client.setUsername);
    client.registerHandler("ADD_SUGGESTION", client.addSuggestion);
    client.registerHandler("START_GAME", client.startGame);
    client.registerHandler("REQUEST_SUGGESTION", client.requestSuggestion);
    client.registerHandler("GUESS_CORRECTLY", client.guessCorrectly);
    client.registerHandler("SKIP", client.skip);
    client.registerHandler("END_TURN", client.nextTurn);
    return client;
  }

  replyOne(messageType, data) {
    console.log(`[${this.sock.id}] sending ${messageType}`);
    this.sock.emit(messageType, data);
  }

  replyAll(messageType, data) {
    console.log(`[${this.sock.id}] sending ${messageType} to all`);
    this.io.emit(messageType, data);
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
      console.log(`[${this.sock.id}] incoming ${messageType}`);
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
