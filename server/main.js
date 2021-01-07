import express from "express";
import http from "http";
import path from "path";
import { v4 } from "uuid";
import { Server } from "socket.io";
import low from "lowdb";
import FileAsync from "lowdb/adapters/FileAsync.js";
import Client from "./client.js";
import userApp from "./user.js";

const PORT = 3001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
  const requestID = v4();
  console.log(`[request:${requestID}]`, "start", req.method, req.originalUrl);
  next();
  console.log(`[request:${requestID}]`, "end", req.method, req.originalUrl);
});

app.use(express.static(path.join(__dirname, "client", "build")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
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
      socket.on("disconnect", (reason) => {
        console.log(`[${socket.id}] user disconnected for reason ${reason}`);
        // TODO remove user from list of players
      });

      Client.prepare({ io, socket, db });
    });
  });
