
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

  // Share Logic for Chat
  const getRefLink = () => {
    const myId = state.telegramUserId || 'guest';
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=ref_${myId}`;
  };

  const handleShare = () => {
    const url = getRefLink();
    const text = `FIGHT ME! 🥊\n\nI'm battling the rudest AI on Telegram.\nJoin now & get free crypto: https://t.me/${TELEGRAM_BOT_USERNAME}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(tgUrl);
    } else {
        window.open(tgUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full relative">
       {/* Settings Modal */}
       {showVoiceModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold uppercase tracking-wider">Sound FX Mode</h3>
                  <button onClick={() => setShowVoiceModal(false)} className="text-gray-400 text-xl hover:text-white">✕</button>
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
                         ? 'bg-kuba-yellow text-black border-kuba-yellow transform scale-105' 
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

       {/* AD COUNTDOWN OVERLAY */}
       {adCountdown !== null && adCountdown > 0 && (
         <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <div className="absolute top-0 right-0 w-64 h-64 bg-kuba-yellow rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>
             
             <h2 className="text-4xl font-black text-white italic mb-2 tracking-tighter uppercase animate-bounce-slow">
                WAIT FOR REWARD
             </h2>
             <p className="text-gray-400 text-sm mb-8">Do not close this screen or you lose the reward!</p>
             
             <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-kuba-yellow rounded-full animate-spin border-t-transparent" style={{ animationDuration: '2s' }}></div>
                <span className="text-6xl font-black text-white font-mono">{adCountdown}</span>
             </div>
             
             <div className="bg-gray-900 px-6 py-3 rounded-xl border border-gray-800">
                <p className="text-kuba-yellow font-bold animate-pulse">Verifying Ad View...</p>
             </div>
         </div>
       )}

       {/* Header/Mission Bar */}
       <div className="bg-gray-900 border-b border-gray-800 p-2 flex items-center justify-between text-xs px-4 shadow-md z-10 sticky top-0">
          <div className="flex items-center gap-2">
             <button onClick={handleShare} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-500 transition-colors">
               INVITE +
             </button>
             <div className="flex items-center gap-1">
                {[...Array(DAILY_AD_TARGET)].map((_, i) => (
                   <div key={i} className={`w-2 h-2 rounded-full ${i < state.adsWatchedToday ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                ))}
             </div>
          </div>
          {canClaimMission ? (
             <button onClick={handleClaimMission} className="bg-yellow-500 text-black font-bold px-2 py-1 rounded animate-pulse text-[10px]">
                CLAIM {DAILY_MISSION_REWARD}
             </button>
          ) : (
             <span className="text-gray-500 text-[10px]">{state.adsWatchedToday}/{DAILY_AD_TARGET} Daily Ads</span>
          )}
       </div>

       {/* Chat Area - Adjusted PB for 2-row footer */}
       <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-40 scroll-smooth" ref={chatContainerRef}>
          {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                   <div className="w-8 h-8 rounded-full bg-kuba-yellow border border-black flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1">
                      <span className="text-xs">🤖</span>
                   </div>
                )}
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 relative shadow-sm ${
                     msg.role === 'user' 
                     ? 'bg-blue-600 text-white rounded-tr-none' 
                     : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  }`}
                >
                   {msg.attachment && msg.attachment.type === 'image' && (
                      <img src={msg.attachment.url} alt="User Upload" className="rounded-lg mb-2 max-h-48 border border-white/20 w-full object-cover" />
                   )}
                   
                   <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                   
                   {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-600/50">
                         <div className="flex flex-wrap gap-1">
                            {msg.sources.map((s, idx) => (
                               <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="text-[9px] bg-black/40 px-2 py-1 rounded text-blue-300 truncate max-w-full block hover:underline">
                                  🔗 {s.title}
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
                <div className="w-8 h-8 mr-2"></div>
                <div className="bg-gray-800 rounded-2xl p-3 rounded-tl-none border border-gray-700">
                   <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                   </div>
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area - 2 LAYERS (Rows) */}
       <div className="fixed bottom-16 left-0 w-full bg-gray-900 border-t border-gray-800 px-3 py-2 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          {/* Quota Warning / Ad Trigger */}
          {state.dailyQuota <= 0 ? (
             <div className="p-1">
                {adCountdown === 0 ? (
                   <button onClick={completeAdReward} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 animate-bounce shadow-lg">
                      <span>✅</span> CLAIM REWARD
                   </button>
                ) : (
                   <button onClick={() => handleWatchAd(false)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/30">
                      <span>📺</span> WATCH AD TO CHAT
                   </button>
                )}
             </div>
          ) : (
             <div className="flex flex-col gap-2">
                {/* Layer 1: Input + Send Button */}
                <div className="flex gap-2 w-full">
                    <input 
                       type="text" 
                       value={inputText}
                       onChange={(e) => setInputText(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                       placeholder={`Ask KUBA...`}
                       className="flex-grow bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kuba-yellow transition-colors placeholder-gray-600 text-sm"
                    />
                    <button 
                       onClick={handleSendMessage}
                       disabled={!inputText.trim() || isLoading}
                       className="w-12 h-12 flex-shrink-0 rounded-xl bg-kuba-yellow text-black font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center justify-center"
                    >
                       🚀
                    </button>
                </div>
                
                {/* Layer 2: Action Buttons */}
                <div className="flex justify-between items-center px-1">
                    <div className="flex gap-3">
                        <button 
                           onClick={() => setShowVoiceModal(true)}
                           className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center border border-gray-700"
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
                           className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center border border-gray-700"
                        >
                           📷
                        </button>
                    </div>
                    
                    <span className="text-[10px] text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">
                        Quota: <span className={state.dailyQuota < 3 ? 'text-red-500' : 'text-green-500'}>{state.dailyQuota}</span>
                    </span>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default Chat;
