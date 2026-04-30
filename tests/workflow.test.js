const test = require("node:test");
const assert = require("node:assert/strict");
const State = require("../server/core/state");
const { runWorkflow } = require("../server/core/workflow");

test("workflow retries build failures and succeeds after fixer output", async () => {
  const state = new State("build a page", {
    id: `workflow-test-${Date.now()}`,
    meta: {
      projectDir: "D:/virtual-project"
    }
  });

  let testAttempts = 0;
  let fixCalls = 0;
  let savedArtifacts = [];

  const result = await runWorkflow(state, {
    plan: async () => [
      {
        title: "Create App",
        goal: "Generate base app",
        files: ["src/App.jsx"],
        acceptance: ["build passes"]
      }
    ],
    design: async () => {},
    code: async () => [
      {
        file: "src/App.jsx",
        code: "export default function App() { return null; }",
        summary: "initial app"
      }
    ],
    test: async () => {
      testAttempts += 1;

      if (testAttempts === 1) {
        return {
          success: false,
          error: "build failed"
        };
      }

      return {
        success: true,
        stdout: "build ok"
      };
    },
    fix: async () => {
      fixCalls += 1;
      return [
        {
          file: "src/App.jsx",
          code: "export default function App() { return 'ok'; }",
          summary: "fix build"
        }
      ];
    },
    writeFiles: async (_projectDir, changes) =>
      changes.map((change) => ({
        type: "file",
        file: change.file,
        summary: change.summary
      })),
    taskRepo: {
      saveTask: async () => {},
      appendLog: async () => {}
    },
    artifactRepo: {
      saveArtifacts: async (_taskId, artifacts) => {
        savedArtifacts = artifacts;
      }
    },
    maxRetry: 2
  });

  assert.equal(result.status, "succeeded");
  assert.equal(testAttempts, 2);
  assert.equal(fixCalls, 1);
  assert.equal(savedArtifacts.length, 2);
  assert.equal(
    result.stepResults.some(
      (entry) => entry.stage === "fixing" && entry.success === true
    ),
    true
  );
});
