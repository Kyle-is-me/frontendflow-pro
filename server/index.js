const express = require("express");
const taskRoutes = require("./routes/tasks");
const { PORT } = require("./config");

const app = express();
app.use(express.json());
app.use(taskRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
