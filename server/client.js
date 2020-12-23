import Game from "./game.js";

export default class Client {
  constructor({ io, socket, db }) {
    this.sock = socket;
    this.io = io;
    this.db = db;
    this.room = null;
    this.game = null;
  }

  static prepare({ io, socket, db }) {
    const client = new this({ io, socket, db });
    client.welcome();

    client.registerHandler("START_GROUP", client.startGroup);
    client.registerHandler("JOIN_GROUP", client.joinGroup);
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
    if (this.room) {
      console.log(`[${this.sock.id}] sending ${messageType} to ${this.room}`);
      this.io.to(this.room).emit(messageType, data);
    } else {
      console.log(`[${this.sock.id}] sending ${messageType} to all`);
      this.io.emit(messageType, data);
    }
  }

  welcome() {
    this.replyOne("WELCOME", {
      clientID: this.sock.id,
      users: [], // TODO remove
    });
  }

  startGroup({ groupID }) {
    this.db
      .get("groups")
      .push({ id: groupID })
      .write()
      .then(() => {
        this.joinGroup({ groupID });
      });
  }

  joinGroup({ groupID }) {
    if (this.room === null) {
      this.room = `group:${groupID}`;
      this.game = Game.create(); // TODO load existing game details
      this.sock.join(this.room);
      this.replyOne("JOINED_GROUP", { groupID, users: this.game.getUsers() });
    }
  }

  setUsername({ username }) {
    this.game.addUser({ clientID: this.sock.id, username });
    this.replyAll("USER_LIST", { users: this.game.getUsers() });
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
