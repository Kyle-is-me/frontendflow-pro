const fs = require("fs-extra");
const { resolveTaskPath } = require("../utils/path");

async function saveArtifacts(taskId, artifacts) {
  const filePath = resolveTaskPath(taskId, "artifacts.json");
  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, artifacts, { spaces: 2 });
}

async function readArtifacts(taskId) {
  const filePath = resolveTaskPath(taskId, "artifacts.json");

  if (!(await fs.pathExists(filePath))) {
    return [];
  }

  return fs.readJson(filePath);
}

module.exports = {
  saveArtifacts,
  readArtifacts
};
