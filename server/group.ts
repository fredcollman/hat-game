import express, { Router } from "express";
import Store, { Database } from "./store";

const makeRouter = ({ db }: { db: Database }) => {
  const router = Router();
  const store = new Store(db);
  router.use(express.json());

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const data = await store.findGroupByID(id);
    // TODO: do not expose the suggestions
    res.send(data);
  });

  return router;
};

export default makeRouter;
