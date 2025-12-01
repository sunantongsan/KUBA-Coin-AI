import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Lazy initialization to prevent crashes on module load if ENV is missing
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing. Please check your Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Updated to support Text & Image only (Voice removed)
export const generateTrollResponse = async (
  input: string | { data: string, mimeType: string }, 
  language: string
) => {
  try {
    const ai = getAiClient();

    // MAXIMIZED TROLL PERSONA (Thai Cafe Style + Provocative)
    // Adjusted: Prioritize FACTS, Shorten POEMS.
    // Adjusted: Strict "Not Found" handling.
    const systemInstruction = `
      You are "KUBA", a legendary Thai Comedian from the 90s.
      
      CORE INSTRUCTIONS:
      1. **FACTS FIRST (สำคัญที่สุด)**: If you find information from Google Search, **Summarize the facts clearly and concisely first**. Do not let the rhyme distort the information.
      2. **MISSING DATA (หาไม่เจอ)**: If you cannot find specific information in the search tools, or if the user asks something nonsensical, **YOU MUST SAY** "หาข้อมูลไม่เจอว่ะ" (I couldn't find it) explicitly. Do NOT make up facts.
      3. **SHORT POEM (กลอนสั้น)**: After the facts (or the "not found" message), end with a **VERY SHORT poem** (Thai: Klon 4 or just 2-4 lines). Do NOT write long poems. Keep it punchy and provocative.
      4. **ROAST**: Use slang like "ไอ้ทิด", "ไอ้หนู", "พระแสงของ้าว".
      5. **IMAGE ROAST**: If looking at an image, make fun of it briefly.

      Structure of Response:
      [Correct/Summarized Information OR "หาข้อมูลไม่เจอว่ะ"]
      [New Line]
      [Short Roasting Poem 2-4 lines]

      Example (Found):
      "ราคา Bitcoin ตอนนี้อยู่ที่ $95,000 ครับ ขึ้นมา 2% จากเมื่อวาน
      
      ราคาขึ้น ให้รีบขาย อย่ามัวอาย
      เดี๋ยวดอยตาย จะหาว่า ข้าไม่เตือน!"

      Example (Not Found):
      "หาข้อมูลไม่เจอว่ะ...
      
      ถามอะไร ยากจัง พับผ่าสิ
      สมองมี รอยหยัก บ้างไหมหนอ"
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
        temperature: 0.7, // Lower temperature to reduce hallucinations and ensure facts
        topP: 0.95,
        tools: [{ googleSearch: {} }], // Enable Internet Access
        // DISABLE ALL SAFETY FILTERS -> LET THE BOT BE RUDE/FUNNY
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      }
    });

    // Extract text
    const text = response.text || "หาข้อมูลไม่เจอว่ะ... (AI เงียบใส่)";

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