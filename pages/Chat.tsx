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
      // Use Local AI Service instead of Google
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
      window.open(AD_URL, '_blank');
      setTimeout(() => {
        addQuota();
        alert("Thanks for watching! +2 Quota added.");
      }, 3000); 
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Quota Banner */}
      <div className="bg-gray-800 rounded-lg p-2 mb-4 flex justify-between items-center text-sm shadow-inner">
        <span className="text-gray-400">Quota: <span className="text-kuba-yellow font-bold text-lg">{state.dailyQuota}</span>/5</span>
        {state.dailyQuota === 0 && (
          <button 
            onClick={handleWatchAd}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold animate-pulse"
          >
            +2 Chats (Watch Ad)
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto space-y-4 mb-20 pr-2 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10 italic">
            "Ask me anything. I dare you." - KUBA AI
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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