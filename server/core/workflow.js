const { plan } = require("../agents/planner");
const { design } = require("../agents/architect");
const { code } = require("../agents/coder");
const { test } = require("../agents/tester");
const { fix } = require("../agents/fixer");

async function runWorkflow(state) {
  try {
    state.log("Planning...");
    state.steps = await plan(state.input);

    await design(state);

    for (let step of state.steps) {
      await code(state, step);
      let result = await test(state);

      if (!result.success) {
        await fix(state, result.error);
      }
    }

    return state;
  } catch (err) {
    state.error = err.toString();
    return state;
  }
}

module.exports = { runWorkflow };