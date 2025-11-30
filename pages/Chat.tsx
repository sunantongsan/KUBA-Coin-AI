
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateLocalResponse, getGreeting } from '../services/localAi';
import { ChatMessage } from '../types';
import { AD_URL, INTERACTION_REWARD, ADSGRAM_BLOCK_ID, TELEGRAM_BOT_USERNAME } from '../constants';

const Chat: React.FC = () => {
  const { state, decrementQuota, addQuota, incrementBalance } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (state.dailyQuota <= 0) {
      handleWatchAd(); // Auto trigger ad offer if user tries to send with no quota
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    decrementQuota();

    try {
      const responseText = await generateLocalResponse(userMsg.text, state.language);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      incrementBalance(INTERACTION_REWARD);
      
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsLoading(false);
    }
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
        // In a real Telegram Mini App, we might upload this or just show it.
        // For now, we can try to share it or alert user.
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
    // Optimistic UI Update
    let targetMsg: ChatMessage | undefined;
    let associatedPrompt = "Unknown context";

    setMessages(prev => {
      const targetIndex = prev.findIndex(m => m.id === msgId);
      if (targetIndex === -1) return prev;
      targetMsg = prev[targetIndex];
      // Find prompt
      for (let i = targetIndex - 1; i >= 0; i--) {
        if (prev[i].role === 'user') {
          associatedPrompt = prev[i].text;
          break;
        }
      }
      return prev.map(msg => msg.id === msgId ? { ...msg, feedback: type } : msg);
    });

    if (!targetMsg) return;

    // Send to Server
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
             ⚠️ AI INTELLIGENCE: CONNECTED TO WIKIPEDIA & BINANCE. TROLL LEVEL: MAXIMUM. &nbsp;&nbsp;&nbsp;&nbsp; ⚠️ WARNING: DO NOT FEED THE TROLL.
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

              <p className={`leading-relaxed whitespace-pre-wrap ${msg.role === 'model' ? 'font-mono font-bold text-base' : ''}`}>
                {msg.text}
              </p>
              
              <span className="text-[10px] opacity-40 block text-right mt-2 font-mono font-bold tracking-widest uppercase">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
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
               🤔 CALCULATING ROAST...
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
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-grow bg-black/90 text-white border-4 border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-kuba-yellow focus:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all font-bold"
              />
              <button 
                onClick={handleSendMessage}
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
