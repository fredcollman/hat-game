import express, { Router } from "express";
import Store from "./store.js";

const info = (id, message) => {
  console.log(`[user:${id}] ${message}`);
};

const respond = ({ id, data, res }) => {
  if (data) {
    res.send(data);
  } else {
    info(id, "not found");
    return res.sendStatus(404);
  }
};

const makeRouter = ({ db }) => {
  const store = new Store(db);
  const router = Router();
  router.use(express.json());

  router.post("/", async (req, res) => {
    const { username } = req.body;
    const data = await store.addUser({ username });
    res.send(data);
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const data = await store.getUserByID(id);
    respond({ id, data, res });
  });

  router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { groupID = null } = req.body;
    const data = await store.joinGroup({ userID: id, groupID });
    respond({ id, data, res });
  });

  return router;
};

export default makeRouter;
