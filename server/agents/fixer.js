const { requestJson } = require("./llm-client");

async function fix(state, error) {
  const output = await requestJson(
    "你是前端构建错误修复器。请严格返回 JSON，不要返回 markdown。",
    [
      "请根据构建错误返回需要修改的文件。",
      "返回格式：",
      "{",
      '  "changes": [',
      '    { "file": "src/App.jsx", "code": "...", "summary": "修复说明" }',
      "  ]",
      "}",
      `用户目标：${state.input}`,
      `当前阶段：${state.currentStep || "fixing"}`,
      `最近步骤结果：${JSON.stringify(state.stepResults.slice(-3))}`,
      `最近产物：${JSON.stringify(state.artifacts.slice(-5))}`,
      `错误信息：${typeof error === "string" ? error : JSON.stringify(error)}`
    ].join("\n")
  );

  if (!output || !Array.isArray(output.changes) || output.changes.length === 0) {
    throw new Error("Fixer must return a non-empty changes array");
  }

  return output.changes.map((change) => ({
    file: change.file,
    code: change.code,
    summary: change.summary || "修复构建错误"
  }));
}

module.exports = { fix };
