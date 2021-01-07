import express, { Router } from "express";
import { v4 } from "uuid";

const makeRouter = ({ db }) => {
  const router = Router();
  router.use(express.json());

  router.post("/", (req, res) => {
    const id = v4();
    const { username } = req.body;
    console.log(req.body);
    const user = {
      id,
      username,
    };
    db.get("users").push(user).write();
    res.send(user);
  });
  return router;
};

export default makeRouter;
