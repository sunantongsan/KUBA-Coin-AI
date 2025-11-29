
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateLocalResponse } from '../services/localAi';
import { ChatMessage } from '../types';
import { AD_URL, INTERACTION_REWARD } from '../constants';

const Chat: React.FC = () => {
  const { state, decrementQuota, addQuota, incrementBalance } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (state.dailyQuota <= 0) {
      alert("Quota exceeded! Watch an ad to troll more.");
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
      // Use Local AI Service with enhanced detection
      const responseText = await generateLocalResponse(userMsg.text, state.language);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Reward logic
      incrementBalance(INTERACTION_REWARD);
      
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchAd = () => {
    const confirmed = window.confirm("Watch a short ad to get +2 chats?");
    if (confirmed) {
      // Use Telegram Native Link Opener for better integration
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(AD_URL, { try_instant_view: false });
      } else {
        window.open(AD_URL, '_blank', 'noopener,noreferrer');
      }

      // Simulate verification/time passing for reward
      setTimeout(() => {
        addQuota();
        alert("Thanks for watching! +2 Quota added.");
      }, 3000); 
    }
  };

  const handleShare = () => {
    // 1. Construct Share URL
    const appUrl = "https://t.me/KubaCoinBot/app"; // Replace with your actual bot username if you have one
    const shareText = "This AI is roasting me! Come get trolled and earn KUBA coins. 🤣🚀";
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;

    // 2. Open Telegram Share
    // Try to use WebApp API first, fallback to window.open
    if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else {
        window.open(telegramShareUrl, '_blank');
    }

    // 3. Reward Logic (Instant reward for clicking share)
    incrementBalance(100);
    // Optional: Add visual feedback
    alert("Shared! +100 KUBA added to your wallet.");
  };

  const handleCopyChat = () => {
    const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'KUBA'}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(chatText).then(() => {
        alert("Chat copied to clipboard! Go roast your friends.");
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setMessages(prevMessages => {
      // 1. Find the AI message being rated
      const targetIndex = prevMessages.findIndex(m => m.id === msgId);
      if (targetIndex === -1) return prevMessages;

      const targetMsg = prevMessages[targetIndex];

      // 2. Find the associated user prompt (look backwards from this message)
      let associatedPrompt = "Unknown context";
      for (let i = targetIndex - 1; i >= 0; i--) {
        if (prevMessages[i].role === 'user') {
          associatedPrompt = prevMessages[i].text;
          break;
        }
      }

      // 3. Create the robust log entry
      const logEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        timestamp: new Date().toISOString(),
        userId: state.telegramUserId,
        language: state.language,
        data: {
          prompt: associatedPrompt,
          response: targetMsg.text,
          feedback: type
        }
      };
      
      // 4. Save to localStorage
      try {
        const STORAGE_KEY = 'kuba_ai_training_data';
        const existingLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updatedLogs = [...existingLogs, logEntry];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
        console.log("Training data saved:", logEntry);
      } catch (e) {
        console.error("Failed to save feedback log", e);
      }

      // 5. Update UI state
      return prevMessages.map(msg =>
        msg.id === msgId ? { ...msg, feedback: type } : msg
      );
    });
  };

  // Helper to determine chaotic style features based on ID
  const getChaosBadge = (id: string) => {
    const badges = ['🤡', '🤖', '💩', '🔥', '🤪', '💀', '👽', '👻'];
    const index = parseInt(id.slice(-3)) % badges.length;
    return badges[index];
  };

  const getRotation = (id: string) => {
    const rot = parseInt(id.slice(-2)) % 2 === 0 ? 'rotate-1' : '-rotate-1';
    return rot;
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Bar: Quota & Share */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 flex-grow flex justify-between items-center text-sm shadow-inner border border-gray-700">
          <span className="text-gray-400 font-mono">QUOTA: <span className="text-kuba-yellow font-bold text-lg">{state.dailyQuota}</span>/5</span>
          {state.dailyQuota === 0 && (
            <button 
              onClick={handleWatchAd}
              className="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse hover:bg-green-500"
            >
              +2 (AD)
            </button>
          )}
        </div>
        
        {/* Copy Chat Button */}
        <button
            onClick={handleCopyChat}
            className="bg-gray-700 text-gray-300 p-2 rounded-lg text-xs font-bold border border-gray-600 hover:bg-gray-600 active:scale-95"
            title="Copy Chat"
        >
            📋
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xs shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center leading-none"
        >
          <span>🚀</span>
          <span>SHARE</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto space-y-6 mb-20 pr-2 pb-4 no-scrollbar">
        {/* Decorative Background Text */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0 select-none overflow-hidden">
          <div className="transform -rotate-12 text-9xl font-black text-white whitespace-nowrap animate-pulse">
            555+ LOL 555+
          </div>
        </div>

        {/* Marquee Warning */}
        <div className="w-full bg-yellow-900/80 text-yellow-200 text-[10px] font-mono py-1 px-2 rounded overflow-hidden whitespace-nowrap mb-2 border border-yellow-500 border-dashed">
          <div className="animate-marquee inline-block">
            ⚠️ WARNING: This AI is emotionally unstable. Do not take advice. KUBA to the moon! 🚀 &nbsp;&nbsp;&nbsp;&nbsp; ⚠️ WARNING: This AI is emotionally unstable. Do not take advice. KUBA to the moon! 🚀
          </div>
        </div>

        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 italic relative z-10 animate-bounce">
            "Ask me anything. I dare you." <br/> - KUBA AI 🤡
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col relative z-10 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] relative group ${
                msg.role === 'user' 
                  ? 'bg-kuba-yellow text-black rounded-tr-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] font-bold' 
                  : `bg-white text-black rounded-tl-none border-4 border-black shadow-[6px_6px_0px_0px_#000] ${getRotation(msg.id)}`
              }`}
            >
              {/* Chaos Badge for AI */}
              {msg.role === 'model' && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-full flex items-center justify-center text-xl animate-bounce shadow-lg z-20 border-2 border-white cursor-help" title="Chaos Mode">
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
            
            {/* Feedback Buttons for AI messages */}
            {msg.role === 'model' && (
              <div className="flex gap-2 mt-2 ml-2 transform -rotate-1 relative z-0 opacity-50 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleFeedback(msg.id, 'up')}
                  className={`p-1 rounded-full border-2 border-black bg-gray-200 transition-all active:scale-90 hover:bg-green-200 ${msg.feedback === 'up' ? 'bg-green-400 border-green-700' : ''}`}
                  disabled={!!msg.feedback}
                >
                  👍
                </button>
                <button 
                  onClick={() => handleFeedback(msg.id, 'down')}
                  className={`p-1 rounded-full border-2 border-black bg-gray-200 transition-all active:scale-90 hover:bg-red-200 ${msg.feedback === 'down' ? 'bg-red-400 border-red-700' : ''}`}
                  disabled={!!msg.feedback}
                >
                  👎
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start relative z-10 pl-2">
             <div className="bg-white text-black p-4 rounded-2xl rounded-tl-none text-xs font-mono font-black animate-wiggle shadow-[6px_6px_0px_0px_#000] border-4 border-black rotate-1">
               🤔 GENERATING NONSENSE...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-20">
        <div className="flex gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={state.dailyQuota > 0 ? "Type something..." : "Out of quota!"}
            disabled={state.dailyQuota <= 0 || isLoading}
            className="flex-grow bg-black/90 text-white border-4 border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-kuba-yellow focus:shadow-[0_0_15px_rgba(255,215,0,0.5)] placeholder-gray-500 transition-all font-bold"
          />
          <button 
            onClick={handleSendMessage}
            disabled={state.dailyQuota <= 0 || isLoading}
            className={`px-5 rounded-xl font-black transition-all text-xl border-4 ${
              state.dailyQuota > 0 && !isLoading
              ? 'bg-kuba-yellow text-black border-black shadow-[4px_4px_0px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-y-1'
              : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
            }`}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
