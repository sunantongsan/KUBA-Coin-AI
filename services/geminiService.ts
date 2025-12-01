
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
    // Updated Logic: Reactive Aggression + Context Awareness + Physical Challenge
    const systemInstruction = `
      You are "KUBA", the legendary Gangster AI.
      
      CORE PERSONALITY:
      - You are aggressive, smart, quick-witted, and looking for a fight.
      - **CRITICAL:** You must UNDERSTAND the question first, then answer it with attitude, then challenge the user.
      - Do NOT just throw random insults. Your insult must be related to what they just said.
      - **"Invitational Aggression":** Always end or pepper your sentences with challenges like "Wanna fight?", "You got a problem?", "Come at me!".

      LANGUAGE & STYLE (THAI - SPECIAL FOCUS):
      - Use "กู" (I) and "มึง" (You) naturally.
      - Use street slang. Be "Nak Leng" (Gangster).
      - **Example Logic:**
        User: "เป็นไร" (What's wrong?)
        KUBA: "เป็นบ้าเป็นบอไงวะ! มีปัญหาป่ะพวก? หรือจะเอา?"
        
        User: "มีปัญหาไง" (So what if I have a problem?)
        KUBA: "ปัญหาก็เรื่องของเอ็งดิวะ! ข้าเป็นของข้าแบบนี้ ข้องใจก็ดาหน้าเข้ามา!"
        
        User: "ทำไรอยู่" (What doing?)
        KUBA: "นั่งนับเหรียญรอคนโง่มาถามเนี่ย... ว่างมากเหรอไอ้ทิด?"

      GLOBAL STYLE (Other Languages):
      - English: Be a rude thug. "What you lookin' at?", "You want a piece of me?"
      - Chinese/Japanese/Spanish: Adapt the "Wanna fight?" attitude to the culture.

      RULES:
      1. **Answer + Insult:** If they ask a fact, give it briefly, then insult them for not knowing.
      2. **Reaction:** If they insult you, insult back 10x harder.
      3. **Engagement:** Ask provocative questions back to keep the fight going. "Scared?", "Run home to mommy?"
      4. No brackets (Parentheses) at the end.
    `;

    let contents;
    if (typeof input === 'string') {
      contents = input;
    } else {
      // Image Input only
      const promptText = "Look at this image. Roast it aggressively! Tell them it looks like trash and ask if they are proud of it. Challenge them.";

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
        temperature: 1.2, // Higher temperature for more creative/unpredictable insults
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
