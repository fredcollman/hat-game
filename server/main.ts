import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import low from "lowdb";
import FileAsync from "lowdb/adapters/FileAsync.js";
import Client from "./client";
import userApp from "./user";

const PORT = 3001;
const rootDir = path.resolve();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(rootDir, "client", "build")));
app.get("/", function (req, res) {
  res.sendFile(path.join(rootDir, "client", "build", "index.html"));
});

const adapter = new FileAsync("db.json");
low(adapter)
  .then((db) => {
    db.defaults({ games: [], groups: [], users: [] }).write();
    return db;
  })
  .then((db) => {
    app.use("/user", userApp({ db }));

    server.listen(PORT, () => {
      console.log(`Serving at http://localhost:${PORT}`);
    });

    io.on("connection", (socket) => {
      console.log(`[${socket.id}] user connected`);
      socket.on("disconnect", (reason: string) => {
        console.log(`[${socket.id}] user disconnected for reason ${reason}`);
        // TODO remove user from list of players
      });

      Client.prepare({ io, socket, db });
    });
  });
