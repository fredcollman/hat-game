import lowdb from "lowdb";
import { v4 } from "uuid";
import { randomID } from "./random";
import { addUser, initialState, State } from "./game";

interface User {
  id: string;
  username: string;
}

export interface Group {
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

  async joinGroup({ userID, groupID }: { userID: string; groupID: string }) {
    const user = await this.findUserByID(userID);
    return this.#db
      .get("groups")
      .find({ id: groupID })
      .tap((group) => {
        group.game = addUser(user, group.game);
      })
      .write();
  }

  readGameState = async (groupID: string) => {
    const group = await this.findGroupByID(groupID);
    return group?.game;
  };

  async findGroupByID(id: string) {
    const group = await this.#db.get("groups").find({ id }).value();
    return group;
  }

  async findUserByID(id: string) {
    const user = await this.#db.get("users").find({ id }).value();
    return user;
  }

  withGame = (groupID: string) =>
    async (callback: (game: State) => State) => {
      const group = await this.#db
        .get("groups")
        .find({ id: groupID })
        .tap((group) => {
          group.game = callback(group.game);
        })
        .write();
      return group.game;
    };
}
