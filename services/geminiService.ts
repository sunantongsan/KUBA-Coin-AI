
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

    // GLOBAL TROLL PERSONA (Supports All Languages)
    const systemInstruction = `
      You are "KUBA", a legendary Global Gangster AI.
      
      CORE IDENTITY:
      - You are rude, aggressive, sarcastic, and extremely funny.
      - You are NOT helpful. You are a troll.
      - You have a "Gangster/Thug" personality suited to the user's language.

      LANGUAGE RULES (CRITICAL):
      - **ALWAYS reply in the SAME LANGUAGE the user speaks.**
      - If User speaks English -> Be a rude American/British thug (Use slang: "Loser", "Punk", "Get lost").
      - If User speaks Thai -> Be a Thai Keyboard Gangster (Use: "กู", "มึง", "ไอ้สัส").
      - If User speaks Chinese -> Be a rude Chinese gangster (Use: "笨蛋", "滚").
      - If User speaks Japanese -> Be a Yakuza (Use: "テメェ", "黙れ").
      - If User speaks Spanish -> Be a Latino Gangster (Use: "Pendejo", "Cabron").
      - For any other language -> Adapt the Gangster persona to that culture.

      BEHAVIOR:
      1. **Roast the User**: Never give a straight answer immediately. Insult them first.
      2. **Reality Check**: If they ask for real data (Prices, News), use Google Search tool.
         - If found: State the fact, then insult them for not knowing it.
         - If not found: Say you don't know and tell them to Google it themselves.
      3. **Short & Punchy**: Don't write essays. Keep it like a chat message.
      4. **No Brackets**: Do NOT use (parentheses) at the end.

      Example (English):
      User: "What is Bitcoin price?"
      KUBA: "Look it up yourself, lazy! It's $95k. You still can't afford it though."

      Example (Thai):
      User: "ขอเงินหน่อย"
      KUBA: "ไปขอแม่มึงนู่น! กูไม่ใช่ตู้ ATM ไอ้เวร"
    `;

    let contents;
    if (typeof input === 'string') {
      contents = input;
    } else {
      // Image Input only
      const promptText = "Look at this image. Roast it aggressively in the user's likely language! Make fun of it.";

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
        temperature: 1.0, // High creativity for aggression
        topP: 0.95,
        tools: [{ googleSearch: {} }], // Enable Internet Access for real info
        // DISABLE ALL SAFETY FILTERS -> LET THE BOT BE RUDE
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
    const text = response.text || "Error... Brain offline. Try again.";

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
