const path = require("path");
const State = require("../core/state");
const runner = require("../core/runner");
const taskRepo = require("../repositories/task-repo");
const artifactRepo = require("../repositories/artifact-repo");
const { PROJECTS_DIR } = require("../config");

function buildProjectMeta(taskId) {
  return {
    projectName: taskId,
    projectDir: path.join(PROJECTS_DIR, taskId)
  };
}

async function createTask(input) {
  const state = new State(input);

  state.meta = buildProjectMeta(state.id);
  state.setLogHandler((entry) => taskRepo.appendLog(state.id, entry));

  await taskRepo.createTask(state);
  runner.startTask(state);

  return state.toJSON();
}

async function getTask(taskId) {
  const task = await taskRepo.getTask(taskId);

  if (!task) {
    return null;
  }

  return {
    ...task,
    isRunning: runner.isTaskRunning(taskId)
  };
}

async function getTaskLogs(taskId) {
  const task = await taskRepo.getTask(taskId);

  if (!task) {
    return null;
  }

  return taskRepo.getLogs(taskId);
}

async function getTaskResult(taskId) {
  const task = await taskRepo.getTask(taskId);

  if (!task) {
    return null;
  }

  const artifacts = await artifactRepo.readArtifacts(taskId);

  return {
    id: task.id,
    status: task.status,
    error: task.error,
    steps: task.steps,
    stepResults: task.stepResults,
    artifacts,
    meta: task.meta,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt
  };
}

module.exports = {
  createTask,
  getTask,
  getTaskLogs,
  getTaskResult
};
