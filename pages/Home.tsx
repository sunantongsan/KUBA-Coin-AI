import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { KUBA_LOGO_URL, AD_URL } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, setLanguage } = useAppContext();
  const [animClass, setAnimClass] = useState('animate-float');

  useEffect(() => {
    // Randomly select an animation on mount to keep it fresh
    const animations = ['animate-float', 'animate-wiggle', 'animate-bounce-slow'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    setAnimClass(randomAnim);
  }, []);

  const handleEarnClick = () => {
    // Use Telegram Native Link Opener if available (v6.4+), else window.open
    if (window.Telegram?.WebApp?.openLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
      window.Telegram.WebApp.openLink(AD_URL, { try_instant_view: false });
    } else {
      window.open(AD_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const languages = [
    { code: 'en-US', label: '🇬🇧 EN' },
    { code: 'th-TH', label: '🇹🇭 TH' },
    { code: 'zh-CN', label: '🇨🇳 CN' },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-6 animate-fade-in py-6">
      
      {/* Hero Section */}
      <div className="relative group cursor-pointer" onClick={() => navigate('/chat')}>
        <div className="absolute -inset-1 bg-gradient-to-r from-kuba-yellow to-orange-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <img 
          src={KUBA_LOGO_URL} 
          alt="KUBA Logo" 
          className={`relative w-40 h-40 rounded-full border-4 border-kuba-black shadow-2xl transform transition hover:scale-105 ${animClass}`}
        />
        <div className="absolute bottom-0 right-0 bg-white text-black text-xs font-bold px-2 py-1 rounded-full border border-black transform rotate-12">
          SUPER TROLL
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-kuba-yellow uppercase italic tracking-widest">
          KUBA COIN
        </h2>
        <p className="text-gray-400 text-xs max-w-[250px] mx-auto">
          The only coin that trolls you back.
        </p>
        
        {/* Language Selector */}
        <div className="flex gap-2 justify-center pt-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
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

      {/* How to Earn Section */}
      <div className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg">
        <h3 className="text-kuba-yellow text-sm font-black uppercase mb-3 text-center tracking-wider">
          💰 How to Earn KUBA
        </h3>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex items-center gap-2">
            <span className="bg-gray-800 p-1 rounded">💬</span> 
            <span>Chat with AI: <b className="text-green-400">+200 Coins/msg</b></span>
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-gray-800 p-1 rounded">📺</span> 
            <span>Watch Ads: <b className="text-green-400">Unlock Chat Quota</b></span>
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-gray-800 p-1 rounded">🎁</span> 
            <span>Complete Offers: <b className="text-green-400">+5000+ Coins</b></span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3">
        <button 
          onClick={() => navigate('/chat')}
          className="w-full bg-kuba-yellow text-black font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-lg"
        >
          Start Trolling AI 💬
        </button>

        <button 
          onClick={handleEarnClick}
          className="w-full bg-gray-800 text-white border-2 border-gray-600 font-bold py-3 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <span>📺</span> Earn from Ads
        </button>

        <button 
          onClick={() => navigate('/wallet')}
          className="w-full bg-kuba-black text-kuba-yellow border-2 border-kuba-yellow font-bold py-3 rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
        >
          <span>💼</span> My Wallet
        </button>
      </div>
    </div>
  );
};

export default Home;
