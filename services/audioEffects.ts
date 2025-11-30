
// A lightweight procedural audio synthesizer using Web Audio API
// No external MP3 files required.

const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// 1. CLASSIC THAI COMEDY "TUNG POH!" (Rimshot + Crash)
export const playTungPoh = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Snare (Noise)
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    // Tom/Kick (Oscillator)
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(1, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);

    // Crash Cymbal (Longer Noise)
    const crashBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const crashOut = crashBuffer.getChannelData(0);
    for (let i = 0; i < crashBuffer.length; i++) {
      crashOut[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const crash = ctx.createBufferSource();
    crash.buffer = crashBuffer;
    const crashFilter = ctx.createBiquadFilter();
    crashFilter.type = 'highpass';
    crashFilter.frequency.value = 2000;
    const crashGain = ctx.createGain();
    crashGain.gain.setValueAtTime(0.01, t); // Silence at start
    crashGain.gain.setValueAtTime(0.8, t + 0.1); // Hit after snare
    crashGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
    crash.connect(crashFilter);
    crashFilter.connect(crashGain);
    crashGain.connect(ctx.destination);
    crash.start(t);

  } catch (e) {
    console.error("Audio FX Error", e);
  }
};

// 2. CARTOON "BOING" (Spring sound)
export const playBoing = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(150, t);
    // Wobble up
    osc.frequency.linearRampToValueAtTime(300, t + 0.1);
    // Wobble down
    osc.frequency.linearRampToValueAtTime(150, t + 0.3);
    // Wobble up
    osc.frequency.linearRampToValueAtTime(300, t + 0.5);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  } catch (e) {}
};

// 3. GAME "LEVEL UP" (Coin/Success)
export const playCoin = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.setValueAtTime(1200, t + 0.1);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.setValueAtTime(0.1, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  } catch (e) {}
};

// 4. CARTOON LAUGHTER (Procedural)
export const playLaughter = () => {
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    
    // Create 3 quick bursts to simulate "Ha Ha Ha"
    for(let i = 0; i < 3; i++) {
       const start = t + (i * 0.12);
       const osc = ctx.createOscillator();
       osc.type = 'triangle'; // Cartoonish timbre
       
       // Pitch drop for each laugh burst
       osc.frequency.setValueAtTime(400, start);
       osc.frequency.exponentialRampToValueAtTime(300, start + 0.1);
       
       const gain = ctx.createGain();
       gain.gain.setValueAtTime(0, start);
       gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
       gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
       
       osc.connect(gain);
       gain.connect(ctx.destination);
       osc.start(start);
       osc.stop(start + 0.12);
    }
  } catch (e) {}
};

// Main Play Function
export const playSoundEffect = (mode: string) => {
  if (mode === 'off') return;

  switch (mode) {
    case 'comedy': // Default Thai Style
      playTungPoh();
      break;
    case 'cartoon':
      playBoing();
      break;
    case 'game':
      playCoin();
      break;
    case 'laughter':
      playLaughter();
      break;
    default:
      playTungPoh();
  }
};
