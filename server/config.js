const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const WORKSPACE_DIR = path.resolve(
  ROOT_DIR,
  process.env.WORKSPACE || "workspace"
);
const TASKS_DIR = path.join(WORKSPACE_DIR, "tasks");
const PROJECTS_DIR = path.join(WORKSPACE_DIR, "projects");

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

module.exports = {
  ROOT_DIR,
  PORT: toPositiveInteger(process.env.PORT, 3000),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  MODEL: process.env.MODEL || "gpt-4o-mini",
  WORKSPACE_DIR,
  TASKS_DIR,
  PROJECTS_DIR,
  MAX_RETRY: toPositiveInteger(process.env.MAX_RETRY, 3),
  COMMAND_TIMEOUT_MS: toPositiveInteger(
    process.env.COMMAND_TIMEOUT_MS,
    120000
  )
};
