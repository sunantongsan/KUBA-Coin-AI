
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateLocalResponse, getGreeting } from '../services/localAi';
import { generateTrollResponse } from '../services/geminiService'; // TTS Removed
import { playSoundEffect } from '../services/audioEffects'; 
import { ChatMessage } from '../types';
import { MONETAG_DIRECT_LINK, INTERACTION_REWARD, TELEGRAM_BOT_USERNAME, AD_REWARD_QUOTA } from '../constants';

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

  const completeAdReward = () => {
    setAdCountdown(null);
    setIsLoading(true);
    
    setTimeout(() => {
      addQuota();
      incrementAdsWatched(); // Update mission progress
      setIsLoading(false);
      playSoundEffect('game');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `✅ เยี่ยมมาก! ดูโฆษณาครบตามเวลา รับโควต้าเพิ่ม ${AD_REWARD_QUOTA} ครั้ง!`,
        timestamp: Date.now()
      }]);
    }, 500);
  };

  // Countdown Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (adCountdown !== null && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (adCountdown === 0) {
      // Timer finished - Give Reward
      completeAdReward();
    }
    
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

  // Helper to get a random reward message (No Parentheses)
  const getRewardMessage = () => {
    const msgs = [
      "\n\nเอาไป 200 KUBA ค่าทำขวัญ",
      "\n\nด่าเสร็จก็แจก... รับไป 200 KUBA ไป๊!",
      "\n\nเอา 200 KUBA ไปแดกซะ",
      "\n\nรับไป 200 KUBA... แล้วไสหัวไปนอนได้แล้ว"
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const handleSendMedia = async (file: File) => {
    if (state.dailyQuota <= 0) {
      handleWatchAd(false); // Prompt user
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
        // Send Image to Gemini
        const { text: responseText, sources } = await generateTrollResponse({ data: base64Data, mimeType }, state.language);
        
        // Append reward text
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

        // Play SFX only
        if (isSoundEnabled) {
          playSoundEffect(state.soundMode);
        }
    } catch (error) {
        console.error("Media processing failed", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "กูดูรูปไม่ได้โว้ย เน็ตเน่า!",
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
      handleWatchAd(false); // Prompt user
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
      
      // Append reward text
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

      // Play SFX
      if (isSoundEnabled) {
        playSoundEffect(state.soundMode);
      }
      
    } catch (error) {
      console.warn("Gemini unavailable, falling back to Local AI");
      try {
        const fallbackText = await generateLocalResponse(userMsg.text, state.language);
        
        // Append reward text to fallback as well
        const finalText = fallbackText + "\nAI สมองไหล 🐹" + getRewardMessage();

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: finalText,
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

  const handleWatchAd = async (direct: boolean = true) => {
    // If not direct (triggered by typing), confirm first
    if (!direct) {
      if (!window.confirm("Quota หมดแล้วจ้า! ไปดูโฆษณาแก้เซ็งสักแป๊บมั้ย? (Open Ad Link to get +5 Chats)")) {
        return;
      }
    }
      
    // 1. Reset and Start Visual Countdown IMMEDIATELLY
    setAdCountdown(AD_WAIT_SECONDS);

    // 2. Open Direct Link after small delay to let overlay render
    setTimeout(() => {
      if (window.Telegram?.WebApp?.openLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
        window.Telegram.WebApp.openLink(MONETAG_DIRECT_LINK, { try_instant_view: false });
      } else {
        window.open(MONETAG_DIRECT_LINK, '_blank', 'noopener,noreferrer');
      }
    }, 1500); 
  };

  const handleClaimDaily = () => {
    claimDailyReward(DAILY_MISSION_REWARD);
    playSoundEffect('game');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: `🎉 สุดยอด! ว่างจัดจริงๆ ดูโฆษณาครบ ${DAILY_AD_TARGET} รอบ\nรับไปเลย ${DAILY_MISSION_REWARD} KUBA!`,
      timestamp: Date.now()
    }]);
  };

  const handleShare = () => {
    const appUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`; 
    const shareText = "This KUBA AI is roasting me in poems! 🤣 Come earn coins.";
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;

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
    const badges = ['🤡', '🤪', '💩', '🥁', '👺', '👻'];
    return badges[parseInt(id.slice(-3)) % badges.length];
  };

  const getRotation = (id: string) => parseInt(id.slice(-2)) % 2 === 0 ? 'rotate-1' : '-rotate-1';

  // Progress Bar Calculation
  const progressPercent = Math.min((state.adsWatchedToday / DAILY_AD_TARGET) * 100, 100);
  const isMissionComplete = state.adsWatchedToday >= DAILY_AD_TARGET;

  return (
    <div className="flex flex-col h-full relative" ref={chatContainerRef}>
      
      {/* Full Screen Ad Countdown Overlay - BLOCKING */}
      {adCountdown !== null && adCountdown > 0 && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
            <div className="text-6xl mb-6 animate-spin-reverse">⏳</div>
            <h2 className="text-2xl font-black text-kuba-yellow mb-2 uppercase tracking-widest">
              กำลังยืนยันโฆษณา...
            </h2>
            <div className="text-[120px] font-mono font-black text-white leading-none mb-6">
              {adCountdown}
            </div>
            <p className="text-red-500 font-bold text-sm animate-pulse max-w-xs bg-red-900/20 p-4 rounded-xl border border-red-800">
              ⚠️ ห้ามปิดหน้านี้! <br/>
              กรุณารอให้ครบเวลาเพื่อให้ระบบตรวจสอบความถูกต้อง
            </p>
            <div className="mt-8 w-64 h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600">
               <div 
                 className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                 style={{ width: `${((AD_WAIT_SECONDS - adCountdown) / AD_WAIT_SECONDS) * 100}%` }}
               />
            </div>
        </div>
      )}

      {/* Studio Settings Modal (SFX Only) */}
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
              ⚙️ Studio FX
            </h3>
            <div>
              <h4 className="text-white font-bold mb-2 text-sm uppercase">Sound Effects</h4>
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

      {/* PROMINENT DAILY REWARD CLAIM BUTTON */}
      {isMissionComplete && !state.dailyRewardClaimed && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce cursor-pointer" onClick={handleClaimDaily}>
            <div className="bg-kuba-yellow text-black border-4 border-black px-6 py-2 rounded-full font-black text-lg shadow-[0_0_15px_rgba(255,215,0,0.8)] flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform">
              <span>🎁</span> CLAIM {DAILY_MISSION_REWARD} KUBA!
            </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col gap-2 mb-2">
        
        {/* Row 1: Status & Actions */}
        <div className="flex justify-between items-center gap-2">
          <div className="bg-gray-800 rounded-lg p-2 flex-grow flex justify-between items-center text-sm shadow-inner border border-gray-700">
            <span className="text-gray-400 font-mono text-xs">QUOTA: <span className="text-kuba-yellow font-bold text-base">{state.dailyQuota}</span>/5</span>
          </div>
          
          <div className="flex bg-gray-700 rounded-lg p-1 gap-1">
            <button 
              onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
              className={`p-2 rounded-md text-xs font-bold transition-all ${
                isSoundEnabled ? 'bg-kuba-yellow text-black shadow-sm' : 'text-gray-400'
              }`}
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </button>
             <button 
                onClick={() => setShowVoiceModal(true)}
                className="p-2 rounded-md bg-gray-600 text-white text-xs hover:bg-gray-500 active:scale-90 flex items-center gap-1"
             >
                <span>⚙️</span>
             </button>
          </div>
          <button onClick={handleSnapshot} className="bg-gray-700 text-gray-300 p-2 rounded-lg text-xs">📸</button>
          <button 
            onClick={handleShare}
            className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xs shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            🚀
          </button>
        </div>

        {/* Row 2: Daily Mission Progress */}
        <div className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 flex items-center gap-2">
          <div className="text-[10px] text-gray-400 font-bold w-12 text-center leading-none">
            DAILY<br/>MISSION
          </div>
          <div className="flex-grow flex flex-col justify-center">
            <div className="flex justify-between text-[10px] text-gray-300 mb-1">
               <span>Watch {DAILY_AD_TARGET} Ads</span>
               <span>{state.adsWatchedToday}/{DAILY_AD_TARGET}</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
               <div 
                 className="bg-gradient-to-r from-green-500 to-kuba-yellow h-full transition-all duration-500"
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
          </div>
          
          {isMissionComplete && !state.dailyRewardClaimed ? (
             <button 
               onClick={handleClaimDaily}
               className="bg-kuba-yellow text-black text-[10px] font-black px-2 py-1 rounded animate-bounce border-2 border-black shadow-sm"
             >
               CLAIM
             </button>
          ) : (
             <button 
               onClick={() => handleWatchAd(true)}
               disabled={isMissionComplete}
               className={`text-[10px] font-bold px-2 py-1 rounded border border-gray-600 ${isMissionComplete ? 'bg-gray-700 text-green-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
             >
               {state.dailyRewardClaimed ? 'DONE ✅' : 'GO 📺'}
             </button>
          )}
        </div>

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
             ⚠️ AI PERSONA: THAI KEYBOARD GANGSTER. SFX: {sfxOptions.find(s => s.id === state.soundMode)?.name}.
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
               ✍️ WRITING DISS TRACK...
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

              <div className="flex-grow relative">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={"Type a message..."}
                  disabled={isLoading}
                  className={`w-full h-full bg-black/90 text-white border-4 border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-kuba-yellow focus:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all font-bold text-sm`}
                />
              </div>

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
              onClick={() => handleWatchAd(true)}
              className="w-full bg-green-600 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-y-1 transition-all uppercase animate-pulse border-4 border-green-800 flex items-center justify-center gap-2"
            >
              🚀 CLICK TO SUPPORT (GET +{AD_REWARD_QUOTA})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
