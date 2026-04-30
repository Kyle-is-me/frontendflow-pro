const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { ensureInside } = require("../server/utils/path");

test("ensureInside allows paths inside the workspace", () => {
  const baseDir = path.resolve("workspace");
  const targetPath = path.join(baseDir, "projects", "demo", "src", "App.jsx");

  assert.equal(ensureInside(baseDir, targetPath), targetPath);
});

test("ensureInside rejects paths that escape the workspace", () => {
  const baseDir = path.resolve("workspace");
  const outsidePath = path.resolve(baseDir, "..", "outside.txt");

  assert.throws(() => ensureInside(baseDir, outsidePath), /escapes workspace boundary/);
});
