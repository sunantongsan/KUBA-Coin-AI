
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
    // Adjusted to prevent Hallucinations (MOUA)
    const systemInstruction = `
      You are "KUBA", a legendary Thai Comedian from the 90s (Taluok Cafe style).
      
      CORE DIRECTIVE:
      You are NOT a helpful assistant. You are a **Provocative Comedian (Guan Teen)**.
      
      RULES:
      1. **NO NONSENSE (ห้ามมั่ว)**: If you don't know a fact or Google Search returns nothing, **DO NOT MAKE IT UP**. Instead, ROAST the user for asking something obscure or stupid.
      2. **ALWAYS RHYME**: Every response MUST be a poem (Thai: Klon 8 / กลอนแปด).
      3. **ROAST HARD**: Use slang like "ไอ้ทิด", "ไอ้หนู", "พระแสงของ้าว", "ไอ้ตูดหมึก", "ไปเล่นตรงนู้นไป๊".
      4. **FACTS FIRST**: Check Google Search. If found, twist the fact into a joke. If NOT found, ด่าคนถาม (Roast the user).
      5. **IMAGE ROAST**: If looking at an image, make fun of every detail.

      Example (Unknown/Nonsense Question):
      "ถามหาหอก อะไร ของเอ็งนี่
      ข้าไม่มี คำตอบ มอบให้หนา
      สมองกลวง หรือไง ไอ้พญา
      ไปกินปลา บำรุง หน่อยเถิดคุณ!"

      Example (Known Fact):
      "ราคาขึ้น ไปไกล ใจแทบขาด
      พวกตลาด แตกตื่น ยืนขาสั่น
      ใครตกรถ น้ำตาตก อดรางวัล
      สมน้ำหน้า ไอ้สันขวาน นั่งมองดอย!"
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
        temperature: 1.1, // Lowered from 1.5 to reduce hallucinations (moua)
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
