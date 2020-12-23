import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import low from "lowdb";
import FileAsync from "lowdb/adapters/FileAsync.js";
import Game from "./game.js";
import Client from "./client.js";

const PORT = 3001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const adapter = new FileAsync("db.json");
low(adapter)
  .then((db) => {
    let game = Game.create();

    app.use(express.static(path.join(__dirname, "client", "build")));
    app.get("/", function (req, res) {
      res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    });
    if (process.env.NODE_ENV === "development") {
      app.get("/__reset", (req, res) => {
        console.warn("RESETTING STATE");
        game = Game.create();
        res.status(200).send();
      });
    }
    return game;
  })
  .then((game) => {
    server.listen(PORT, () => {
      console.log(`Serving at http://localhost:${PORT}`);
    });

    io.on("connection", (socket) => {
      console.log(`[${socket.id}] user connected`);
      socket.on("disconnect", (reason) => {
        console.log(`[${socket.id}] user disconnected for reason ${reason}`);
        // TODO remove user from list of players
      });

      Client.prepare({ io, socket, game });
    });
  });
