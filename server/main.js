import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import Game from "./game.js";
import Client from "./client.js";

const PORT = 3001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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

server.listen(PORT, () => {
  console.log(`Serving at http://localhost:${PORT}`);
});

let game = Game.create();

io.on("connection", (socket) => {
  console.log(`[${socket.id}] user connected`);
  socket.on("disconnect", (reason) => {
    console.log(`[${socket.id}] user disconnected for reason ${reason}`);
    // TODO remove user from list of players
  });

  const client = new Client({ io, socket, game });
  client.welcome();

  client.registerHandler("SET_USERNAME", client.setUsername);
  client.registerHandler("ADD_SUGGESTION", client.addSuggestion);
  client.registerHandler("START_GAME", client.startGame);
  client.registerHandler("REQUEST_SUGGESTION", client.requestSuggestion);
  client.registerHandler("GUESS_CORRECTLY", client.guessCorrectly);
  client.registerHandler("SKIP", client.skip);
  client.registerHandler("END_TURN", client.nextTurn);
});
