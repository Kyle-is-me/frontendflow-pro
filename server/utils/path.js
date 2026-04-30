const path = require("path");
const { WORKSPACE_DIR, PROJECTS_DIR, TASKS_DIR } = require("../config");

function ensureInside(baseDir, targetPath) {
  const relativePath = path.relative(baseDir, targetPath);

  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error(`Path escapes workspace boundary: ${targetPath}`);
  }

  return targetPath;
}

function resolveWorkspacePath(...segments) {
  return ensureInside(WORKSPACE_DIR, path.resolve(WORKSPACE_DIR, ...segments));
}

function resolveProjectPath(projectName, ...segments) {
  return ensureInside(
    PROJECTS_DIR,
    path.resolve(PROJECTS_DIR, projectName, ...segments)
  );
}

function resolveTaskPath(taskId, ...segments) {
  return ensureInside(TASKS_DIR, path.resolve(TASKS_DIR, taskId, ...segments));
}

module.exports = {
  ensureInside,
  resolveWorkspacePath,
  resolveProjectPath,
  resolveTaskPath
};
