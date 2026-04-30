const { exec } = require("../tools/exec");

async function test() {
  try {
    await exec("cd workspace && npm run build");
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

module.exports = { test };