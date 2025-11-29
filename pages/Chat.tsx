
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
      // Use Telegram Native Link Opener
      if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(AD_URL);
      } else {
        window.open(AD_URL, '_blank');
      }

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

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId) {
        // Log to localStorage for "training"
        const logEntry = {
          timestamp: new Date().toISOString(),
          msgId: msg.id,
          response: msg.text,
          feedback: type,
          userId: state.telegramUserId
        };
        
        try {
          const existingLogs = JSON.parse(localStorage.getItem('kuba_ai_feedback_logs') || '[]');
          localStorage.setItem('kuba_ai_feedback_logs', JSON.stringify([...existingLogs, logEntry]));
        } catch (e) {
          console.error("Failed to save feedback log", e);
        }

        return { ...msg, feedback: type };
      }
      return msg;
    }));
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Bar: Quota & Share */}
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 flex-grow flex justify-between items-center text-sm shadow-inner">
          <span className="text-gray-400">Quota: <span className="text-kuba-yellow font-bold text-lg">{state.dailyQuota}</span>/5</span>
          {state.dailyQuota === 0 && (
            <button 
              onClick={handleWatchAd}
              className="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse"
            >
              +2 (Ad)
            </button>
          )}
        </div>
        
        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="bg-blue-500 text-white p-2 rounded-lg font-bold text-xs shadow-md active:scale-95 transition-transform flex flex-col items-center leading-none"
        >
          <span>🚀</span>
          <span>Share +100</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto space-y-4 mb-20 pr-2 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 italic">
            "Ask me anything. I dare you." - KUBA AI
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-kuba-yellow text-black rounded-tr-none shadow-lg' 
                  : 'bg-white text-black rounded-tl-none border-2 border-gray-200 shadow-md'
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-[10px] opacity-50 block text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            
            {/* Feedback Buttons for AI messages */}
            {msg.role === 'model' && (
              <div className="flex gap-2 mt-1 ml-1">
                <button 
                  onClick={() => handleFeedback(msg.id, 'up')}
                  className={`p-1 rounded transition-colors ${msg.feedback === 'up' ? 'text-green-500 bg-gray-800' : 'text-gray-500 hover:text-green-400'}`}
                  disabled={!!msg.feedback}
                >
                  👍
                </button>
                <button 
                  onClick={() => handleFeedback(msg.id, 'down')}
                  className={`p-1 rounded transition-colors ${msg.feedback === 'down' ? 'text-red-500 bg-gray-800' : 'text-gray-500 hover:text-red-400'}`}
                  disabled={!!msg.feedback}
                >
                  👎
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white text-black p-3 rounded-2xl rounded-tl-none text-xs font-bold animate-pulse">
               Processing nonsense...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="flex gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={state.dailyQuota > 0 ? "Type something..." : "Out of quota!"}
            disabled={state.dailyQuota <= 0 || isLoading}
            className="flex-grow bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-kuba-yellow placeholder-gray-500"
          />
          <button 
            onClick={handleSendMessage}
            disabled={state.dailyQuota <= 0 || isLoading}
            className={`px-4 rounded-xl font-bold transition-all ${
              state.dailyQuota > 0 && !isLoading
              ? 'bg-kuba-yellow text-black shadow-[2px_2px_0px_0px_white] active:translate-x-1 active:translate-y-1 active:shadow-none'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
