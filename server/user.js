import express, { Router } from "express";
import { v4 } from "uuid";

const info = (id, message) => {
  console.log(`[user:${id}] ${message}`);
};

const makeRouter = ({ db }) => {
  const router = Router();
  router.use(express.json());

  router.post("/", async (req, res) => {
    const id = v4();
    const { username } = req.body;
    const user = {
      id,
      username,
    };
    info(id, "new user signed up");
    const data = await db.get("users").push(user).last().write();
    res.send(data);
  });
  return router;
};

export default makeRouter;
