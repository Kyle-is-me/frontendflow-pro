const { exec } = require("child_process");
const { COMMAND_TIMEOUT_MS, WORKSPACE_DIR } = require("../config");
const { ensureInside } = require("../utils/path");

function run(command, options = {}) {
  const cwd = options.cwd || WORKSPACE_DIR;
  const timeoutMs = options.timeoutMs || COMMAND_TIMEOUT_MS;

  ensureInside(WORKSPACE_DIR, cwd);

  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd,
        timeout: timeoutMs
      },
      (error, stdout, stderr) => {
        const result = {
          command,
          cwd,
          stdout,
          stderr,
          exitCode: error && Number.isInteger(error.code) ? error.code : 0
        };

        if (error) {
          const wrappedError = new Error(
            stderr || error.message || "Command execution failed"
          );

          wrappedError.details = result;
          reject(wrappedError);
          return;
        }

        resolve(result);
      }
    );
  });
}

module.exports = { exec: run };
