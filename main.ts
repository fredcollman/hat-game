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

interface State {
  users: string[];
}

let state: State;

const mergeState = (newState: State) => {
  state = { ...state, ...newState };
};

const getState = (): State => ({ ...state });

const handleNewUser = ({ username }: { username: string }) => {
  const { users } = getState();
  if (username && username.length) {
    mergeState({
      users: [...users, username],
    });
  }
};

const send = (sock: WebSocket, category: string, data: any) => {
  sock.send(JSON.stringify({ category, data }));
};

const getMessageHandler = (sock: WebSocket) =>
  async (msg: string) => {
    const { category, data } = JSON.parse(msg);
    log.info({ category, data });
    switch (category) {
      case "NEW_USER":
        handleNewUser(data);
        return await send(sock, "USER_LIST", { users: getState().users });
      default:
        await sock.send(msg);
    }
  };

const handleWs = async (sock: WebSocket) => {
  log.info("socket connected!");
  const handler = getMessageHandler(sock);
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
      }
    }
  } catch (err) {
    log.error(`failed to receive frame: ${err}`);
    if (!sock.isClosed) {
      await sock.close(1000).catch(log.error);
    }
  }
};

const getResponse = async (req: ServerRequest) => {
  switch (req.url) {
    case "/":
    case "/index.html":
      return { body: await Deno.readFile("public/index.html") };
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

const initialState = (): State => ({
  users: [],
});

const main = async () => {
  mergeState(initialState());
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
