import { Server, Socket } from "socket.io";
import Store, { Database } from "./store";
import { getTeamMembers, getUsers, IGame } from "./game";

interface Dependencies {
  socket: Socket;
  io: Server;
  db: Database;
}

type Handler = (data: any) => void;

const nullGame: IGame = {
  groupID: "",
  addUser: () => {},
  getUsers: () => [],
  getTeamMembers: () => [],
  addSuggestion: () => {},
  countSuggestions: () => 0,
  getOptions: () => ({ teams: 2, turnDurationSeconds: 60 }),
  getCurrentTeam: () => null,
  getCurrentDescriber: () => null,
  getCurrentTurnDetails: () => null,
  getScores: () => [],
  getNextSuggestion: () => null,
  endTurn: () => {},
  start: () => {},
  guessCorrectly: (name: string) => {},
  skip: (name: string) => {},
};

export default class Client {
  sock: Socket;
  io: Server;
  db: Database;
  store: Store;
  room: string | null;
  game: IGame;

  constructor({ io, socket, db, store }: Dependencies & { store: Store }) {
    this.sock = socket;
    this.io = io;
    this.db = db;
    this.store = store;
    this.room = null;
    this.game = nullGame;
  }

  static prepare({ io, socket, db }: Dependencies) {
    const client = new this({ io, socket, db, store: new Store(db) });
    const handlers: [string, Handler][] = [
      ["START_GROUP", client.startGroup],
      ["JOIN_GROUP", client.joinGroup],
      ["ADD_SUGGESTION", client.addSuggestion],
      ["START_GAME", client.startGame],
      ["REQUEST_SUGGESTION", client.requestSuggestion],
      ["GUESS_CORRECTLY", client.guessCorrectly],
      ["SKIP", client.skip],
      ["END_TURN", client.nextTurn],
    ];
    handlers.forEach(([name, handler]) =>
      client.registerHandler(name, handler)
    );
    return client;
  }

  replyOne(messageType: string, data: object) {
    console.log(`[${this.sock.id}] sending ${messageType}`);
    this.sock.emit(messageType, data);
  }

  replyAll(messageType: string, data: object | null) {
    if (this.room) {
      console.log(`[${this.sock.id}] sending ${messageType} to ${this.room}`);
      this.io.to(this.room).emit(messageType, data);
    } else {
      console.log(`[${this.sock.id}] sending ${messageType} to all`);
      this.io.emit(messageType, data);
    }
  }

  async reload() {
    if (this.game) {
      this.game = await this.store.reload(this.game);
    }
  }

  async startGroup({ userID }: { userID: string }) {
    const group = await this.store.addGroup(userID);
    this._configureGroup(group.id);
  }

  async joinGroup({ userID, groupID }: { userID: string; groupID: string }) {
    const group = await this.store.joinGroup({ userID, groupID });
    this._configureGroup(groupID);
    this.replyAll("NEW_PLAYER", {
      users: getUsers(group.game),
      teams: getTeamMembers(group.game),
    });
  }

  _configureGroup(groupID: string) {
    if (this.room === null) {
      this.room = `group:${groupID}`;
      this.sock.join(this.room);
      this.replyOne("JOINED_GROUP", {
        groupID,
      });
    }
  }

  addSuggestion({ suggestion }: { suggestion: string }) {
    this.reload();
    this.game.addSuggestion({ suggestion });
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

  _notifyScores() {
    this.replyAll("LATEST_SCORES", this.game.getScores());
  }

  guessCorrectly({ name }: { name: string }) {
    this.game.guessCorrectly(name);
    this._notifyScores();
    this.requestSuggestion();
  }

  skip({ name }: { name: string }) {
    this.game.skip(name);
    this._notifyScores();
    this.requestSuggestion();
  }

  nextTurn() {
    this.game.endTurn();
    this.replyAll("NEW_TURN", this.game.getCurrentTurnDetails());
  }

  registerHandler(messageType: string, handler: Handler) {
    this.sock.on(messageType, async (data) => {
      console.log(`[${this.sock.id}] incoming ${messageType}`);
      try {
        await this.reload();
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
