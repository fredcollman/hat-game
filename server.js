import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";

const PORT = 3001;
const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "client", "build")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
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
  availableSuggestions: [],
};

const getCurrentTeam = () => {
  return state.teams[state.currentTeamIndex];
};

const getCurrentDescriber = () => {
  const team = getCurrentTeam();
  const { clientID, username } = team.members[team.currentDescriberIndex];
  return {
    clientID,
    username,
    team: team.name,
  };
};

const getNextSuggestion = () => {
  const nonSkipped = state.availableSuggestions.filter((s) => !s.skipped);
  const randomIndex = Math.floor(Math.random() * nonSkipped.length);
  return nonSkipped[randomIndex];
};

const endTurn = () => {
  console.log(state);
  const team = state.teams[state.currentTeamIndex];
  team.currentDescriberIndex = (team.currentDescriberIndex + 1) %
    team.members.length;
  state.currentTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
  state.availableSuggestions = state.availableSuggestions.map((s) => ({
    ...s,
    skipped: false,
  }));
  if (!state.availableSuggestions.length) {
    startRound(state.round + 1);
  }
};

const startRound = (round) => {
  state.round = round;
  state.availableSuggestions = state.suggestions.map((s) => ({
    ...s,
    skipped: false,
  }));
};

const startGame = () => {
  const numTeams = state.options.teams;
  const teams = Array.from({ length: numTeams }).map((_, teamIdx) => ({
    name: `Team ${teamIdx + 1}`,
    members: state.users.filter((_, userIdx) => userIdx % numTeams === teamIdx),
    currentDescriberIndex: 0,
    guessedCorrectly: 0,
    skips: 0,
  }));
  state.teams = teams;
  state.currentTeamIndex = 0;
  startRound(1);
};

class Client {
  constructor(socket) {
    this.sock = socket;
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
    startGame();
    console.log(state);
    io.emit("NEW_TURN", {
      round: state.round,
      duration: state.options.turnDurationSeconds,
      describer: getCurrentDescriber(),
    });
  };

  requestSuggestion = () => {
    const suggestion = getNextSuggestion();
    if (suggestion) {
      this.sock.emit("NEXT_SUGGESTION", { name: suggestion.name });
    } else {
      this.nextTurn();
    }
  };

  notifyScores = () => {
    io.emit(
      "LATEST_SCORES",
      state.teams.map((t) => ({
        name: t.name,
        correct: t.guessedCorrectly,
        skips: t.skips,
      })),
    );
  };

  guessCorrectly = ({ name }) => {
    state.availableSuggestions = state.availableSuggestions.filter(
      (s) => s.name !== name,
    );
    getCurrentTeam().guessedCorrectly++;
    console.log("correct", name);
    this.notifyScores();
    this.requestSuggestion();
  };

  skip = ({ name }) => {
    state.availableSuggestions = state.availableSuggestions.map((s) =>
      s.name === name ? { ...s, skipped: true } : s
    );
    getCurrentTeam().skips++;
    console.log("skipped", name);
    this.notifyScores();
    this.requestSuggestion();
  };

  nextTurn = () => {
    endTurn();
    console.log(state);
    io.emit("NEW_TURN", {
      round: state.round,
      duration: state.options.turnDurationSeconds,
      describer: getCurrentDescriber(),
    });
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
