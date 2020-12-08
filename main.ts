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

const handleWs = async (sock: WebSocket) => {
  console.log("socket connected!");
  try {
    for await (const ev of sock) {
      if (typeof ev === "string") {
        // text message.
        console.log("ws:Text", ev);
        await sock.send(ev);
      } else if (ev instanceof Uint8Array) {
        // binary message.
        console.log("ws:Binary", ev);
      } else if (isWebSocketPingEvent(ev)) {
        const [, body] = ev;
        // ping.
        console.log("ws:Ping", body);
      } else if (isWebSocketCloseEvent(ev)) {
        // close.
        const { code, reason } = ev;
        console.log("ws:Close", code, reason);
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`);

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error);
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

const main = async () => {
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
      console.error(`failed to accept websocket: ${err}`);
      await req.respond({ status: 400 });
    }
  }
};

if (import.meta.main) {
  await main();
}
