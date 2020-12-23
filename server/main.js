import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import Game from "./game.js";

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

class Client {
  constructor({ io, socket, game }) {
    this.sock = socket;
    this.replyOne = this.sock.emit.bind(this.sock);
    this.replyAll = io.emit.bind(io);
    this.game = game;
  }

  setUsername({ username }) {
    this.game.addUser({ clientID: this.sock.id, username });
    this.replyAll("USER_LIST", { users: this.game.getUsers() });
  }

  welcome() {
    this.replyOne("WELCOME", {
      clientID: this.sock.id,
      users: this.game.getUsers(),
    });
  }

  addSuggestion({ suggestion }) {
    this.game.addSuggestion({ clientID: this.sock.id, suggestion });
    this.replyAll("NEW_SUGGESTION", { count: this.game.countSuggestions() });
  }

  startGame() {
    this.game.start();
    this.replyAll("NEW_TURN", this.game.getCurrentTurnDetails());
  }

  requestSuggestion() {
    const suggestion = this.game.getNextSuggestion();
    if (suggestion) {
      this.replyOne("NEXT_SUGGESTION", { name: suggestion.name });
    } else {
      this.nextTurn();
    }
  }

  notifyScores() {
    this.replyAll("LATEST_SCORES", this.game.getScores());
  }

  guessCorrectly({ name }) {
    this.game.guessCorrectly(name);
    this.notifyScores();
    this.requestSuggestion();
  }

  skip({ name }) {
    this.game.skip(name);
    this.notifyScores();
    this.requestSuggestion();
  }

  nextTurn() {
    this.game.endTurn();
    this.replyAll("NEW_TURN", this.game.getCurrentTurnDetails());
  }

  registerHandler(messageType, handler) {
    this.sock.on(messageType, (data) => {
      try {
        handler.call(this, data);
      } catch (e) {
        console.error(
          `[${this.sock.id}] Failed to handle ${messageType} message due to`,
          e,
        );
      }
    });
  }
}

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
