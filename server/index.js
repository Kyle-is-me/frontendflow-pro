const express = require("express");
const State = require("./core/state");
const { runWorkflow } = require("./core/workflow");

const app = express();
app.use(express.json());

app.post("/run", async (req, res) => {
  const state = new State(req.body.prompt);
  const result = await runWorkflow(state);
  res.json(result);
});

app.listen(3000, () => {
  console.log("🚀 Running on http://localhost:3000");
});