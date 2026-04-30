const express = require("express");
const taskService = require("../services/task-service");

const router = express.Router();

router.post("/tasks", async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const task = await taskService.createTask(prompt);
    res.status(202).json({
      id: task.id,
      status: task.status,
      createdAt: task.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/tasks/:id", async (req, res) => {
  const task = await taskService.getTask(req.params.id);

  if (!task) {
    res.status(404).json({ error: "task not found" });
    return;
  }

  res.json(task);
});

router.get("/tasks/:id/logs", async (req, res) => {
  const logs = await taskService.getTaskLogs(req.params.id);

  if (!logs) {
    res.status(404).json({ error: "task not found" });
    return;
  }

  res.json(logs);
});

router.get("/tasks/:id/result", async (req, res) => {
  const result = await taskService.getTaskResult(req.params.id);

  if (!result) {
    res.status(404).json({ error: "task not found" });
    return;
  }

  res.json(result);
});

router.post("/run", async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    const task = await taskService.createTask(prompt);
    res.status(202).json({
      deprecated: true,
      message: "Please use POST /tasks instead.",
      id: task.id,
      status: task.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
