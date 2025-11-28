import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KUBA_LOGO_URL, AD_URL } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleEarnClick = () => {
    // Direct link as requested for "Ad Revenue" button
    window.open(AD_URL, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-8 animate-fade-in py-8">
      
      {/* Hero Section */}
      <div className="relative group cursor-pointer" onClick={() => navigate('/chat')}>
        <div className="absolute -inset-1 bg-gradient-to-r from-kuba-yellow to-orange-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <img 
          src={KUBA_LOGO_URL} 
          alt="KUBA Logo" 
          className="relative w-48 h-48 rounded-full border-4 border-kuba-black shadow-2xl transform transition hover:scale-105"
        />
        <div className="absolute bottom-0 right-0 bg-white text-black text-xs font-bold px-2 py-1 rounded-full border border-black transform rotate-12">
          TROLL MODE
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-kuba-yellow uppercase italic tracking-widest">
          KUBA COIN
        </h2>
        <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
          The only coin that trolls you back. Earn rewards while getting roasted.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-4 pt-4">
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