
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { KUBA_LOGO_URL, AD_URL, TELEGRAM_BOT_USERNAME, WELCOME_BONUS, REFERRAL_REWARD } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, setLanguage } = useAppContext();
  const [animClass, setAnimClass] = useState('animate-float');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const animations = ['animate-float', 'animate-wiggle', 'animate-bounce-slow'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    setAnimClass(randomAnim);
  }, []);

  const handleEarnClick = () => {
    if (window.Telegram?.WebApp?.openLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
      window.Telegram.WebApp.openLink(AD_URL, { try_instant_view: false });
    } else {
      window.open(AD_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const getRefLink = () => {
    const myId = state.telegramUserId || 'guest';
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=ref_${myId}`;
  };

  const getShareText = () => {
    return `🔥 JOIN THE GANG! \n\n🤖 KUBA AI: The Gangster Bot that pays you to get roasted.\n\n💰 GET ${WELCOME_BONUS.toLocaleString()} COINS FREE (Limited Time!)\n\n👇 CLICK HERE OR STAY BROKE:`;
  };

  const handleShare = (platform: 'tg' | 'x' | 'fb' | 'copy') => {
    const url = getRefLink();
    const text = getShareText();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    switch (platform) {
      case 'tg':
        const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        if (window.Telegram?.WebApp?.openTelegramLink) {
           window.Telegram.WebApp.openTelegramLink(tgUrl);
        } else {
           window.open(tgUrl, '_blank');
        }
        break;
      case 'x':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        break;
      case 'fb':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${text}\n${url}`);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
    }
  };

  const languages = [
    { code: 'en-US', label: '🇬🇧 EN' },
    { code: 'th-TH', label: '🇹🇭 TH' },
    { code: 'zh-CN', label: '🇨🇳 CN' },
    { code: 'es-ES', label: '🇪🇸 ES' },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-5 animate-fade-in py-6 relative">
      
      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-gray-800 to-black w-full max-w-sm rounded-2xl border-2 border-kuba-yellow shadow-[0_0_30px_rgba(255,215,0,0.3)] p-5 relative animate-bounce-slow">
            
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black text-center text-white italic tracking-tighter uppercase mb-4">
              📢 RECRUIT THE GANG
            </h3>

            {/* Visual Preview Card */}
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-700 mb-6">
               <div className="flex items-center gap-3 mb-2">
                 <img src={KUBA_LOGO_URL} className="w-10 h-10 rounded-full border border-white" />
                 <div>
                   <p className="text-kuba-yellow font-bold text-xs">KUBA AI</p>
                   <p className="text-gray-400 text-[10px]">@kubaminer_bot</p>
                 </div>
               </div>
               <div className="bg-gray-800 rounded p-2 text-xs text-gray-300 font-mono mb-2">
                 "Stop being poor! Get {WELCOME_BONUS.toLocaleString()} coins FREE. Click link 👇"
               </div>
               <div className="text-blue-400 text-[10px] underline truncate">
                 {getRefLink()}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleShare('tg')} className="bg-[#229ED9] hover:bg-[#1e88bc] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
                <span>✈️</span> Telegram
              </button>
              <button onClick={() => handleShare('x')} className="bg-black border border-gray-600 hover:bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
                <span>✖️</span> Twitter / X
              </button>
              <button onClick={() => handleShare('fb')} className="bg-[#1877F2] hover:bg-[#1565c0] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95">
                <span>📘</span> Facebook
              </button>
              <button onClick={() => handleShare('copy')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border ${copySuccess ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}>
                <span>{copySuccess ? '✅' : '📋'}</span> {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[10px] text-gray-500">
                Reward: You get <span className="text-kuba-yellow">{REFERRAL_REWARD.toLocaleString()}</span> | Friend gets <span className="text-green-400">{WELCOME_BONUS.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative group cursor-pointer" onClick={() => navigate('/chat')}>
        <div className="absolute -inset-1 bg-gradient-to-r from-kuba-yellow to-orange-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <img 
          src={KUBA_LOGO_URL} 
          alt="KUBA Logo" 
          className={`relative w-36 h-36 rounded-full border-4 border-kuba-black shadow-2xl transform transition hover:scale-105 ${animClass}`}
        />
        <div className="absolute bottom-0 right-0 bg-white text-black text-xs font-bold px-2 py-1 rounded-full border border-black transform rotate-12 shadow-lg">
          AI Gangster
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-3xl font-black text-kuba-yellow uppercase italic tracking-widest leading-none">
          KUBA COIN
        </h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">The Rudest AI on Earth</p>
        
        {/* Language Selector */}
        <div className="flex gap-2 justify-center pt-3 pb-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                state.language === lang.code
                  ? 'bg-kuba-yellow text-black border-kuba-yellow transform scale-105 shadow-md'
                  : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRIMARY ACTION ROW: CHAT + INVITE */}
      <div className="w-full grid grid-cols-5 gap-2">
        {/* Chat Button (Larger) */}
        <button 
          onClick={() => navigate('/chat')}
          className="col-span-3 bg-kuba-yellow text-black font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-lg flex flex-col items-center justify-center leading-none border-2 border-black"
        >
          <span>💬 START CHAT</span>
          <span className="text-[10px] font-normal mt-1 opacity-80">Earn 200/msg</span>
        </button>

        {/* Invite Button (Smaller but Prominent) */}
        <button 
          onClick={() => setShowShareModal(true)}
          className="col-span-2 bg-pink-600 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-sm flex flex-col items-center justify-center leading-none border-2 border-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          <span className="relative z-10">👥 INVITE</span>
          <span className="relative z-10 text-[10px] font-normal mt-1 text-yellow-300">+{REFERRAL_REWARD.toLocaleString()}</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="w-full space-y-3">
        {/* Ad Button */}
        <button 
          onClick={handleEarnClick}
          className="w-full bg-gray-800 text-white border-2 border-gray-600 font-bold py-3 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-2">
            <span>📺</span> 
            <span>Support & Refill Quota</span>
          </div>
          <span className="bg-green-600 text-[10px] px-2 py-1 rounded text-white font-bold">FREE</span>
        </button>

        {/* Wallet Button */}
        <button 
          onClick={() => navigate('/wallet')}
          className="w-full bg-kuba-black text-kuba-yellow border-2 border-kuba-yellow font-bold py-3 rounded-xl hover:bg-gray-900 transition-all flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-2">
            <span>💼</span> 
            <span>My Wallet</span>
          </div>
          <span className="text-white font-mono">{state.balance.toLocaleString()} ₭</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="w-full bg-gray-900/50 border border-dashed border-gray-700 rounded-xl p-3 text-center">
         <p className="text-[10px] text-gray-500">
           New User Bonus: <span className="text-green-400 font-bold">{WELCOME_BONUS.toLocaleString()} KUBA</span><br/>
           Referral Reward: <span className="text-kuba-yellow font-bold">{REFERRAL_REWARD.toLocaleString()} KUBA</span>
         </p>
      </div>
    </div>
  );
};

export default Home;
