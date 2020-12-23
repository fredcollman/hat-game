import { randomID } from "./random.js";

export default class Store {
  #db;

  constructor(db) {
    this.#db = db;
  }

  addGroup() {
    const id = randomID();
    console.log("creating group", id);
    return this.#db.get("groups").push({ id }).last().write();
  }
}
