const fs = require("fs-extra");
const path = require("path");
const { TASKS_DIR } = require("../config");
const { resolveTaskPath } = require("../utils/path");

async function ensureTaskDirs(taskId) {
  const taskDir = resolveTaskPath(taskId);

  await fs.ensureDir(taskDir);
  await fs.ensureDir(TASKS_DIR);

  return {
    taskDir,
    taskFile: resolveTaskPath(taskId, "task.json"),
    logsFile: resolveTaskPath(taskId, "logs.jsonl"),
    artifactsFile: resolveTaskPath(taskId, "artifacts.json")
  };
}

async function writeJson(filePath, value) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, value, { spaces: 2 });
}

async function createTask(state) {
  const files = await ensureTaskDirs(state.id);

  await writeJson(files.taskFile, state.toJSON());
  await writeJson(files.artifactsFile, state.artifacts);
  await fs.ensureFile(files.logsFile);

  return files;
}

async function saveTask(state) {
  const files = await ensureTaskDirs(state.id);

  await writeJson(files.taskFile, state.toJSON());
  await writeJson(files.artifactsFile, state.artifacts);
}

async function appendLog(taskId, entry) {
  const { logsFile } = await ensureTaskDirs(taskId);
  await fs.appendFile(logsFile, `${JSON.stringify(entry)}\n`, "utf8");
}

async function getTask(taskId) {
  const { taskFile } = await ensureTaskDirs(taskId);

  if (!(await fs.pathExists(taskFile))) {
    return null;
  }

  return fs.readJson(taskFile);
}

async function getLogs(taskId) {
  const { logsFile } = await ensureTaskDirs(taskId);

  if (!(await fs.pathExists(logsFile))) {
    return [];
  }

  const content = await fs.readFile(logsFile, "utf8");

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function getArtifacts(taskId) {
  const { artifactsFile } = await ensureTaskDirs(taskId);

  if (!(await fs.pathExists(artifactsFile))) {
    return [];
  }

  return fs.readJson(artifactsFile);
}

module.exports = {
  createTask,
  saveTask,
  appendLog,
  getTask,
  getLogs,
  getArtifacts
};
