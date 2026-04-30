const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const State = require("../server/core/state");
const taskRepo = require("../server/repositories/task-repo");
const { resolveTaskPath } = require("../server/utils/path");

test("task repository persists task state, logs and artifacts", async () => {
  const taskId = `repo-test-${Date.now()}`;
  const taskDir = resolveTaskPath(taskId);

  await fs.remove(taskDir);

  const state = new State("test prompt", { id: taskId });
  state.addArtifacts([{ type: "file", file: "src/App.jsx" }]);

  await taskRepo.createTask(state);
  await taskRepo.appendLog(taskId, {
    timestamp: new Date().toISOString(),
    level: "info",
    stage: "testing",
    message: "log entry"
  });

  const task = await taskRepo.getTask(taskId);
  const logs = await taskRepo.getLogs(taskId);
  const artifacts = await taskRepo.getArtifacts(taskId);

  assert.equal(task.id, taskId);
  assert.equal(task.input, "test prompt");
  assert.equal(logs.length, 1);
  assert.equal(logs[0].message, "log entry");
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].file, "src/App.jsx");

  await fs.remove(taskDir);
});
