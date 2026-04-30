const axios = require("axios");
const { writeFile } = require("../tools/file");
const { OPENAI_API_KEY, MODEL } = require("../config");

async function code(state, task) {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: MODEL,
      messages: [{ role: "user", content: "写代码:" + task }]
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );

  const output = JSON.parse(res.data.choices[0].message.content);
  await writeFile(output.file, output.code);
}

module.exports = { code };