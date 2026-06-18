const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function cleanJson(text) {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

async function generateQuestions(role, topic, difficulty, count = 5) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are an expert technical interviewer. Generate exactly ${count} interview questions for a "${role}" role, focused on "${topic}", at "${difficulty}" difficulty level.

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation, no extra text before or after.

Format:
[
  { "question": "your question here" },
  { "question": "your question here" }
]`,
      },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0].message.content;
  return JSON.parse(cleanJson(text));
}

async function evaluateAnswer(question, answer, role) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are an expert technical interviewer evaluating a candidate for a "${role}" position.

Question: "${question}"
Candidate Answer: "${answer}"

IMPORTANT: Return ONLY a valid JSON object. No markdown, no explanation, no extra text before or after.

Format:
{
  "score": <integer between 1 and 10>,
  "feedback": "<2-3 sentences of overall feedback>",
  "strengths": "<1-2 sentences on what was good>",
  "improvements": "<1-2 sentences on what to improve>"
}

If the answer is empty or off-topic, give score 1-3 with constructive feedback.`,
      },
    ],
    temperature: 0.7,
  });

  const text = response.choices[0].message.content;
  return JSON.parse(cleanJson(text));
}

module.exports = { generateQuestions, evaluateAnswer };