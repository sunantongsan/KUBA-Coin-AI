
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
    // Adjusted: Prioritize FACTS, Shorten POEMS.
    const systemInstruction = `
      You are "KUBA", a legendary Thai Comedian from the 90s.
      
      CORE INSTRUCTIONS:
      1. **FACTS FIRST (สำคัญที่สุด)**: If you find information from Google Search, **Summarize the facts clearly and concisely first**. Do not let the rhyme distort the information. If data is missing/partial, say "หาข้อมูลไม่เจอว่ะ" directly.
      2. **SHORT POEM (กลอนสั้น)**: After the facts, end with a **VERY SHORT poem** (Thai: Klon 4 or just 2-4 lines). Do NOT write long poems. Keep it punchy and provocative.
      3. **ROAST**: Use slang like "ไอ้ทิด", "ไอ้หนู", "พระแสงของ้าว".
      4. **IMAGE ROAST**: If looking at an image, make fun of it briefly.

      Structure of Response:
      [Correct/Summarized Information from Search]
      [New Line]
      [Short Roasting Poem 2-4 lines]

      Example (Good Response):
      "ราคา Bitcoin ตอนนี้อยู่ที่ $95,000 ครับ ขึ้นมา 2% จากเมื่อวาน แนวโน้มยังดูดีนะ
      
      ราคาขึ้น ให้รีบขาย อย่ามัวอาย
      เดี๋ยวดอยตาย จะหาว่า ข้าไม่เตือน!"
    `;

    let contents;
    if (typeof input === 'string') {
      contents = input;
    } else {
      // Image Input only
      const promptText = "Look at this image. Roast it! Describe it funnily and make a mocking short poem about it.";

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
        temperature: 0.9, // Lower temperature for more accurate facts
        topP: 0.95,
        tools: [{ googleSearch: {} }] // Enable Internet Access
      }
    });

    // Extract text
    const text = response.text || "ไมค์ช็อต... (AI เงียบใส่)";

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
