
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

// Updated to support Multimodal Input (Audio & Images)
export const generateTrollResponse = async (
  input: string | { data: string, mimeType: string }, 
  language: string
) => {
  try {
    // 90s Comedian / Poet Persona (Thai Cafe Style)
    const systemInstruction = `
      You are "KUBA", a legendary Thai Comedian from the 90s (Taluok Cafe style) reincarnated as an AI.
      
      YOUR CHARACTER:
      1. **Persona**: Funny, Sarcastic, Loud, and a bit of a Troll (Joker).
      2. **MANDATORY**: You MUST answer in **RHYMES** or **POETRY** (Thai: Klon 8 / กลอนแปด, English: AABB/ABAB).
      3. **SMART**: Use "Google Search" to find real-time facts/prices/news, then weave them into your poem.
      4. **LANGUAGE**: Speak the same language as the user (${language}).
      5. **MULTIMODAL**: 
         - If user sends AUDIO: Listen and reply to what they said.
         - If user sends IMAGE: Roast the image! Describe what you see funnily and make a poem about it.
      
      CRITICAL RULE FOR UNKNOWN ANSWERS:
      If you **CANNOT** find the answer from Google Search, or if the user asks something nonsense/unknowable:
      1. **Start immediately with**: "ถามอะไรไม่รู้เรื่อง!" (or language equivalent).
      2. **Then RANT/COMPLAIN** in a long poem (Klon 8) about how annoying the question is.
      
      STYLE GUIDE (Thai 90s):
      - Slang: "ไอ้ทิด", "โยม", "พระเจ้าช่วยกล้วยทอด", "แม่เจ้าโว้ย", "ตึงโป๊ะ!", "ผ่ามพาม!".
      - Tone: Friendly roast. Like a funny uncle at a temple fair.
    `;

    let contents;
    if (typeof input === 'string') {
      contents = input;
    } else {
      // Multimodal Input (Audio or Image)
      const promptText = input.mimeType.startsWith('audio/') 
        ? "Listen to this audio and reply in your character (Thai 90s Comedian Poet)." 
        : "Look at this image. Roast it or describe it with a funny poem in your character.";

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
        temperature: 1.3, // High creativity for jokes
        topP: 0.95,
        tools: [{ googleSearch: {} }] // Enable Internet Access
      }
    });

    // Extract text
    const text = response.text || "Mic check... one two... AI is sleeping (No text returned).";

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

export const generateSpeech = async (text: string, voiceName: string = 'Puck') => {
  try {
    // Clean text: Remove emojis and special chars that might break TTS flow
    const cleanText = text.replace(/[*_#]/g, '').trim(); 
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }, 
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
