import { randomID } from "./random.js";
import Game from "./game.js";

export default class Store {
  #db;

  constructor(db) {
    this.#db = db;
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
    return Game.resume({ state: group?.game, onChange });
  }
}
