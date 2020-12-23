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
    Object.assign(state, initialState());
    res.status(200).send();
  });
}

server.listen(PORT, () => {
  console.log(`Serving at http://localhost:${PORT}`);
});

const initialState = () => ({
  round: 0,
  users: [],
  teams: [],
  suggestions: [],
  options: {
    teams: 2,
    turnDurationSeconds: 60,
  },
  currentTeamIndex: 0,
  availableSuggestions: [],
});

const state = initialState();
const game = new Game(state);

class Client {
  constructor(socket) {
    this.sock = socket;
  }

  setUsername = ({ username }) => {
    game.addUser({ clientID: this.sock.id, username });
    io.emit("USER_LIST", { users: game.getUsers() });
  };

  welcome = () => {
    this.sock.emit("WELCOME", {
      clientID: this.sock.id,
      users: game.getUsers(),
    });
  };

  addSuggestion = ({ suggestion }) => {
    game.addSuggestion({ clientID: this.sock.id, suggestion });
    io.emit("NEW_SUGGESTION", { count: game.countSuggestions() });
  };

  startGame = () => {
    game.start();
    io.emit("NEW_TURN", game.getCurrentTurnDetails());
  };

  requestSuggestion = () => {
    const suggestion = game.getNextSuggestion();
    if (suggestion) {
      this.sock.emit("NEXT_SUGGESTION", { name: suggestion.name });
    } else {
      this.nextTurn();
    }
  };

  notifyScores = () => {
    io.emit("LATEST_SCORES", game.getScores());
  };

  guessCorrectly = ({ name }) => {
    game.guessCorrectly(name);
    this.notifyScores();
    this.requestSuggestion();
  };

  skip = ({ name }) => {
    game.skip(name);
    this.notifyScores();
    this.requestSuggestion();
  };

  nextTurn = () => {
    game.endTurn();
    io.emit("NEW_TURN", game.getCurrentTurnDetails());
  };

  registerHandler = (messageType, handler) => {
    this.sock.on(messageType, (data) => {
      try {
        handler(data);
      } catch (e) {
        console.error(
          `[${this.sock.id}] Failed to handle ${messageType} message due to`,
          e,
        );
      }
    });
  };
}

io.on("connection", (socket) => {
  console.log(`[${socket.id}] user connected`);
  socket.on("disconnect", (reason) => {
    console.log(`[${socket.id}] user disconnected for reason ${reason}`);
    // TODO remove user from list of players
  });

  const client = new Client(socket);
  client.welcome();

  client.registerHandler("SET_USERNAME", client.setUsername);
  client.registerHandler("ADD_SUGGESTION", client.addSuggestion);
  client.registerHandler("START_GAME", client.startGame);
  client.registerHandler("REQUEST_SUGGESTION", client.requestSuggestion);
  client.registerHandler("GUESS_CORRECTLY", client.guessCorrectly);
  client.registerHandler("SKIP", client.skip);
  client.registerHandler("END_TURN", client.nextTurn);
});
