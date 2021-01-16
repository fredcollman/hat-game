import express, { Router } from "express";
import Store from "./store.js";

const makeRouter = ({ db }) => {
  const router = Router();
  const store = new Store(db);
  router.use(express.json());

  router.post("/", async (req, res) => {
    const { username } = req.body;
    const data = await store.addUser({ username });
    res.send(data);
  });

  return router;
};

export default makeRouter;
