
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
    // Generates: https://t.me/kubaminer_bot?start=ref_12345
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=ref_${myId}`;
  };

  // UPDATED: Replaced Bot Name/@Mention with explicit full URL as requested
  const getShareText = () => {
    // We append the referral parameter dynamically in handleShare, 
    // but here we set the base text structure to feature the link prominently.
    const texts = [
      `🔥 KUBA AIRDROP IS LIVE! This AI is TOXIC AF. 🤬\n\nCome help me fight it and steal the coins! 💰\n(Free ${WELCOME_BONUS.toLocaleString()} KUBA for new fighters)\n\n👇 JOIN HERE:\nhttps://t.me/kubaminer_bot`,
      
      `🤖 Man vs Machine: I just got roasted by KUBA AI. 💀\n\nJoin the chaos, beat the bot, and get FREE CRYPTO instantly! 🚀\n\n👇 CLAIM REWARD:\nhttps://t.me/kubaminer_bot`,
      
      `💸 They said "Easy Money", they didn't say the AI would bite. 🐕\n\nCome get your free KUBA coins before I take them all!\nDon't be a chicken. 🐣\n\n👇 ENTER NOW:\nhttps://t.me/kubaminer_bot`,
      
      `⚠️ WARNING: This Bot has NO CHILL.\n\nIt pays you to argue with it. 🤣\nGrab your ${WELCOME_BONUS.toLocaleString()} KUBA Welcome Bonus now!\n\n👇 FIGHT CLUB:\nhttps://t.me/kubaminer_bot`
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  };

  const handleShare = (platform: 'tg' | 'x' | 'fb' | 'copy' | 'story') => {
    const url = getRefLink(); // The actual functioning link with ref code
    const text = getShareText(); // The text with the visible link
    
    // For text-based sharing, we want the visible link in the text to match the functional link
    // So we replace the base URL in the text with the full referral URL for the Copy/X actions
    const textWithRef = text.replace('https://t.me/kubaminer_bot', url);

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(textWithRef);

    switch (platform) {
      case 'tg':
        // Telegram relies on the OG tags of the URL being shared. 
        const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`;
        if (window.Telegram?.WebApp?.openTelegramLink) {
           window.Telegram.WebApp.openTelegramLink(tgUrl);
        } else {
           window.open(tgUrl, '_blank');
        }
        break;
      case 'x':
        // Updated: Removed @KubacoinAirdrop to avoid confusion, kept only hashtags
        const xText = encodeURIComponent(`${textWithRef}\n\n#KUBA #Airdrop #Crypto`);
        // We pass url="" because the link is already in the text body
        window.open(`https://twitter.com/intent/tweet?text=${xText}`, '_blank');
        break;
      case 'fb':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(textWithRef);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
      case 'story':
        // Share to Telegram Story with the Bald Guy Image
        const storyUrl = `https://t.me/share/story?url=${encodedUrl}&text=${encodeURIComponent("FIGHT THE AI. EARN CRYPTO. 🥊")}`;
        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(storyUrl);
        } else {
            window.open(storyUrl, '_blank');
        }
        break;
    }
  };

  const languages = [
    { code: 'en-US', label: '🇬🇧 EN' },
    { code: 'th-TH', label: '🇹🇭 TH' },
    { code: 'zh-CN', label: '🇨🇳 CN' },
    { code: 'es-ES', label: '🇪🇸 ES' },
    { code: 'ja-JP', label: '🇯🇵 JP' }, // Added Japanese
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-5 animate-fade-in py-6 relative">
      
      {/* SHARE MODAL - PREMIUM SOCIAL CARD STYLE (STATIC / NO BOUNCE) */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black w-full max-w-sm rounded-3xl border border-gray-700 shadow-[0_0_50px_rgba(255,215,0,0.2)] p-6 relative overflow-hidden">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-kuba-yellow rounded-full filter blur-[80px] opacity-20"></div>

            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 hover:bg-black rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors z-20"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black text-center text-white italic tracking-tighter uppercase mb-6 relative z-10">
              📢 SPREAD THE CHAOS
            </h3>

            {/* VISUAL PREVIEW CARD */}
            <div className="bg-black rounded-xl border border-gray-700 overflow-hidden mb-6 relative group transform hover:scale-[1.02] transition-transform">
               {/* "Image" Area */}
               <div className="h-40 bg-gray-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 opacity-50"></div>
                  <img src={KUBA_LOGO_URL} className="w-full h-full object-cover opacity-90" />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-kuba-yellow text-[10px] font-bold px-2 py-1 rounded border border-kuba-yellow">
                     AI AIRDROP
                  </div>
               </div>
               
               {/* Text Area */}
               <div className="p-3 bg-gray-900">
                 <h4 className="text-white font-bold text-sm truncate">KUBA: The Gangster AI 🤖</h4>
                 <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                   ⚠️ Warning: Toxic Bot. Get roasted and earn crypto. Join the fight now!
                 </p>
                 <p className="text-blue-400 text-[10px] mt-2 truncate opacity-70">
                   t.me/{TELEGRAM_BOT_USERNAME}
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => handleShare('tg')} className="bg-[#229ED9] hover:bg-[#1e88bc] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-900/20">
                <span>✈️</span> Telegram
              </button>
              <button onClick={() => handleShare('x')} className="bg-black border border-gray-600 hover:bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg">
                <span>✖️</span> Twitter / X
              </button>
              <button onClick={() => handleShare('story')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg col-span-2">
                <span>📸</span> Share to Story
              </button>
              <button onClick={() => handleShare('fb')} className="bg-[#1877F2] hover:bg-[#1565c0] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-800/20">
                <span>📘</span> Facebook
              </button>
              <button onClick={() => handleShare('copy')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border ${copySuccess ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-600 text-gray-300'}`}>
                <span>{copySuccess ? '✅' : '📋'}</span> {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-block bg-gray-800/80 px-4 py-2 rounded-full border border-gray-700">
                <p className="text-[10px] text-gray-400">
                  🎁 Referral Bonus: <span className="text-kuba-yellow font-bold">+{REFERRAL_REWARD.toLocaleString()} KUBA</span>
                </p>
              </div>
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
          className={`relative w-36 h-36 rounded-full border-4 border-kuba-black shadow-2xl transform transition hover:scale-105 bg-kuba-yellow ${animClass}`}
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
          className="col-span-2 bg-pink-600 text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-sm flex flex-col items-center justify-center leading-none border-2 border-white relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 animate-pulse group-hover:bg-white/20 transition-colors"></div>
          <span className="relative z-10 text-2xl mb-1">📢</span>
          <span className="relative z-10 tracking-widest">INVITE</span>
          <span className="relative z-10 text-[9px] font-normal text-yellow-300 bg-black/30 px-2 rounded-full mt-1">
            +{REFERRAL_REWARD.toLocaleString()}
          </span>
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
