import * as log from "https://deno.land/std@0.80.0/log/mod.ts";
import { serve, Status } from "https://deno.land/std@0.80.0/http/mod.ts";

const body = "Hello World\n";
const server = serve({ port: 8000 });

const getResponse = async (url: string) => {
  switch (url) {
    case "/":
      return { body: await Deno.readFile("public/index.html") };
    default:
      return { body: "Not found.", status: Status.NotFound };
  }
};

for await (const req of server) {
  log.info(`incoming: ${req.method} ${req.url}`);
  const res = await getResponse(req.url);
  log.info(`replying: ${res.status || Status.OK} ${req.method} ${req.url}`);
  req.respond(res);
}
