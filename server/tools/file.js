const fs = require("fs-extra");
const path = require("path");

async function writeFile(file, code) {
  const fullPath = path.join("workspace", file);
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, code);
}

module.exports = { writeFile };