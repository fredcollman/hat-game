import { v4 } from "uuid";
import { randomID } from "./random.js";
import Game from "./game.js";

export default class Store {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async addUser({ username }) {
    const id = v4();
    return this.#db.get("users").push({ id, username }).last().write();
  }

  async addGroup() {
    const id = randomID();
    console.log("creating group", id);
    return this.#db.get("groups").push({ id }).last().write();
  }

  async loadGame({ groupID }) {
    const group = await this.#db.get("groups").find({ id: groupID }).value();
    const onChange = (state) => {
      this.#db
        .get("groups")
        .find({ id: groupID })
        .assign({ game: state })
        .write();
    };
    return Game.resume({ state: group?.game, groupID, onChange });
  }

  async reload(game) {
    return this.loadGame({ groupID: game.groupID });
  }
}
