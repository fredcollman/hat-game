import { Server, Socket } from "socket.io";
import Store, { Database } from "./store";
import { getTeamMembers, getUsers, IGame } from "./game";

interface Dependencies {
  socket: Socket;
  io: Server;
  db: Database;
}

type Handler = (data: any) => void;

export default class Client {
  sock: Socket;
  io: Server;
  db: Database;
  store: Store;
  groupID: string;

  constructor({ io, socket, db, store }: Dependencies & { store: Store }) {
    this.sock = socket;
    this.io = io;
    this.db = db;
    this.store = store;
    this.groupID = ""; // TODO: does it matter that this could be invalid?
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
    const room = this.groupID.length ? `group:${this.groupID}` : null;
    if (room) {
      console.log(`[${this.sock.id}] sending ${messageType} to ${room}`);
      this.io.to(room).emit(messageType, data);
    } else {
      console.log(`[${this.sock.id}] sending ${messageType} to all`);
      this.io.emit(messageType, data);
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
    if (this.groupID !== groupID) {
      this.groupID = groupID;
      this.sock.join(`group:${groupID}`);
      this.replyOne("JOINED_GROUP", {
        groupID,
      });
    }
  }

  async addSuggestion({ suggestion }: { suggestion: string }) {
    const game = await this.store.loadGame(this.groupID);
    game.addSuggestion({ suggestion });
    this.replyAll("NEW_SUGGESTION", { count: game.countSuggestions() });
  }

  async startGame() {
    const game = await this.store.loadGame(this.groupID);
    game.start();
    this.replyAll("NEW_TURN", game.getCurrentTurnDetails());
  }

  async requestSuggestion() {
    const game = await this.store.loadGame(this.groupID);
    const suggestion = game.getNextSuggestion();
    if (suggestion) {
      this.replyOne("NEXT_SUGGESTION", { name: suggestion.name });
    } else {
      this.nextTurn();
    }
  }

  _notifyScores(game: IGame) {
    this.replyAll("LATEST_SCORES", game.getScores());
  }

  async guessCorrectly({ name }: { name: string }) {
    const game = await this.store.loadGame(this.groupID);
    game.guessCorrectly(name);
    this._notifyScores(game);
    this.requestSuggestion();
  }

  async skip({ name }: { name: string }) {
    const game = await this.store.loadGame(this.groupID);
    game.skip(name);
    this._notifyScores(game);
    this.requestSuggestion();
  }

  async nextTurn() {
    const game = await this.store.loadGame(this.groupID);
    game.endTurn();
    this.replyAll("NEW_TURN", game.getCurrentTurnDetails());
  }

  registerHandler(messageType: string, handler: Handler) {
    this.sock.on(messageType, async (data) => {
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
