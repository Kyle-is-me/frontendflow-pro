const axios = require("axios");
const { OPENAI_API_KEY, MODEL } = require("../config");

async function plan(input) {
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: MODEL,
      messages: [{ role: "user", content: "拆解步骤:" + input }]
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );

  return JSON.parse(res.data.choices[0].message.content);
}

module.exports = { plan };