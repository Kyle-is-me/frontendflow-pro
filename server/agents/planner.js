const { requestJson } = require("./llm-client");

async function plan(input) {
  const output = await requestJson(
    "你是前端任务规划器。请严格返回 JSON，不要返回额外解释。",
    [
      "请把用户需求拆解为可执行的前端开发步骤。",
      "返回格式必须是 JSON 数组，每项包含：",
      "title: 步骤名称",
      "goal: 该步骤目标",
      "files: 可能涉及的文件数组",
      "acceptance: 验收标准数组",
      `用户需求：${input}`
    ].join("\n")
  );

  if (!Array.isArray(output)) {
    throw new Error("Planner must return an array of steps");
  }

  return output.map((step, index) => ({
    title: step.title || `步骤 ${index + 1}`,
    goal: step.goal || String(input),
    files: Array.isArray(step.files) ? step.files : [],
    acceptance: Array.isArray(step.acceptance) ? step.acceptance : []
  }));
}

module.exports = { plan };
