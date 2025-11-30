
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateLocalResponse, getGreeting } from '../services/localAi';
import { generateTrollResponse, generateSpeech } from '../services/geminiService';
import { playSoundEffect } from '../services/audioEffects'; // Import Sound FX Engine
import { ChatMessage } from '../types';
import { MONETAG_DIRECT_LINK, INTERACTION_REWARD, TELEGRAM_BOT_USERNAME, AD_REWARD_QUOTA } from '../constants';

const Chat: React.FC = () => {
  const { state, decrementQuota, addQuota, incrementBalance, setSelectedVoice, setSoundMode } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false); // New state for text dictation
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 90s Thai Comedian Voice Options
  const voiceOptions = [
    { id: 'Puck', name: 'Nong Joke', desc: 'Energetic & Prankster', icon: '🤪', color: 'bg-yellow-500' },
    { id: 'Fenrir', name: 'Uncle Kom', desc: 'Deep, Raspy & Aggressive', icon: '🤬', color: 'bg-red-700' },
    { id: 'Charon', name: 'Boss Thep', desc: 'Serious, Deep & Deadpan', icon: '🕶️', color: 'bg-blue-900' },
    { id: 'Zephyr', name: 'Je Mam', desc: 'Sassy, Fast & High-pitched', icon: '💃', color: 'bg-pink-500' },
  ];

  // Sound Effect Modes
  const sfxOptions = [
    { id: 'comedy', name: '90s Comedy', desc: '"Tung Poh!" Drum', icon: '🥁' },
    { id: 'cartoon', name: 'Cartoon', desc: '"Boing" & "Slips"', icon: '🪀' },
    { id: 'laughter', name: 'Sitcom', desc: '"Ha Ha Ha" FX', icon: '😆' },
    { id: 'game', name: 'Retro Game', desc: '8-bit Pings', icon: '👾' },
    { id: 'off', name: 'No Effects', desc: 'Just Silence', icon: '🔇' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getGreeting(state.language);
      setMessages([{
        id: 'init-greeting',
        role: 'model',
        text: greeting,
        timestamp: Date.now()
      }]);
    }
  }, []);

  // --- AUDIO MESSAGE RECORDING ---
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        handleSendMedia(audioBlob, 'audio');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Cannot access microphone. Please check your browser or Telegram permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  // --- TEXT DICTATION (SPEECH-TO-TEXT) ---
  const handleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice typing is not supported on this browser/device. Try using the keyboard's voice input.");
      return;
    }

    if (isDictating) return; // Prevent double clicks

    const recognition = new SpeechRecognition();
    recognition.lang = state.language; // Use app language
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsDictating(true);
      playSoundEffect('game');
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Dictation error", event.error);
      setIsDictating(false);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied.");
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => (prev ? prev + ' ' : '') + transcript);
    };

    try {
        recognition.start();
    } catch(e) {
        console.error("Failed to start dictation", e);
        setIsDictating(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendMedia = async (blob: Blob, type: 'audio' | 'image') => {
    if (state.dailyQuota <= 0) {
      handleWatchAd();
      return;
    }

    const base64Data = await blobToBase64(blob);
    const mimeType = blob.type || (type === 'audio' ? 'audio/webm' : 'image/jpeg');
    const displayUrl = URL.createObjectURL(blob);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: type === 'audio' ? "🎤 Voice Message" : "📷 Image Upload",
      timestamp: Date.now(),
      attachment: {
        type: type,
        url: displayUrl,
        mimeType: mimeType
      }
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    decrementQuota();

    try {
        const { text: responseText, sources } = await generateTrollResponse({ data: base64Data, mimeType }, state.language);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: Date.now(),
          sources: sources
        };

        setMessages(prev => [...prev, aiMsg]);
        incrementBalance(INTERACTION_REWARD);

        // Play SFX & Speech
        if (isSoundEnabled) {
          playSoundEffect(state.soundMode);
          playTextToSpeech(responseText);
        }
    } catch (error) {
        console.error("Media processing failed", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "My brain failed to process that. Try again!",
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleSendMedia(file, 'image');
    }
  };

  const handleSendMessage = async () => {
    const textToSend = inputText;
    
    if (!textToSend.trim()) return;
    if (state.dailyQuota <= 0) {
      handleWatchAd();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    decrementQuota();

    try {
      const { text: responseText, sources } = await generateTrollResponse(userMsg.text, state.language);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
        sources: sources
      };

      setMessages(prev => [...prev, aiMsg]);
      incrementBalance(INTERACTION_REWARD);

      // Play SFX & Speech
      if (isSoundEnabled) {
        playSoundEffect(state.soundMode);
        playTextToSpeech(responseText);
      }
      
    } catch (error) {
      console.warn("Gemini unavailable, falling back to Local AI");
      try {
        const fallbackText = await generateLocalResponse(userMsg.text, state.language);
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: fallbackText + "\n(My poet brain is offline 🐹)",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
        incrementBalance(INTERACTION_REWARD);
        if (isSoundEnabled) playSoundEffect(state.soundMode);
      } catch (localError) {
        console.error("Critical Failure", localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playTextToSpeech = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    
    // Pass selected voice from state
    await generateSpeech(cleanText, state.selectedVoice);
    
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const handleWatchAd = async () => {
    // Monetag Direct Link Implementation
    if (window.confirm("Quota หมดแล้วจ้า! ไปดูโฆษณาแก้เซ็งสักแป๊บมั้ย? (Open Ad Link to get +3 Chats)")) {
      
      // Use Telegram's openLink for better compatibility (requires v6.4+), fallback to window.open
      if (window.Telegram?.WebApp?.openLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
        window.Telegram.WebApp.openLink(MONETAG_DIRECT_LINK, { try_instant_view: false });
      } else {
        window.open(MONETAG_DIRECT_LINK, '_blank', 'noopener,noreferrer');
      }

      // Simulate reward grant logic
      setIsLoading(true);
      setTimeout(() => {
        addQuota();
        setIsLoading(false);
        playSoundEffect('game'); // Success Sound
        // Show success message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: `เยี่ยมมากไอ้ทิด! ได้โควต้าเพิ่ม ${AD_REWARD_QUOTA} ครั้งแล้ว\n(Great job! Quota replenished.)`,
          timestamp: Date.now()
        }]);
      }, 3000);
    }
  };

  const handleShare = () => {
    const appUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`; 
    const shareText = "This KUBA AI is roasting me in poems! 🤣 Come earn coins.";
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;

    // openTelegramLink requires v6.4+
    if (window.Telegram?.WebApp?.openTelegramLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
        window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else {
        window.open(telegramShareUrl, '_blank');
    }
    incrementBalance(100);
    playSoundEffect('game');
  };

  const handleSnapshot = async () => {
    if (!chatContainerRef.current || !window.html2canvas) return;
    try {
      playSoundEffect('cartoon');
      const canvas = await window.html2canvas(chatContainerRef.current, {
        backgroundColor: '#1a1a1a',
        ignoreElements: (element) => element.tagName === 'BUTTON' || element.tagName === 'INPUT'
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        alert("Snapshot taken!");
      });
    } catch (e) {
      console.error("Snapshot failed", e);
    }
  };

  const handleFeedback = async (msgId: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => msg.id === msgId ? { ...msg, feedback: type } : msg));
    playSoundEffect('cartoon');
    try {
        await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: msgId, type, timestamp: Date.now() })
        });
    } catch (e) {}
  };

  const getChaosBadge = (id: string) => {
    const badges = ['🤡', '🎤', '💩', '🥁', '🤪', '🎸', '🤣', '👻'];
    return badges[parseInt(id.slice(-3)) % badges.length];
  };

  const getRotation = (id: string) => parseInt(id.slice(-2)) % 2 === 0 ? 'rotate-1' : '-rotate-1';

  return (
    <div className="flex flex-col h-full relative" ref={chatContainerRef}>
      {/* Studio Settings Modal (Voice & Sound) */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-kuba-yellow rounded-2xl p-6 w-full max-w-sm relative shadow-2xl animate-bounce-slow max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-kuba-yellow uppercase text-center mb-4 tracking-wider border-b border-gray-700 pb-2">
              🎙️ Studio Settings
            </h3>
            
            {/* Voice Selection */}
            <div className="mb-6">
              <h4 className="text-white font-bold mb-2 text-sm uppercase">1. Choose Persona</h4>
              <div className="grid grid-cols-2 gap-3">
                {voiceOptions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoice(v.id);
                      playTextToSpeech("Test 1, 2, 3... Ha ha ha!");
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all active:scale-95 ${
                      state.selectedVoice === v.id 
                        ? 'border-white bg-kuba-yellow text-black shadow-[0_0_15px_gold]' 
                        : 'border-gray-700 bg-gray-800 text-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${v.color} flex items-center justify-center text-lg mb-1 shadow-inner border border-black/20`}>
                      {v.icon}
                    </div>
                    <span className="font-bold text-xs">{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Effect Selection */}
            <div>
              <h4 className="text-white font-bold mb-2 text-sm uppercase">2. Sound Effects</h4>
              <div className="space-y-2">
                {sfxOptions.map((sfx) => (
                   <button
                    key={sfx.id}
                    onClick={() => {
                      setSoundMode(sfx.id as any);
                      playSoundEffect(sfx.id);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg border transition-all ${
                      state.soundMode === sfx.id 
                        ? 'bg-blue-900 border-blue-400 text-white' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                    }`}
                   >
                     <span className="text-xl mr-3">{sfx.icon}</span>
                     <div className="flex flex-col text-left">
                       <span className="font-bold text-sm">{sfx.name}</span>
                       <span className="text-[10px] opacity-70">{sfx.desc}</span>
                     </div>
                     {state.soundMode === sfx.id && <span className="ml-auto text-green-400 font-bold">✓</span>}
                   </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Top Bar with Sound Toggle */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 flex-grow flex justify-between items-center text-sm shadow-inner border border-gray-700">
          <span className="text-gray-400 font-mono">QUOTA: <span className="text-kuba-yellow font-bold text-lg">{state.dailyQuota}</span>/5</span>
        </div>
        
        {/* Voice/Sound Settings Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1 gap-1">
          <button 
            onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
            className={`p-2 rounded-md text-xs font-bold transition-all ${
              isSoundEnabled 
                ? 'bg-kuba-yellow text-black shadow-sm' 
                : 'text-gray-400'
            }`}
          >
            {isSoundEnabled ? '🔊' : '🔇'}
          </button>
          
           <button 
              onClick={() => setShowVoiceModal(true)}
              className="p-2 rounded-md bg-gray-600 text-white text-xs hover:bg-gray-500 active:scale-90 flex items-center gap-1"
              title="Studio Settings"
           >
              <span>⚙️</span>
           </button>
        </div>

        <button onClick={handleSnapshot} className="bg-gray-700 text-gray-300 p-2 rounded-lg text-xs" title="Snapshot">📸</button>
        <button 
          onClick={handleShare}
          className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xs shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
        >
          🚀
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto space-y-6 mb-20 pr-2 pb-4 no-scrollbar">
        {/* Background Watermark */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0 select-none overflow-hidden">
          <div className="transform -rotate-12 text-9xl font-black text-white whitespace-nowrap animate-pulse">
            555+ LOL 555+
          </div>
        </div>

        {/* Marquee */}
        <div className="w-full bg-yellow-900/80 text-yellow-200 text-[10px] font-mono py-1 px-2 rounded overflow-hidden whitespace-nowrap mb-2 border border-yellow-500 border-dashed">
          <div className="animate-marquee inline-block">
             ⚠️ AI PERSONA: 90s COMEDIAN. VOICE: {voiceOptions.find(v => v.id === state.selectedVoice)?.name}. SFX: {sfxOptions.find(s => s.id === state.soundMode)?.name}.
          </div>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col relative z-10 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] relative group ${
                msg.role === 'user' 
                  ? 'bg-kuba-yellow text-black rounded-tr-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] font-bold' 
                  : `bg-white text-black rounded-tl-none border-4 border-black shadow-[6px_6px_0px_0px_#000] ${getRotation(msg.id)}`
              }`}
            >
              {msg.role === 'model' && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center text-xl animate-bounce shadow-lg z-20 border-2 border-white cursor-help">
                   {getChaosBadge(msg.id)}
                </div>
              )}

              {/* Attachment Display */}
              {msg.attachment && msg.attachment.type === 'image' && (
                <img src={msg.attachment.url} alt="Uploaded" className="w-full rounded-lg mb-2 border-2 border-black" />
              )}
              {msg.attachment && msg.attachment.type === 'audio' && (
                <div className="text-xs mb-1 italic">🎤 Audio Clip Sent</div>
              )}

              <p className={`leading-relaxed whitespace-pre-wrap ${msg.role === 'model' ? 'font-mono font-bold text-base italic' : ''}`}>
                {msg.text}
              </p>
              
              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-300">
                  <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">🔎 I FOUND THIS ON THE NET:</p>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-gray-100 text-blue-600 px-2 py-1 rounded-full border border-gray-300 hover:bg-blue-50 truncate max-w-full"
                      >
                        {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title} 🔗
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-2">
                {msg.role === 'model' && (
                  <button 
                    onClick={() => {
                        playTextToSpeech(msg.text);
                        playSoundEffect(state.soundMode);
                    }}
                    className={`opacity-60 hover:opacity-100 active:scale-90 transition-all text-lg ${isSpeaking ? 'animate-pulse text-red-500' : ''}`}
                    title="Replay Audio"
                  >
                    🔊
                  </button>
                )}
                <span className="text-[10px] opacity-40 font-mono font-bold tracking-widest uppercase ml-auto">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
            
            {msg.role === 'model' && (
              <div className="flex gap-2 mt-2 ml-2 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => handleFeedback(msg.id, 'up')} className={`p-1 rounded-full border border-black bg-gray-200 ${msg.feedback === 'up' ? 'bg-green-400' : ''}`}>👍</button>
                <button onClick={() => handleFeedback(msg.id, 'down')} className={`p-1 rounded-full border border-black bg-gray-200 ${msg.feedback === 'down' ? 'bg-red-400' : ''}`}>👎</button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start relative z-10 pl-2">
             <div className="bg-white text-black p-4 rounded-2xl rounded-tl-none text-xs font-mono font-black animate-wiggle shadow-[6px_6px_0px_0px_#000] border-4 border-black rotate-1">
               {isRecording ? "👂 LISTENING..." : "✍️ COMPOSING A SICK RHYME..."}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-20">
        <div className="flex gap-2">
          {state.dailyQuota > 0 ? (
            <>
              {/* Image Upload Input */}
              <input 
                 type="file" 
                 accept="image/*" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleImageSelect}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-full rounded-xl bg-gray-800 text-white border-4 border-gray-700 flex items-center justify-center active:scale-95 text-xl"
                title="Send Image"
              >
                🖼️
              </button>

              {/* Mic Button - Toggle Record Audio Message */}
              <button
                onClick={toggleRecording}
                className={`w-14 h-full rounded-xl font-black text-2xl border-4 border-gray-700 flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-600 text-white animate-pulse border-red-800 scale-105 shadow-[0_0_15px_red]' 
                    : 'bg-gray-900 text-white active:scale-95'
                }`}
                title="Hold for Voice Message"
              >
                {isRecording ? '⏹' : '🎙️'}
              </button>

              <div className="flex-grow relative">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isRecording ? "Recording Audio..." : isDictating ? "Listening for text..." : "Type or click mic..."}
                  disabled={isLoading || isRecording || isDictating}
                  className={`w-full h-full bg-black/90 text-white border-4 border-gray-700 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-kuba-yellow focus:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all font-bold text-sm ${isDictating ? 'border-green-500 text-green-300' : ''}`}
                />
                
                {/* Voice Dictation (Text) Button inside Input */}
                <button
                  onClick={handleDictation}
                  disabled={isLoading || isRecording}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-700 transition-colors ${isDictating ? 'text-green-400 animate-pulse' : 'text-gray-400'}`}
                  title="Voice Typing (Dictation)"
                >
                  {isDictating ? '🛑' : '🎤'}
                </button>
              </div>

              <button 
                onClick={() => handleSendMessage()}
                disabled={isLoading || isRecording}
                className="px-5 rounded-xl font-black transition-all text-xl border-4 bg-kuba-yellow text-black border-black shadow-[4px_4px_0px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-y-1"
              >
                ➤
              </button>
            </>
          ) : (
            <button 
              onClick={handleWatchAd}
              className="w-full bg-green-600 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 transition-all uppercase animate-pulse border-4 border-green-800 flex items-center justify-center gap-2"
            >
              🚀 CLICK TO SUPPORT (GET +3)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
