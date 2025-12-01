
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateLocalResponse, getGreeting } from '../services/localAi';
import { generateTrollResponse } from '../services/geminiService'; // TTS Removed
import { playSoundEffect } from '../services/audioEffects'; 
import { ChatMessage } from '../types';
import { MONETAG_DIRECT_LINK, INTERACTION_REWARD, TELEGRAM_BOT_USERNAME, AD_REWARD_QUOTA, AD_URL } from '../constants';

const DAILY_AD_TARGET = 5;
const DAILY_MISSION_REWARD = 1000;
const AD_WAIT_SECONDS = 20; // Increased to 20s for revenue assurance

const Chat: React.FC = () => {
  const { 
    state, 
    decrementQuota, 
    addQuota, 
    incrementBalance, 
    setSoundMode, 
    incrementAdsWatched, 
    claimDailyReward 
  } = useAppContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const completeAdReward = async () => {
    setAdCountdown(null);
    setIsLoading(true);
    
    // Slight delay for UX
    await new Promise(r => setTimeout(r, 500));

    addQuota();
    incrementAdsWatched(); // Update mission progress
    
    // Save to Server immediately to prevent exploit
    if (state.telegramUserId) {
       try {
         await fetch('/api/user/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: state.telegramUserId,
                balance: state.balance, // Note: Balance update happens in next tick usually, but Quota is key here
                quota: state.dailyQuota + AD_REWARD_QUOTA
            })
         });
       } catch (e) { console.error("Cloud Save Error", e); }
    }

    setIsLoading(false);
    playSoundEffect('game');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: `✅ Awesome! Ad watched. Quota refilled by ${AD_REWARD_QUOTA}!`,
      timestamp: Date.now()
    }]);
  };

  // Countdown Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (adCountdown !== null && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } 
    // We do NOT auto-complete here anymore. We wait for user to click "CLAIM".
    
    return () => clearTimeout(timer);
  }, [adCountdown]);

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

  const getRewardMessage = () => {
    const msgs = [
      "\n\nTake 200 KUBA for your feelings.",
      "\n\nRoasting done... take your 200 KUBA!",
      "\n\nHere is 200 KUBA, now get lost.",
      "\n\n200 KUBA added. Don't spend it all at once."
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const handleWatchAd = (isDailyMission: boolean) => {
    // Open Ad Link
    if (window.Telegram?.WebApp?.openLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
      window.Telegram.WebApp.openLink(AD_URL, { try_instant_view: false });
    } else {
      window.open(AD_URL, '_blank', 'noopener,noreferrer');
    }

    // Start Countdown
    setAdCountdown(AD_WAIT_SECONDS);
  };

  const handleSendMedia = async (file: File) => {
    if (state.dailyQuota <= 0) {
      handleWatchAd(false);
      return;
    }

    const base64Data = await blobToBase64(file);
    const mimeType = file.type;
    const displayUrl = URL.createObjectURL(file);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: "📷 Image Upload",
      timestamp: Date.now(),
      attachment: {
        type: 'image',
        url: displayUrl,
        mimeType: mimeType
      }
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    decrementQuota();

    try {
        const { text: responseText, sources } = await generateTrollResponse({ data: base64Data, mimeType }, state.language);
        const finalText = responseText + getRewardMessage();

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: finalText,
          timestamp: Date.now(),
          sources: sources
        };

        setMessages(prev => [...prev, aiMsg]);
        incrementBalance(INTERACTION_REWARD);

        if (isSoundEnabled) {
          playSoundEffect(state.soundMode);
        }
    } catch (error) {
        console.error("Media processing failed", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "Can't see this image! Net is trash.",
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleSendMedia(file);
    }
  };

  const handleSendMessage = async () => {
    const textToSend = inputText;
    
    if (!textToSend.trim()) return;
    if (state.dailyQuota <= 0) {
      handleWatchAd(false);
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
      const { text: responseText, sources } = await generateTrollResponse(textToSend, state.language);
      
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
         playSoundEffect(state.soundMode);
      }

    } catch (error) {
        console.log("Gemini Error, falling back to local");
        const localText = await generateLocalResponse(textToSend, state.language);
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: localText,
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  // Daily Mission Check
  const isMissionComplete = state.adsWatchedToday >= DAILY_AD_TARGET;
  const canClaimMission = isMissionComplete && !state.dailyRewardClaimed;

  const handleClaimMission = () => {
      if (canClaimMission) {
          claimDailyReward(DAILY_MISSION_REWARD);
          playSoundEffect('game');
          alert(`MISSION COMPLETE! \nReceived ${DAILY_MISSION_REWARD} KUBA`);
      }
  };

  return (
    <div className="flex flex-col h-full relative">
       {/* Settings Modal (Reused from Voice Modal variable name) */}
       {showVoiceModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold uppercase tracking-wider">Sound FX Mode</h3>
                  <button onClick={() => setShowVoiceModal(false)} className="text-gray-400 text-xl">✕</button>
               </div>
               <div className="space-y-2">
                 {sfxOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSoundMode(opt.id as any);
                        playSoundEffect(opt.id);
                      }}
                      className={`w-full flex items-center p-3 rounded-xl border transition-all ${
                         state.soundMode === opt.id 
                         ? 'bg-kuba-yellow text-black border-kuba-yellow' 
                         : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                      }`}
                    >
                       <span className="text-2xl mr-3">{opt.icon}</span>
                       <div className="text-left">
                          <div className="font-bold text-sm">{opt.name}</div>
                          <div className="text-[10px] opacity-70">{opt.desc}</div>
                       </div>
                    </button>
                 ))}
               </div>
            </div>
         </div>
       )}

       {/* Daily Mission Bar */}
       <div className="bg-gray-900 border-b border-gray-800 p-2 flex items-center justify-between text-xs px-4 shadow-md z-10">
          <div className="flex items-center gap-2">
             <span className="text-gray-400">Daily Mission:</span>
             <div className="flex items-center gap-1">
                {[...Array(DAILY_AD_TARGET)].map((_, i) => (
                   <div key={i} className={`w-3 h-3 rounded-full ${i < state.adsWatchedToday ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                ))}
             </div>
          </div>
          {canClaimMission ? (
             <button onClick={handleClaimMission} className="bg-yellow-500 text-black font-bold px-2 py-1 rounded animate-pulse">
                CLAIM {DAILY_MISSION_REWARD}
             </button>
          ) : (
             <span className="text-gray-500">{state.adsWatchedToday}/{DAILY_AD_TARGET} Watched</span>
          )}
       </div>

       {/* Chat Area */}
       <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-20 scroll-smooth" ref={chatContainerRef}>
          {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 relative ${
                     msg.role === 'user' 
                     ? 'bg-blue-600 text-white rounded-tr-none' 
                     : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  }`}
                >
                   {/* Attachment */}
                   {msg.attachment && msg.attachment.type === 'image' && (
                      <img src={msg.attachment.url} alt="User Upload" className="rounded-lg mb-2 max-h-48 border border-white/20" />
                   )}
                   
                   {/* Text */}
                   <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                   
                   {/* Sources */}
                   {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-600/50">
                         <p className="text-[10px] text-gray-500 mb-1">Sources:</p>
                         <div className="flex flex-wrap gap-1">
                            {msg.sources.map((s, idx) => (
                               <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-black/30 px-2 py-1 rounded hover:bg-black/50 text-blue-300 truncate max-w-full block">
                                  {s.title}
                               </a>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          ))}
          
          {isLoading && (
             <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl p-3 rounded-tl-none border border-gray-700">
                   <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                </div>
             </div>
          )}
          
          {/* Invisible ref for scrolling */}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="fixed bottom-16 left-0 w-full bg-gray-900 border-t border-gray-800 p-2 z-20">
          {/* Quota Warning / Ad Trigger */}
          {state.dailyQuota <= 0 ? (
             <div className="p-2">
                {adCountdown !== null && adCountdown > 0 ? (
                   <button disabled className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-wait">
                      <span>⏳</span> Checking Ad Status ({adCountdown}s)
                   </button>
                ) : adCountdown === 0 ? (
                   <button onClick={completeAdReward} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 animate-bounce">
                      <span>✅</span> CLAIM QUOTA REWARD
                   </button>
                ) : (
                   <button onClick={() => handleWatchAd(false)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/50">
                      <span>📺</span> WATCH AD TO REFILL QUOTA
                   </button>
                )}
             </div>
          ) : (
             <div className="flex items-center gap-2">
                <button 
                   onClick={() => setShowVoiceModal(true)}
                   className="p-3 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                   🔊
                </button>
                <input 
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handleImageSelect}
                />
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-3 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                   📷
                </button>
                <input 
                   type="text" 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder={`Ask KUBA (${state.dailyQuota} left)...`}
                   className="flex-grow bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kuba-yellow transition-colors placeholder-gray-600"
                />
                <button 
                   onClick={handleSendMessage}
                   disabled={!inputText.trim() || isLoading}
                   className="p-3 rounded-xl bg-kuba-yellow text-black font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                   🚀
                </button>
             </div>
          )}
          <div className="text-center mt-1">
             <span className="text-[10px] text-gray-600">
                Quota: {state.dailyQuota} • Balance: {state.balance.toLocaleString()}
             </span>
          </div>
       </div>
    </div>
  );
};

export default Chat;
