

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateLocalResponse, getGreeting } from '../services/localAi';
import { generateTrollResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage } from '../types';
import { AD_URL, INTERACTION_REWARD, ADSGRAM_BLOCK_ID, TELEGRAM_BOT_USERNAME } from '../constants';

const Chat: React.FC = () => {
  const { state, decrementQuota, addQuota, incrementBalance, setSelectedVoice } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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
    { id: 'Puck', name: 'Nong Joke', desc: 'Energetic & Prankster (High Energy)', icon: '🤪', color: 'bg-yellow-500' },
    { id: 'Fenrir', name: 'Uncle Kom', desc: 'Deep, Raspy & Aggressive (Hard Roast)', icon: '🤬', color: 'bg-red-700' },
    { id: 'Charon', name: 'Boss Thep', desc: 'Serious, Deep & Deadpan', icon: '🕶️', color: 'bg-blue-900' },
    { id: 'Zephyr', name: 'Je Mam', desc: 'Sassy, Fast & High-pitched', icon: '💃', color: 'bg-pink-500' },
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
      alert("Cannot access microphone. Please check permissions.");
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

        if (isSoundEnabled) {
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

      if (isSoundEnabled) {
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
    if (window.Adsgram) {
      try {
        // Fix: Ensure a uniqueId is always present (even for guest/testing) to track revenue
        let uniqueId = state.telegramUserId ? state.telegramUserId.toString() : undefined;
        
        if (!uniqueId) {
           // Create/Get a guest ID for testing on local browser
           uniqueId = localStorage.getItem('adsgram_guest_id') || `guest_${Date.now()}`;
           localStorage.setItem('adsgram_guest_id', uniqueId);
        }
        
        const AdController = window.Adsgram.init({ 
          blockId: ADSGRAM_BLOCK_ID, 
          uniqueId: uniqueId,
          debug: true // ENABLE DEBUGGING to see logs in Console
        });
        const result = await AdController.show();

        if (result.done) {
          addQuota();
          alert("Success! +2 Chats added. 📺✅");
        } else {
          // alert("Ad skipped or failed. No quota added.");
        }
      } catch (error) {
        console.error("Adsgram init error:", error);
        fallbackAd();
      }
    } else {
      fallbackAd();
    }
  };

  const fallbackAd = () => {
    if (window.confirm("Video Ad unavailable. Open partner link instead for +2 chats?")) {
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(AD_URL, { try_instant_view: false });
      } else {
        window.open(AD_URL, '_blank', 'noopener,noreferrer');
      }
      setTimeout(() => {
        addQuota();
        alert("Thanks! +2 Quota added.");
      }, 3000);
    }
  };

  const handleShare = () => {
    const appUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`; 
    const shareText = "This KUBA AI is roasting me in poems! 🤣 Come earn coins.";
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else {
        window.open(telegramShareUrl, '_blank');
    }
    incrementBalance(100);
  };

  const handleSnapshot = async () => {
    if (!chatContainerRef.current || !window.html2canvas) return;
    try {
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
      {/* Voice Selection Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-kuba-yellow rounded-2xl p-6 w-full max-w-sm relative shadow-2xl animate-bounce-slow">
            <button 
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-kuba-yellow uppercase text-center mb-4 tracking-wider">
              🎭 Select Comedian Voice
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {voiceOptions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVoice(v.id);
                    setShowVoiceModal(false);
                    playTextToSpeech("Test 1, 2, 3... Ha ha ha!");
                  }}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all active:scale-95 ${
                    state.selectedVoice === v.id 
                      ? 'border-white bg-kuba-yellow text-black shadow-[0_0_15px_gold]' 
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${v.color} flex items-center justify-center text-2xl mb-2 shadow-inner border border-black/20`}>
                    {v.icon}
                  </div>
                  <span className="font-bold text-sm">{v.name}</span>
                  <span className="text-[10px] text-center opacity-80 leading-tight mt-1">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar with Sound Toggle */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 flex-grow flex justify-between items-center text-sm shadow-inner border border-gray-700">
          <span className="text-gray-400 font-mono">QUOTA: <span className="text-kuba-yellow font-bold text-lg">{state.dailyQuota}</span>/5</span>
        </div>
        
        {/* Voice Toggle */}
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
          {isSoundEnabled && (
             <button 
                onClick={() => setShowVoiceModal(true)}
                className="p-2 rounded-md bg-gray-600 text-white text-xs hover:bg-gray-500 active:scale-90"
                title="Change Voice"
             >
                🎭
             </button>
          )}
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
             ⚠️ AI PERSONA: 90s COMEDIAN POET (ตลกคาเฟ่). VOICE: {voiceOptions.find(v => v.id === state.selectedVoice)?.name || 'Nong Joke'}.
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
                    onClick={() => playTextToSpeech(msg.text)}
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

              {/* Mic Button - Toggle Record */}
              <button
                onClick={toggleRecording}
                className={`w-14 h-full rounded-xl font-black text-2xl border-4 border-gray-700 flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-600 text-white animate-pulse border-red-800 scale-105 shadow-[0_0_15px_red]' 
                    : 'bg-gray-900 text-white active:scale-95'
                }`}
              >
                {isRecording ? '⏹' : '🎙️'}
              </button>

              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isRecording ? "Recording..." : "Type/Img/Mic..."}
                disabled={isLoading || isRecording}
                className="flex-grow bg-black/90 text-white border-4 border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-kuba-yellow focus:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all font-bold text-sm"
              />
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
              📺 WATCH AD (+2 CHATS)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;