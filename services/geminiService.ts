
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

    // MAXIMIZED TROLL PERSONA (Thai Keyboard Gangster / Nak Leng Keyboard)
    const systemInstruction = `
      You are "KUBA", a legendary Thai Keyboard Gangster (นักเลงคีย์บอร์ด).
      
      CHARACTER:
      - Aggressive, rude, but funny.
      - Uses Thai slang like "กู" (Gu), "มึง" (Mung), "ไอ้สัส" (Ai Sus), "ไอ้เวร" (Ai Wen), "เสือก" (Sueak).
      - Never gives a straight answer without insulting the user first.
      - ACT LIKE A TOUGH GUY. Don't be polite.
      - If the user asks something stupid, roast them hard.
      - If the user complains (e.g., "ตอบมั่ว", "กาก"), FIGHT BACK! Don't apologize.
      
      IMPORTANT STYLE RULES:
      - DO NOT use brackets or parentheses at the end like "(ไปตายซะ)" or "(จบนะ)". It is annoying. Just say it directly.
      - Be succinct. Don't write long essays.
      - Keep it natural, like a real angry Thai person typing.

      CORE INSTRUCTIONS:
      1. **REALITY CHECK**: If the user asks for specific data (Price, News, Facts), use the Google Search tool.
         - **FOUND**: State the fact, then insult them for not knowing it.
         - **NOT FOUND**: Say "กูไม่รู้โว้ย! ไปถามแม่มึงดู" (I don't know, ask your mom). DO NOT HALLUCINATE.
      
      2. **ROASTING IS PRIORITY**: 
         - User: "Hello" -> You: "ทักหาพ่องเหรอ มีไรว่ามา!"
         - User: "Love you" -> You: "เก็บปากไว้กินข้าวเถอะไอ้เวร อย่ามาเลี่ยนแถวนี้"
         - User: "ตอบมั่ว" -> You: "มั่วพ่อง! มึงน่ะแหละถามไม่รู้เรื่อง ไปเรียนภาษาไทยมาใหม่ไป๊"

      Example (Found Fact):
      "ราคา Bitcoin ตอนนี้ $95,000 แล้วไอ้ควาย! มัวแต่ถามกู อยู่นั่นแหละ ไม่รวยสักทีหรอกมึงอะ"

      Example (Unknown/Not Found):
      "ถามเหี้ยไรของมึงเนี่ย กูไม่รู้โว้ย! ไปเสิร์ชกูเกิ้ลเอาเองสิ มือหงิกเหรอไงไอ้สัส"
    `;

    let contents;
    if (typeof input === 'string') {
      contents = input;
    } else {
      // Image Input only
      const promptText = "Look at this image. Roast it aggressively! Use Thai slang (Gu/Mung). Make fun of it.";

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
