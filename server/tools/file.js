const fs = require("fs-extra");
const path = require("path");
const { ensureInside } = require("../utils/path");

async function writeFiles(baseDir, changes) {
  const artifacts = [];

  for (const change of changes) {
    const fullPath = path.resolve(baseDir, change.file);

    ensureInside(baseDir, fullPath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, change.code, "utf8");

    artifacts.push({
      type: "file",
      file: change.file,
      absolutePath: fullPath,
      summary: change.summary || null
    });
  }

  return artifacts;
}

module.exports = { writeFiles };
