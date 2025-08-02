// File: src/pages/api/generate-question.js
export async function GET({ request }) {
  const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "API key is missing." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
  
  // A very specific prompt to get just a question back
  const prompt = "Generate one, and only one, fun and lighthearted icebreaker question suitable for a professional team meeting. Do not add any preamble, quotation marks, or extra text. Just the question itself.";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API Error:", errorBody);
        throw new Error(`Gemini API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const question = data.candidates[0].content.parts[0].text.trim();

    return new Response(
      JSON.stringify({ question: question }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch question from the API." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
} 