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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
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

function buildPrompt(topic) {
  const normalizedTopic = typeof topic === 'string' ? topic.toLowerCase() : 'general';
  const topicSynonyms = { team: 'collaboration' };
  const synonymOrOriginal = Object.prototype.hasOwnProperty.call(topicSynonyms, normalizedTopic)
    ? topicSynonyms[normalizedTopic]
    : normalizedTopic;
  const resolvedTopic = Object.prototype.hasOwnProperty.call(promptIngredients, synonymOrOriginal)
    ? synonymOrOriginal
    : 'general';

  const topicSpec = promptIngredients[resolvedTopic];
  const selectedSubTopic = pickRandom(topicSpec.subTopics);
  const selectedFormat = pickRandom(topicSpec.formats);
  const selectedTone = pickRandom(topicSpec.tones);
  const constraint = maybeConstraint(resolvedTopic);

  const prompt = `Generate one, and only one, icebreaker question suitable for a professional team meeting. Topic: "${resolvedTopic}". Specifically, craft ${selectedFormat} ${selectedSubTopic}. Use a ${selectedTone} tone that is inclusive and engaging. ${constraint} Do not include any preamble, numbering, quotation marks, or explanations. Output only the question.`;

  return prompt.trim().replace(/\s+/g, ' ');
}

// --- Dynamic prompt "recipe" ingredients ---
const promptIngredients = {
  singapore: {
    subTopics: [
      'local food',
      'Singlish quirks',
      'a specific neighborhood',
      'public transport',
      'childhood snacks',
      'hawker centres',
      'local architecture',
      'festivals and holidays'
    ],
    formats: [
      'a question about an unpopular opinion on',
      'a "what if" question about',
      'a nostalgic question about',
      'a question that compares',
      'a fun fact question about',
      'a recommendation question about'
    ],
    tones: ['humorous', 'nostalgic', 'quirky', 'thought-provoking']
  },
  wellness: {
    subTopics: [
      'a small daily ritual',
      'a way to de-stress',
      'a non-screen activity',
      'a moment of gratitude',
      'a favorite type of music for focus',
      'a simple mindfulness practice',
      'supportive habits at work'
    ],
    formats: [
      'a question asking to share',
      'a question about a recent discovery related to',
      'a gentle question about a personal preference for',
      'a forward-looking question about',
      'a reflection question about'
    ],
    tones: ['calm', 'encouraging', 'warm', 'uplifting']
  },
  collaboration: {
    subTopics: [
      'a recent team win',
      'a learning from a mistake',
      'a way to give better feedback',
      'a moment of great teamwork',
      'a tool that helps collaboration',
      'improving meetings',
      'sharing context efficiently'
    ],
    formats: [
      'a reflective question about',
      'a question that seeks a story about',
      'a question that asks for a practical tip on',
      'a hypothetical scenario question about',
      'a question that compares approaches to'
    ],
    tones: ['practical', 'optimistic', 'curious', 'constructive']
  },
  general: {
    subTopics: [
      'a favorite movie',
      'a hidden talent',
      'a dream vacation',
      'a first concert',
      'a book that changed your perspective',
      'a favorite board game',
      'a hobby you picked up recently'
    ],
    formats: [
      'a fun "would you rather" question involving',
      'a question about the best part of',
      'a question asking for a recommendation on',
      'a "desert island" question about',
      'a question comparing two choices related to'
    ],
    tones: ['playful', 'curious', 'lighthearted', 'whimsical']
  }
};

// --- Negative constraints to reduce repetition of common answers ---
const negativeConstraints = {
  singapore: [
    'Avoid mentioning chilli crab or chicken rice.',
    'Do not reference the Merlion or Marina Bay Sands.',
    'Avoid naming HDB or ERP explicitly.'
  ],
  wellness: [
    'Avoid suggesting meditation or yoga.',
    'Do not mention step counters or specific calorie goals.'
  ],
  collaboration: [
    'Avoid mentioning stand-up meetings or retrospectives by name.',
    'Do not reference specific tools like Slack or Jira.'
  ],
  general: [
    'Avoid clichéd topics like coffee or pizza.',
    'Do not ask about cats versus dogs.'
  ]
};

function maybeConstraint(topic) {
  const roll = Math.random();
  if (roll < 0.35 && Object.prototype.hasOwnProperty.call(negativeConstraints, topic)) {
    return pickRandom(negativeConstraints[topic]);
  }
  return '';
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

