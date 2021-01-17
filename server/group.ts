import express, { Router } from "express";
import Store, { Database } from "./store";
import { State } from "./game";

// TODO: keep in sync with client/src/api.ts
interface User {
  id: string;
  username: string;
}
interface Team {
  name: string;
  members: {
    id: string;
    username: string;
  }[];
}
interface RetrieveGroupResponse {
  id: string;
  game: {
    teams: Team[];
    users: User[];
    options: {
      teams: number;
      turnDurationSeconds: number;
    };
    suggestionCount: number;
  } | null;
}

const convertGame = (game: State) => {
  return {
    teams: game.teams,
    users: game.users,
    options: game.options,
    suggestionCount: game.suggestions.length,
  };
};

const makeRouter = ({ db }: { db: Database }) => {
  const router = Router();
  const store = new Store(db);
  router.use(express.json());

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const data = await store.findGroupByID(id);
    const dto: RetrieveGroupResponse = {
      id: data.id,
      game: data.game ? convertGame(data.game) : null,
    };
    res.send(dto);
  });

  return router;
};

export default makeRouter;
