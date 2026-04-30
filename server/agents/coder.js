const { requestJson } = require("./llm-client");

async function code(state, task) {
  const output = await requestJson(
    "你是前端代码生成器。请严格返回 JSON，不要返回 markdown。",
    [
      "请根据任务输出需要写入的文件。",
      "返回格式：",
      "{",
      '  "changes": [',
      '    { "file": "src/App.jsx", "code": "...", "summary": "变更说明" }',
      "  ]",
      "}",
      `用户目标：${state.input}`,
      `当前步骤：${task.title}`,
      `步骤目标：${task.goal}`,
      `涉及文件：${task.files.join(", ") || "待确定"}`,
      `验收标准：${task.acceptance.join("；") || "无"}`
    ].join("\n")
  );

  if (!output || !Array.isArray(output.changes) || output.changes.length === 0) {
    throw new Error("Coder must return a non-empty changes array");
  }

  return output.changes.map((change) => ({
    file: change.file,
    code: change.code,
    summary: change.summary || `实现 ${task.title}`
  }));
}

module.exports = { code };
