import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateLocalResponse, getGreeting } from '../services/localAi';
import { generateTrollResponse, generateSpeech } from '../services/geminiService';
import { ChatMessage } from '../types';
import { AD_URL, INTERACTION_REWARD, ADSGRAM_BLOCK_ID, TELEGRAM_BOT_USERNAME } from '../constants';

// Add Web Speech API types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const Chat: React.FC = () => {
  const { state, decrementQuota, addQuota, incrementBalance } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSpeechInput = () => {
    if (isListening) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Set language based on app state
    recognition.lang = state.language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputText(transcript);
        // Auto send after slight delay to let user see text
        setTimeout(() => handleSendMessage(transcript), 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    
    if (!textToSend.trim()) return;
    if (state.dailyQuota <= 0) {
      handleWatchAd(); // Auto trigger ad offer if user tries to send with no quota
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
      // Try Gemini AI first (Smarter + Internet Access + Poetry)
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

      // Auto-play TTS for the new message
      playTextToSpeech(responseText);
      
    } catch (error) {
      console.warn("Gemini unavailable, falling back to Local AI");
      // Fallback to Local AI if Gemini fails (Network/Key issues)
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
    // Remove emojis for better TTS reading
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    
    await generateSpeech(cleanText);
    
    // Reset speaking state after a rough estimate or immediately since AudioBuffer plays async
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  const handleWatchAd = async () => {
    if (window.Adsgram) {
      try {
        const AdController = window.Adsgram.init({ blockId: ADSGRAM_BLOCK_ID });
        const result = await AdController.show();

        if (result.done) {
          addQuota();
          alert("Success! +2 Chats added. 📺✅");
        } else {
          // User skipped or error
          console.log("Adsgram result:", result);
          alert("Ad skipped or failed. No quota added.");
        }
      } catch (error) {
        console.error("Adsgram Error:", error);
        fallbackAd();
      }
    } else {
      console.warn("Adsgram script not loaded");
      fallbackAd();
    }
  };

  const fallbackAd = () => {
    // Fallback to Link if Video Ad fails
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
    const shareText = "This KUBA AI is roasting me hard! 🤣 Come earn coins and get trolled.";
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
        alert("Snapshot taken! (Feature to share image directly coming soon)");
      });
    } catch (e) {
      console.error("Snapshot failed", e);
    }
  };

  const handleCopyChat = () => {
    const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'KUBA'}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(chatText).then(() => {
        alert("Chat copied! Go roast your friends.");
    }).catch(err => console.error(err));
  };

  const handleFeedback = async (msgId: string, type: 'up' | 'down') => {
    let targetMsg: ChatMessage | undefined;
    let associatedPrompt = "Unknown context";

    setMessages(prev => {
      const targetIndex = prev.findIndex(m => m.id === msgId);
      if (targetIndex === -1) return prev;
      targetMsg = prev[targetIndex];
      for (let i = targetIndex - 1; i >= 0; i--) {
        if (prev[i].role === 'user') {
          associatedPrompt = prev[i].text;
          break;
        }
      }
      return prev.map(msg => msg.id === msgId ? { ...msg, feedback: type } : msg);
    });

    if (!targetMsg) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: state.telegramUserId,
      language: state.language,
      data: { prompt: associatedPrompt, response: targetMsg.text, feedback: type }
    };

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    } catch (e) { /* ignore */ }
  };

  // Chaos Visuals
  const getChaosBadge = (id: string) => {
    const badges = ['🤡', '🤖', '💩', '🔥', '🤪', '💀', '👽', '👻'];
    return badges[parseInt(id.slice(-3)) % badges.length];
  };

  const getRotation = (id: string) => parseInt(id.slice(-2)) % 2 === 0 ? 'rotate-1' : '-rotate-1';

  return (
    <div className="flex flex-col h-full relative" ref={chatContainerRef}>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 flex-grow flex justify-between items-center text-sm shadow-inner border border-gray-700">
          <span className="text-gray-400 font-mono">QUOTA: <span className="text-kuba-yellow font-bold text-lg">{state.dailyQuota}</span>/5</span>
        </div>
        
        <button onClick={handleSnapshot} className="bg-gray-700 text-gray-300 p-2 rounded-lg text-xs" title="Snapshot">📸</button>
        <button onClick={handleCopyChat} className="bg-gray-700 text-gray-300 p-2 rounded-lg text-xs" title="Copy">📋</button>
        
        <button 
          onClick={handleShare}
          className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xs shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
        >
          🚀 SHARE
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
             ⚠️ AI MODE: POETRY TROLL. VOICE ENABLED. DO NOT FEED THE TROLL.
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

              {/* Message Content */}
              <p className={`leading-relaxed whitespace-pre-wrap ${msg.role === 'model' ? 'font-mono font-bold text-base italic' : ''}`}>
                {msg.text}
              </p>
              
              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-300">
                  <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">🔎 I GOOGLED THIS:</p>
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

              {/* Timestamp & Speaker */}
              <div className="flex justify-between items-center mt-2">
                {msg.role === 'model' && (
                  <button 
                    onClick={() => playTextToSpeech(msg.text)}
                    className="opacity-60 hover:opacity-100 active:scale-90 transition-all text-lg"
                    title="Play Audio"
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
               ✍️ WRITING A POEM TO ROAST YOU...
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
              {/* Mic Button */}
              <button
                onClick={handleSpeechInput}
                className={`w-12 h-full rounded-xl font-black text-2xl border-4 border-gray-700 flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-600 text-white animate-pulse border-red-800' 
                    : 'bg-gray-900 text-white active:scale-95'
                }`}
              >
                {isListening ? '⏹️' : '🎙️'}
              </button>

              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? "Listening..." : "Type or Talk..."}
                disabled={isLoading}
                className="flex-grow bg-black/90 text-white border-4 border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-kuba-yellow focus:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all font-bold"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isLoading}
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