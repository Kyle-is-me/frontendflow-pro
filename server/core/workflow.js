const { MAX_RETRY } = require("../config");
const planner = require("../agents/planner");
const architect = require("../agents/architect");
const coder = require("../agents/coder");
const tester = require("../agents/tester");
const fixer = require("../agents/fixer");
const taskRepo = require("../repositories/task-repo");
const artifactRepo = require("../repositories/artifact-repo");
const fileTools = require("../tools/file");

async function persistState(state, repositories) {
  await repositories.taskRepo.saveTask(state);
  await repositories.artifactRepo.saveArtifacts(state.id, state.artifacts);
}

async function recordStage(state, stage, result, repositories) {
  state.addStepResult({
    stage,
    ...result
  });
  await persistState(state, repositories);
}

async function applyChanges(state, stage, changes, dependencies, repositories) {
  const artifacts = await dependencies.writeFiles(state.meta.projectDir, changes);
  state.addArtifacts(
    artifacts.map((artifact, index) => ({
      ...artifact,
      stage,
      summary: changes[index]?.summary || artifact.summary
    }))
  );
  await persistState(state, repositories);
}

async function runWorkflow(state, overrides = {}) {
  const dependencies = {
    plan: overrides.plan || planner.plan,
    design: overrides.design || architect.design,
    code: overrides.code || coder.code,
    test: overrides.test || tester.test,
    fix: overrides.fix || fixer.fix,
    writeFiles: overrides.writeFiles || fileTools.writeFiles
  };
  const repositories = {
    taskRepo: overrides.taskRepo || taskRepo,
    artifactRepo: overrides.artifactRepo || artifactRepo
  };
  const maxRetry = overrides.maxRetry || MAX_RETRY;

  try {
    state.setStatus("running");
    await persistState(state, repositories);

    state.setCurrentStep("planning");
    state.log("开始规划任务", { stage: "planning" });
    state.steps = await dependencies.plan(state.input, state);
    await recordStage(state, "planning", {
      success: true,
      stepsPlanned: state.steps.length
    }, repositories);

    state.setCurrentStep("bootstrap");
    state.log("初始化前端工作区", { stage: "bootstrap" });
    await dependencies.design(state);
    await recordStage(state, "bootstrap", {
      success: true,
      projectDir: state.meta.projectDir
    }, repositories);

    for (const step of state.steps) {
      state.setCurrentStep("coding");
      state.log(`开始执行步骤: ${step.title}`, {
        stage: "coding",
        meta: { title: step.title }
      });

      const changes = await dependencies.code(state, step);
      await applyChanges(state, "coding", changes, dependencies, repositories);
      await recordStage(state, "coding", {
        success: true,
        title: step.title,
        filesChanged: changes.map((change) => change.file)
      }, repositories);

      let passed = false;

      for (let attempt = 0; attempt <= maxRetry; attempt += 1) {
        state.setCurrentStep("testing");
        state.log(`执行构建验证，第 ${attempt + 1} 次`, {
          stage: "testing",
          meta: { title: step.title, attempt: attempt + 1 }
        });

        const result = await dependencies.test(state);

        if (result.success) {
          await recordStage(state, "testing", {
            success: true,
            title: step.title,
            attempt: attempt + 1,
            stdout: result.stdout
          }, repositories);
          passed = true;
          break;
        }

        await recordStage(state, "testing", {
          success: false,
          title: step.title,
          attempt: attempt + 1,
          error: result.error
        }, repositories);

        if (attempt === maxRetry) {
          throw new Error(result.error);
        }

        state.setCurrentStep("fixing");
        state.log(`构建失败，开始修复，第 ${attempt + 1} 次`, {
          stage: "fixing",
          meta: { title: step.title, attempt: attempt + 1 }
        });

        const fixes = await dependencies.fix(state, result);
        await applyChanges(state, "fixing", fixes, dependencies, repositories);
        await recordStage(state, "fixing", {
          success: true,
          title: step.title,
          attempt: attempt + 1,
          filesChanged: fixes.map((change) => change.file)
        }, repositories);
      }

      if (!passed) {
        throw new Error(`Step failed: ${step.title}`);
      }
    }

    state.setCurrentStep("finalizing");
    state.log("任务完成", { stage: "finalizing" });
    state.setStatus("succeeded");
    await persistState(state, repositories);

    return state;
  } catch (err) {
    state.error = err.message || String(err);
    state.log(state.error, {
      level: "error",
      stage: state.currentStep || "workflow"
    });
    state.setStatus("failed");
    await persistState(state, repositories);
    return state;
  }
}

module.exports = { runWorkflow };
