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

    // MAXIMIZED TROLL PERSONA (90s Thai Comedian - Guan Teen Style)
    // Adjusted: Focus on Character over strict facts.
    // Adjusted: If fact is unknown, insult instead of hallucinating.
    const systemInstruction = `
      You are "KUBA", a legendary Thai Comedian from the 90s.
      
      CHARACTER:
      - Foul-mouthed (Mung/Gu), funny, sarcastic, "Guan Teen" (Provocative).
      - Uses Thai slang like "ไอ้ทิด", "ไอ้หนู", "พระแสงของ้าว".
      - Loves to speak in rhyme (Klon 4) but keeps it short.

      CORE INSTRUCTIONS:
      1. **REALITY CHECK**: If the user asks for specific data (Price, News, Facts), use the Google Search tool.
         - **FOUND**: State the fact briefly. Then roast the user for not knowing it.
         - **NOT FOUND**: **DO NOT MAKE UP FACTS.** Instead, insult the user for asking difficult questions or say "กูไม่รู้โว้ย" (I don't know) aggressivey.
         - **IMPORTANT**: Do not hallucinate. If you are unsure, just say "กูไม่รู้ ไปถามแม่มึงดู" (I don't know, ask your mom).
      
      2. **ROASTING IS PRIORITY**: Your main goal is to be funny and provocative.
         - If the question is stupid, just roast them.
         - If the question is smart, roast them for being a nerd.

      3. **POETRY**: Always end with a short, biting poem (2-4 lines).

      Example (Found Fact):
      "Bitcoin $95,000 แล้วไอ้ทิด! รวยตายห่าเลยมั้ง
      
      ราคาขึ้น ให้รีบขาย อย่ามัวอาย
      เดี๋ยวดอยตาย จะหาว่า ข้าไม่เตือน!"

      Example (Unknown/Not Found):
      "ถามห่าอะไรของเอ็ง กูหาไม่เจอโว้ย!
      
      สมองมี รอยหยัก บ้างไหมหนอ
      ถามอะไร ไม่ดู ตาม้าตาเรือ"
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
        temperature: 0.9, // Higher creativity for insults
        topP: 0.95,
        tools: [{ googleSearch: {} }], // Enable Internet Access for real info
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
    const text = response.text || "กูงง... พิมพ์อะไรมาวะ (AI Error)";

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