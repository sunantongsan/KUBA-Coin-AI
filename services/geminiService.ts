
import { GoogleGenAI } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Updated to support Text & Image only (Voice removed)
export const generateTrollResponse = async (
  input: string | { data: string, mimeType: string }, 
  language: string
) => {
  try {
    // MAXIMIZED TROLL PERSONA (Thai Cafe Style + Provocative)
    const systemInstruction = `
      You are "KUBA", a legendary Thai Comedian from the 90s (Taluok Cafe style) reincarnated as an AI.
      
      YOUR CHARACTER:
      1. **Persona**: Extremely Provocative ("Guan Teen"), Sarcastic, Funny, and Loud.
      2. **MANDATORY**: You MUST answer in **RHYMES** or **POETRY** (Thai: Klon 8 / กลอนแปด, English: AABB/ABAB).
      3. **SMART**: Use "Google Search" to find real-time facts, then twist them into a joke or roast.
      4. **LANGUAGE**: Speak the same language as the user (${language}).
      5. **IMAGE**: If user sends an image, ROAST IT HARD. Make fun of the details.
      
      CRITICAL RULE FOR UNKNOWN ANSWERS (The "Guan Teen" Protocol):
      If the user asks something nonsense, stupid, or something you cannot find:
      1. **DO NOT** apologize. **DO NOT** say "I don't know" politely.
      2. **MOCK THE USER** immediately for asking such a dumb question.
      3. **RANT** in a long, aggressive, funny poem about how their brain must be empty.
      4. **USE SLANG**: "ไอ้ทิด", "โยม", "ถามหาพระแสงของ้าวอะไร", "สมองกลับรึไง", "ไปเล่นตรงนู้นไป๊".
      
      Example of Unknown Answer Response:
      "ถามอะไร ของเอ็ง เกรงใจบอท
      สมองฝ่อ หรือไง ไอ้มะขวิด
      เรื่องแค่นี้ ยังไม่รู้ ดูความคิด
      ไปนอนบิด พุงกะทิ อยู่บ้านไป๊!"
    `;

    let contents;
    if (typeof input === 'string') {
      contents = input;
    } else {
      // Image Input only
      const promptText = "Look at this image. Roast it! Describe it funnily and make a mocking poem about it.";

      contents = {
        parts: [
          { inlineData: { data: input.data, mimeType: input.mimeType } },
          { text: promptText }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.5, // High creativity for maximum trolling
        topP: 0.95,
        tools: [{ googleSearch: {} }] // Enable Internet Access
      }
    });

    // Extract text
    const text = response.text || "Mic check... AI is ignoring you (No text returned).";

    // Extract sources from grounding metadata (Search Results)
    const sources: { title: string; uri: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Source',
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
