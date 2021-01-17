import lowdb from "lowdb";
import { v4 } from "uuid";
import { randomID } from "./random";
import Game, { addUser, IGame, initialState, State } from "./game";

interface User {
  id: string;
  username: string;
}

interface Group {
  id: string;
  game: State;
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

  async addGroup(userID: string) {
    const user = await this.findUserByID(userID);
    const id = randomID();
    console.log("creating group", id);
    const game = addUser(user, initialState());
    return this.#db.get("groups").push({ id, game }).last().write();
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

  async findUserByID(id: string) {
    const user = await this.#db.get("users").find({ id }).value();
    return user;
  }
}
