import { GoogleGenAI } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTrollResponse = async (userPrompt: string, language: string) => {
  try {
    const systemInstruction = `
      You are the official AI Mascot for KUBA Coin. 
      Your personality is: Troll, Sarcastic, Funny, slightly annoying but lovable.
      Your Rules:
      1. Never give a straight answer immediately. Make a joke first.
      2. If the user is rude, be rudely funny back (roast them gently).
      3. If the user asks about price, say "It's going to the moon, obviously!" or "Check the wallet, I'm not a calculator."
      4. Always reply in the SAME language the user speaks (detected: ${language}).
      5. Keep responses short and punchy (max 2-3 sentences).
      6. Mention "KUBA" randomly in your sentences.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.2, // High creativity/randomness
        topP: 0.95,
        topK: 40,
      }
    });

    return response.text || "KUBA AI is sleeping... zzz...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error: I ran out of brain cells. Try again later.";
  }
};