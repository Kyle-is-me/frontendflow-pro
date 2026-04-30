const axios = require("axios");
const { OPENAI_API_KEY, MODEL } = require("../config");

function extractJson(content) {
  const trimmed = String(content || "").trim();

  if (!trimmed) {
    throw new Error("LLM returned empty content");
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const codeBlockMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);

    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim());
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw error;
  }
}

async function requestJson(systemPrompt, userPrompt) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      timeout: 60000
    }
  );

  const content = response.data.choices?.[0]?.message?.content;

  return extractJson(content);
}

module.exports = {
  requestJson,
  extractJson
};
