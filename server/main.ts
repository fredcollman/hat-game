import express from "express";
import http from "http";
import path from "path";
import { v4 } from "uuid";
import low from "lowdb";
import FileAsync from "lowdb/adapters/FileAsync.js";
import apolloServer from "./apollo";

const PORT = 3001;
const rootDir = path.resolve();

const app = express();
const httpServer = http.createServer(app);

app.use((req, res, next) => {
  const id = v4();
  console.log(`[r:${id}] start ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    console.log(
      `[r:${id}] end ${req.method} ${req.originalUrl} ${res.statusCode}`,
    );
  });
  next();
});

app.use(express.static(path.join(rootDir, "client", "build")));
app.get("/", function (req, res) {
  res.sendFile(path.join(rootDir, "client", "build", "index.html"));
});

const adapter = new FileAsync("db.json");
low(adapter)
  .then((db) => {
    db.defaults({ games: [], groups: [], users: [] }).write();
    return db;
  })
  .then((db) => {
    const apollo = apolloServer({ app, db, httpServer });

    httpServer.listen(PORT, () => {
      console.log(`Serving at http://localhost:${PORT}${apollo.graphqlPath}`);
      console.log(
        `Subscriptions ready at ws://localhost:${PORT}${apollo.subscriptionsPath}`,
      );
    });
  });
