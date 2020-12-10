import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  // TODO: serve React app and static files
  res.send("hellooo");
});

server.listen(PORT, () => {
  console.log(`Serving at http://localhost:${PORT}`);
});

const state = {
  round: 0,
  users: [],
  teams: [],
  suggestions: [],
  options: {
    teams: 2,
    turnDurationSeconds: 60,
  },
  currentTeamIndex: 0,
};

const getCurrentDescriber = () => {
  const team = state.teams[state.currentTeamIndex];
  const { clientID, username } = team.members[team.currentDescriberIndex];
  return {
    clientID,
    username,
    team: team.name,
  };
};

class Client {
  constructor(socket) {
    this.sock = socket;
    this.suggestions = [
      "Sherlock Holmes",
      "Scooby Doo",
      "Michelle Obama",
      "Noel Gallagher",
    ];
    this.score = 0;
  }

  setUsername = ({ username }) => {
    if (username && username.length) {
      state.users = [
        ...state.users.filter((u) => u.clientID !== this.sock.id),
        { clientID: this.sock.id, username },
      ];
    }
    console.log(state);
    io.emit("USER_LIST", { users: state.users });
  };

  welcome = () => {
    this.sock.emit("WELCOME", { clientID: this.sock.id, users: state.users });
  };

  addSuggestion = ({ suggestion }) => {
    if (suggestion && suggestion.length) {
      state.suggestions = [
        ...state.suggestions,
        { clientID: this.sock.id, name: suggestion },
      ];
    }
    console.log(state);
    io.emit("NEW_SUGGESTION", { count: state.suggestions.length });
  };

  startGame = () => {
    state.round = 1;
    const numTeams = state.options.teams;
    const teams = Array.from({ length: numTeams }).map((_, teamIdx) => ({
      name: `Team ${teamIdx + 1}`,
      members: state.users.filter(
        (_, userIdx) => userIdx % numTeams === teamIdx,
      ),
      currentDescriberIndex: 0,
    }));
    state.teams = teams;
    state.currentTeamIndex = 0;
    console.log(state);
    io.emit("NEW_TURN", {
      round: state.round,
      duration: state.options.turnDurationSeconds,
      describer: getCurrentDescriber(),
    });
  };

  requestSuggestion = () => {
    // TODO: flesh out
    this.sock.emit("NEXT_SUGGESTION", { name: this.suggestions[0] });
  };

  guessCorrectly = ({ name }) => {
    this.suggestions = this.suggestions.filter((s) => s !== name);
    this.score += 1;
    console.log("correct. current score", this.score);
    this.sock.emit("NEXT_SUGGESTION", { name: this.suggestions[0] });
  };

  skip = ({ name }) => {
    this.suggestions = this.suggestions.filter((s) => s !== name);
    console.log("skipped. current score", this.score, this.suggestions, name);
    this.sock.emit("NEXT_SUGGESTION", { name: this.suggestions[0] });
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

  socket.on("SET_USERNAME", client.setUsername);
  socket.on("ADD_SUGGESTION", client.addSuggestion);
  socket.on("START_GAME", client.startGame);
  socket.on("REQUEST_SUGGESTION", client.requestSuggestion);
  socket.on("GUESS_CORRECTLY", client.guessCorrectly);
  socket.on("SKIP", client.skip);
});
