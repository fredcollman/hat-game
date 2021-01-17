import lowdb from "lowdb";
import { v4 } from "uuid";
import { randomID } from "./random";
import Game, { IGame, State } from "./game";

interface User {}

interface Group {
  id: string;
  game?: State;
}

interface Schema {
  users: User[];
  groups: Group[];
}

export type Database = lowdb.LowdbAsync<Schema>;

export default class Store {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async addUser({ username }: { username: string }) {
    const id = v4();
    return this.#db.get("users").push({ id, username }).last().write();
  }

  async addGroup() {
    const id = randomID();
    console.log("creating group", id);
    return this.#db.get("groups").push({ id }).last().write();
  }

  async loadGame({ groupID }: { groupID: string }) {
    const group = await this.#db.get("groups").find({ id: groupID }).value();
    const onChange = (state: State) => {
      this.#db
        .get("groups")
        .find({ id: groupID })
        .assign({ game: state })
        .write();
    };
    return Game.resume({ state: group?.game, groupID, onChange });
  }

  async reload(game: IGame) {
    return this.loadGame({ groupID: game.groupID });
  }

  async findGroupByID(id: string) {
    const group = await this.#db.get("groups").find({ id }).value();
    return group;
  }
}
