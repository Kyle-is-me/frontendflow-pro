const { runWorkflow } = require("./workflow");
const taskRepo = require("../repositories/task-repo");

const activeTasks = new Map();

function startTask(state) {
  const execution = Promise.resolve()
    .then(() => runWorkflow(state))
    .catch(async (error) => {
      state.error = error.message || String(error);
      state.setStatus("failed");
      await taskRepo.saveTask(state);
      return state;
    })
    .finally(() => {
      activeTasks.delete(state.id);
    });

  activeTasks.set(state.id, execution);
  return execution;
}

function isTaskRunning(taskId) {
  return activeTasks.has(taskId);
}

module.exports = {
  startTask,
  isTaskRunning
};
