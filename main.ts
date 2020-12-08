import * as log from "https://deno.land/std@0.80.0/log/mod.ts";
import {
  serve,
  ServerRequest,
  Status,
} from "https://deno.land/std@0.80.0/http/mod.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.80.0/ws/mod.ts";
import { v4 } from "https://deno.land/std@0.80.0/uuid/mod.ts";

interface User {
  clientID: string;
  username: string;
}

interface Team {
  name: string;
  members: User[];
  currentDescriberIndex: number;
}

interface Suggestion {
  clientID: string;
  name: string;
}

interface Options {
  teams: number;
}

interface State {
  round: number;
  users: User[];
  suggestions: Suggestion[];
  teams: Team[];
  sockets: Map<string, WebSocket>;
  options: Options;
  currentTeamIndex: number;
}

let state: State;

const initialState = (): State => ({
  round: 0,
  users: [],
  suggestions: [],
  teams: [],
  sockets: new Map<string, WebSocket>(),
  options: {
    teams: 2,
  },
  currentTeamIndex: 0,
});

const handleNewUser = (
  clientID: string,
  { username }: { username: string },
) => {
  const { users } = state;
  if (username && username.length) {
    state.users = [
      ...users.filter((u) => u.clientID !== clientID),
      { clientID, username },
    ];
  }
};

const handleSuggestion = (
  clientID: string,
  { suggestion }: { suggestion: string },
) => {
  if (state.round === 0 && suggestion && suggestion.length) {
    state.suggestions = [...state.suggestions, { clientID, name: suggestion }];
  }
};

const handleStart = () => {
  state.round = 1;
  const numTeams = state.options.teams;
  const shuffleUsers = state.users.sort((a, b) =>
    a.clientID.localeCompare(b.clientID)
  );
  const teams = Array.from({ length: numTeams }).map((_, teamIdx) => ({
    name: `Team ${teamIdx + 1}`,
    members: state.users.filter((_, userIdx) => userIdx % numTeams === teamIdx),
    currentDescriberIndex: 0,
  }));
  state.teams = teams;
  state.currentTeamIndex = 0;
};

const broadcast = (category: string, data: object) =>
  state.sockets.forEach((sock) =>
    sock.send(JSON.stringify({ category, data }))
  );

const getMessageHandler = (clientID: string, sock: WebSocket) => {
  const send = (category: string, data: any) => {
    log.info({ to: clientID, category, data });
    sock.send(JSON.stringify({ category, data }));
  };
  send(
    "USER_LIST",
    { users: state.users.map((u) => u.username) },
  );
  return async (msg: string) => {
    const { category, data } = JSON.parse(msg);
    log.info({ from: clientID, category, data });
    switch (category) {
      case "NEW_USER":
        handleNewUser(clientID, data);
        broadcast(
          "USER_LIST",
          { users: state.users.map((u) => u.username) },
        );
        break;
      case "ADD_SUGGESTION":
        handleSuggestion(clientID, data);
        broadcast("SUGGESTION_COUNT", { count: state.suggestions.length });
        break;
      case "START_GAME":
        handleStart();
        broadcast("STARTING", {});
      default:
        break;
    }
  };
};

const handleWs = async (sock: WebSocket) => {
  const clientID = v4.generate();
  log.info(`client connected with ID ${clientID}`);
  state.sockets.set(clientID, sock);
  const handler = getMessageHandler(clientID, sock);
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        log.debug("ws:Text", ev);
        await handler(ev);
      } else if (ev instanceof Uint8Array) {
        log.debug("ws:Binary", ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        log.debug("ws:Ping", body);
      } else if (isWebSocketCloseEvent(ev)) {
        const { code, reason } = ev;
        log.debug("ws:Close", code, reason);
        state.sockets.delete(clientID);
        state.users = state.users.filter((u) => u.clientID !== clientID);
      }
    }
  } catch (err) {
    log.error(`failed to receive frame: ${err}`);
    if (!sock.isClosed) {
      state.sockets.delete(clientID);
      await sock.close(1000).catch(log.error);
    }
  }
};

const getResponse = async (req: ServerRequest) => {
  switch (req.url) {
    case "/":
    case "/index.html":
      return { body: await Deno.readFile("public/index.html") };
    case "/style.css":
      return { body: await Deno.readFile("public/style.css") };
    case "/client.js":
      return { body: await Deno.readFile("public/client.js") };
    case "/ws":
      const { conn, r: bufReader, w: bufWriter, headers } = req;
      acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      })
        .then(handleWs);
      return;
    default:
      return { body: "Not found.", status: Status.NotFound };
  }
};

const main = async () => {
  state = initialState();
  for await (const req of serve({ port: 8000 })) {
    const { method, url } = req;
    log.info(`incoming: ${method} ${url}`);
    try {
      const res = await getResponse(req);
      if (res) {
        log.info(`replying: ${res.status || Status.OK} ${method} ${url}`);
        req.respond(res);
      }
    } catch (err) {
      log.error(`failed to accept websocket: ${err}`);
      await req.respond({ status: 400 });
    }
  }
};

if (import.meta.main) {
  await main();
}
