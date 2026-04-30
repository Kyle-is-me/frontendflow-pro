const { exec } = require("../tools/exec");

async function test(state) {
  try {
    const result = await exec("npm run build", {
      cwd: state.meta.projectDir
    });

    return { success: true, ...result };
  } catch (e) {
    return {
      success: false,
      error: e.message,
      details: e.details || null
    };
  }
}

module.exports = { test };
