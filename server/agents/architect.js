const fs = require("fs-extra");
const path = require("path");
const { exec } = require("../tools/exec");
const { PROJECTS_DIR } = require("../config");

async function design(state) {
  const projectName = state.id;
  const projectDir = path.join(PROJECTS_DIR, projectName);

  await fs.ensureDir(PROJECTS_DIR);
  state.meta.projectName = projectName;
  state.meta.projectDir = projectDir;

  await exec(`npm create vite@latest ${projectName} -- --template react`, {
    cwd: PROJECTS_DIR
  });
  await exec("npm install", {
    cwd: projectDir
  });

  return {
    projectName,
    projectDir
  };
}

module.exports = { design };
