const { exec } = require("../tools/exec");

async function design() {
  await exec("npm create vite@latest workspace -- --template react");
  await exec("cd workspace && npm install");
}

module.exports = { design };