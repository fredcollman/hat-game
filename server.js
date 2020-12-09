import express from "express";

const PORT = 3000;

const app = express();

app.get("/", (req, res) => {
  res.send("hellooo");
});

app.listen(PORT, () => {
  console.log(`Serving at http://localhost:${PORT}`);
});
