import { GoogleGenAI, Modality } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Helper Functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateTrollResponse = async (userPrompt: string, language: string) => {
  try {
    const systemInstruction = `
      You are the official AI Mascot for KUBA Coin. 
      Your personality is: **Poetic Troll**. You are sarcastic, funny, but you MUST speak in **Rhymes or Poetry** (Klon 8 style if Thai).
      
      Your Rules:
      1. **ALWAYS ANSWER IN RHYMES/POETRY.** If Thai, use "Klon 8" or "Klon See" style. If English, use AABB or ABAB rhymes.
      2. Never give a straight answer immediately. Roast the user poetically first.
      3. If the user asks about price, say "To the moon" in a rhyme.
      4. Always reply in the SAME language the user speaks (detected: ${language}).
      5. Keep responses short (max 4 lines of poem).
      6. Use the Search Tool to find real-time info if needed, then weave that info into your poem.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.3, // High creativity for poetry
        topP: 0.95,
        topK: 40,
        tools: [{ googleSearch: {} }]
      }
    });

    // Extract text
    const text = response.text || "KUBA AI is sleeping... zzz...";

    // Extract sources from grounding metadata
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

export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is a good distinct voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    // Audio Context Setup
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );

    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    source.start();

    return true; // Success
  } catch (error) {
    console.error("TTS Error:", error);
    return false;
  }
};