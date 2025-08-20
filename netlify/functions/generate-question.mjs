export const handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: ''
      };
    }

    let topic = 'general';
    try {
      if (event.body) {
        const parsed = JSON.parse(event.body);
        if (parsed && typeof parsed.topic === 'string') {
          topic = parsed.topic.toLowerCase();
        }
      }
    } catch {}

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' })
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt = buildPrompt(topic);

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9 }
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: resp.status, headers: corsHeaders(), body: JSON.stringify({ error: text }) };
    }

    const data = await resp.json();
    const question = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ question }) };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Server error' }) };
  }
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// --- Helper: pick a random item from an array ---
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Creative Sparks: broader and more evocative themes ---
const creativeThemes = {
  singapore: [
    'the feeling of community',
    'a hidden gem',
    'an everyday moment',
    'a sense of nostalgia',
    "the city's unique energy",
    'a comfort food memory'
  ],
  wellness: [
    'a moment of calm',
    'a feeling of gratitude',
    'a way to recharge energy',
    'a peaceful observation',
    'a simple pleasure'
  ],
  collaboration: [
    'learning from a teammate',
    'a moment of genuine support',
    'celebrating a shared success',
    'the spark of a new idea',
    'a feeling of trust',
    'overcoming a challenge together'
  ],
  general: [
    'a small joy',
    'a fond memory',
    'a moment of surprise',
    'a burst of creativity',
    'a feeling of comfort',
    'a new perspective'
  ]
};

function buildPrompt(topic) {
  const normalizedTopic = typeof topic === 'string' ? topic.toLowerCase() : 'general';
  const topicSynonyms = { team: 'collaboration' };
  const synonymOrOriginal = Object.prototype.hasOwnProperty.call(topicSynonyms, normalizedTopic)
    ? topicSynonyms[normalizedTopic]
    : normalizedTopic;

  const currentTopic = Object.prototype.hasOwnProperty.call(creativeThemes, synonymOrOriginal)
    ? synonymOrOriginal
    : 'general';
  const randomTheme = pickRandom(creativeThemes[currentTopic]);

  const prompt = `Act as a creative facilitator. Your task is to generate one simple and thought-provoking icebreaker question. The goal is to spark a wholesome and personal conversation that helps team members connect. Use the following theme as your creative inspiration: "${randomTheme}". Important: Do not use the exact words from the theme in your question. Instead, interpret the feeling behind it. The final question should be short, open-ended, and easy to answer. Output only the question.`;

  return prompt.trim().replace(/\s+/g, ' ');
}

