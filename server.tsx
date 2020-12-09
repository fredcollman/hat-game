import { Application, Router } from "https://deno.land/x/oak@v6.0.1/mod.ts";
import { React } from "./client/deps.tsx";
import { renderToString } from "https://esm.sh/react-dom@17.0.1/server";
import App from "./client/App.tsx";

function handlePage(ctx: any) {
  try {
    const body = renderToString(<App />);
    ctx.response.body = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script type="module" src="/browser.js"></script>
  </head>
  <body >
    <div id="root">${body}</div>
  </body>
  </html>`;
  } catch (error) {
    console.error(error);
  }
}

const [diagnostics, js] = await Deno.bundle(
  "./client/index.tsx",
  undefined,
  { lib: ["dom", "dom.iterable", "esnext"] },
);

if (import.meta.main) {
  const app = new Application();
  const router = new Router();
  router.get("/", handlePage);
  router.get("/browser.js", (ctx: any) => {
    ctx.response.type = "text/javascript";
    ctx.response.body = js;
  });
  app.use(router.routes());
  app.use(router.allowedMethods());
  console.log("server is running on http://localhost:8000/");

  await app.listen({ port: 8000 });
}
