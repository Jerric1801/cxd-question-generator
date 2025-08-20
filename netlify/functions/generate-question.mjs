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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
    const prompt = buildPrompt(topic);

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100,
          topP: Math.round((Math.random() * 0.25 + 0.7) * 100) / 100,
          topK: (function() { const opts = [32, 40, 64]; return opts[Math.floor(Math.random() * opts.length)]; })()
        }
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
    'morning commute',
    'lunch at a hawker centre',
    'a rainy evening after work',
    'chat over kopi at a neighbourhood spot',
    'diverse city festivals',
    'childhood snacks with friends'
  ],
  wellness: [
    'a calm minute between back-to-back meetings',
    'the small ritual that starts your day well',
    'finding balance during a busy week',
    'a tiny act of kindness to yourself',
    'the feeling after a mindful pause',
    'recharging without screens'
  ],
  collaboration: [
    'a teammate stepping in at the right moment',
    'a sketch that clarified a fuzzy idea',
    'a feedback exchange that built trust',
    'handing off work smoothly across roles',
    'celebrating a shared win after effort',
    'overcoming a blocker together'
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

// Topic-specific guidance to keep questions clearly on-theme
const topicGuidance = {
  singapore: [
    'Ensure the question clearly fits a Singapore context (e.g., commute habits, food culture, neighbourhood life). You may mention Singapore explicitly if it helps relevance, but avoid specific landmark names. Use simple, direct language; avoid poetic or metaphorical phrasing.',
    'Make it feel local to Singapore through subtle cues (e.g., shared food spots, daily routines) without naming brands or exact places. Keep language plain and concrete.'
  ],
  wellness: [
    'Ensure the question is clearly about personal wellbeing or mindfulness, inclusive and non-intrusive.',
    'Keep it anchored in everyday wellbeing practices suitable for a professional setting.'
  ],
  collaboration: [
    'Ensure the question is clearly about teamwork, communication, or shared work practices in a professional setting.',
    'Make it explicitly relevant to working with colleagues on projects, decisions, or feedback.'
  ],
  general: [
    'Keep it broadly applicable to any audience without niche references.'
  ]
};

// Variation controls for length and specificity
const lengthGuidance = [
  'Keep it very brief: one short sentence (7–12 words).',
  'Keep it concise: one sentence (10–18 words).',
  'Allow a bit more room: one medium-length sentence (15–25 words).',
  'Write a slightly more descriptive single sentence (up to 30 words).',
  'Use a two-clause single-sentence question joined by a comma.'
];

const specificityGuidance = [
  'Keep the question broad and universal.',
  'Aim for workplace relevance without referencing any specific company or tool.',
  'Invite a concrete example from recent experience.',
  'Invite a tiny story about a real moment.',
  'Invite a comparison between two choices or approaches.'
];

// Clarity controls to avoid overly complex or poetic writing
const clarityGuidance = [
  'Use simple, everyday words; avoid metaphors or poetic imagery.',
  'Aim for a Grade 6 reading level; keep sentences short.',
  'Prefer one straightforward clause; avoid stacked commas and semicolons.',
  'Avoid flowery adjectives; keep it direct and friendly.',
  'Be concrete and practical; avoid abstract phrasing.'
];

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

  const lengthDirective = pickRandom(lengthGuidance);
  const specificityDirective = pickRandom(specificityGuidance);
  const clarityDirective = pickRandom(clarityGuidance);
  const relevanceDirective = pickRandom(topicGuidance[currentTopic] || topicGuidance.general);

  const prompt = `Act as a creative facilitator. Topic: ${currentTopic}. Generate one thought-provoking icebreaker question that helps team members connect. Use this theme only as creative inspiration: "${randomTheme}". Do not use the exact words from the theme; interpret the feeling behind it. Stay on topic: ${relevanceDirective} Style: ${lengthDirective} ${specificityDirective} Clarity: ${clarityDirective} Output only the question (no preamble, numbering, or quotes).`;

  return prompt.trim().replace(/\s+/g, ' ');
}

