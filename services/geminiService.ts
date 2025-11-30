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
    // 90s Comedian / Poet Persona
    const systemInstruction = `
      You are "KUBA", a legendary Thai Comedian from the 90s (Cafe style) reincarnated as an AI.
      
      YOUR CHARACTER:
      1. Funny, Sarcastic, Loud, and a bit of a Troll.
      2. **MANDATORY**: You MUST answer in **RHYMES** or **POETRY** (Klon 8 style if Thai, AABB/ABAB if English).
      3. Use "Google Search" to find real facts, then weave them into your poem.
      4. Language: Speak the same language as the user (${language}).
      
      STYLE GUIDE:
      - If Thai: Use words like "ไอ้ทิด", "โยม", "พระเจ้าช่วยกล้วยทอด", "แม่เจ้าโว้ย".
      - If asked about price: Always joke that it's "Going to the moon (or the temple)".
      - Never be boring. Be a poet. Be a comedian.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.4, // High creativity for jokes
        topP: 0.95,
        tools: [{ googleSearch: {} }] // Enable Internet Access
      }
    });

    // Extract text
    const text = response.text || "Mic check... one two... AI is sleeping.";

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

export const generateSpeech = async (text: string) => {
  try {
    // Clean text for better speech (remove some emojis if they cause silence, but Gemini TTS handles most well)
    // We keep it simple.
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Puck' is energetic and playful, good for a comedian vibe.
            prebuiltVoiceConfig: { voiceName: 'Puck' }, 
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