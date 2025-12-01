
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { KUBA_LOGO_URL, AD_URL, TELEGRAM_BOT_USERNAME, WELCOME_BONUS, REFERRAL_REWARD } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, setLanguage } = useAppContext();
  const [animClass, setAnimClass] = useState('animate-float');

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

  const handleInvite = () => {
    const myId = state.telegramUserId || 'guest';
    const appUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${myId}`; 
    // Gangster Invite Text
    const shareText = `🔥 YO! Join KUBA AI now.\n\n💰 Get ${WELCOME_BONUS.toLocaleString()} COINS FREE immediately!\n🤖 Roast the bot, get paid.\n\n👇 CLICK HERE OR STAY POOR:`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`;

    if (window.Telegram?.WebApp?.openTelegramLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
        window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    } else {
        window.open(telegramShareUrl, '_blank');
    }
  };

  const languages = [
    { code: 'en-US', label: '🇬🇧 EN' },
    { code: 'th-TH', label: '🇹🇭 TH' },
    { code: 'zh-CN', label: '🇨🇳 CN' },
    { code: 'es-ES', label: '🇪🇸 ES' },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-5 animate-fade-in py-6">
      
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
          onClick={handleInvite}
          className="col-span-2 bg-pink-600 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-sm flex flex-col items-center justify-center leading-none border-2 border-white"
        >
          <span>👥 INVITE</span>
          <span className="text-[10px] font-normal mt-1 text-yellow-300">Get {REFERRAL_REWARD.toLocaleString()}!</span>
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
