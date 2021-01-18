import { Server, Socket } from "socket.io";
import Store, { Database } from "./store";
import { getTeamMembers, getUsers, IGame } from "./game";

interface Dependencies {
  socket: Socket;
  io: Server;
  db: Database;
}

type Handler = (data: any) => void;

interface GameShell {
  groupID: string;
}

const nullGame: GameShell = {
  groupID: "",
};

export default class Client {
  sock: Socket;
  io: Server;
  db: Database;
  store: Store;
  room: string | null;
  game: GameShell;

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
      this.game.groupID = groupID; // nasty, but needed for subsequent reloads to work
      this.sock.join(this.room);
      this.replyOne("JOINED_GROUP", {
        groupID,
      });
    }
  }

  async addSuggestion({ suggestion }: { suggestion: string }) {
    const game = await this.store.loadGame(this.game.groupID);
    this.game = game;
    game.addSuggestion({ suggestion });
    this.replyAll("NEW_SUGGESTION", { count: game.countSuggestions() });
  }

  async startGame() {
    const game = await this.store.loadGame(this.game.groupID);
    this.game = game;
    game.start();
    this.replyAll("NEW_TURN", game.getCurrentTurnDetails());
  }

  async requestSuggestion() {
    const game = await this.store.loadGame(this.game.groupID);
    this.game = game;
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
    const game = await this.store.loadGame(this.game.groupID);
    this.game = game;
    game.guessCorrectly(name);
    this._notifyScores(game);
    this.requestSuggestion();
  }

  async skip({ name }: { name: string }) {
    const game = await this.store.loadGame(this.game.groupID);
    this.game = game;
    game.skip(name);
    this._notifyScores(game);
    this.requestSuggestion();
  }

  async nextTurn() {
    const game = await this.store.loadGame(this.game.groupID);
    this.game = game;
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
