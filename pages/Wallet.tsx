
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { CONTRACT_ADDRESS, KUBA_LOGO_URL, ADGEM_APP_ID } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Wallet: React.FC = () => {
  const { state } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [animClass, setAnimClass] = useState('animate-float');
  const [mascotUrl, setMascotUrl] = useState(KUBA_LOGO_URL);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const animations = ['animate-float', 'animate-wiggle', 'animate-bounce-slow', 'animate-tilt', 'animate-spin-reverse'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    setAnimClass(randomAnim);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = () => {
    alert("Withdrawal System Coming Soon! \nKeep accumulating KUBA.");
  };

  const handleOfferwall = () => {
    if (!ADGEM_APP_ID || ADGEM_APP_ID === "YOUR_ADGEM_APP_ID") {
        // Fallback for demo if ID not set
        alert("Please set ADGEM_APP_ID in constants.ts first.");
        return;
    }

    const userId = state.telegramUserId || 12345; // Fallback for testing
    // AdGem Offerwall Link
    // Ensure all required parameters are present
    const offerwallUrl = `https://api.adgem.com/v1/wall?appid=${ADGEM_APP_ID}&playerid=${userId}`;

    if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(offerwallUrl, { try_instant_view: false });
    } else {
        window.open(offerwallUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGenerateMascot = () => {
    setIsGenerating(true);
    const randomSeed = Math.random().toString(36).substring(7);
    const newUrl = `https://robohash.org/${randomSeed}.png?set=set2&size=200x200`;
    
    const img = new Image();
    img.src = newUrl;
    img.onload = () => {
      setMascotUrl(newUrl);
      setIsGenerating(false);
    };
    img.onerror = () => {
      setIsGenerating(false);
      alert("Failed to generate mascot.");
    };
  };

  const openChart = () => {
    const chartUrl = 'https://geckoterminal.com';
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(chartUrl, { try_instant_view: false });
    } else {
      window.open(chartUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const data = [
    { name: 'Your KUBA', value: state.balance > 0 ? state.balance : 1 },
    { name: 'Locked', value: 5000 },
    { name: 'Pool', value: 2000 },
  ];
  
  const COLORS = ['#FFD700', '#333333', '#666666'];

  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in pb-10">
      
      <div className="w-full flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
        <div className="w-10 h-10 bg-kuba-yellow rounded-full flex items-center justify-center font-bold text-black">
          {state.telegramUsername ? state.telegramUsername.charAt(0).toUpperCase() : 'G'}
        </div>
        <div className="flex-col overflow-hidden">
          <h3 className="text-sm font-bold text-white truncate">
            {state.telegramUsername || 'Guest User'}
          </h3>
          <p className="text-xs text-gray-500">ID: {state.telegramUserId || 'Local-Dev'}</p>
        </div>
        <div className="ml-auto bg-green-900 text-green-300 text-[10px] px-2 py-1 rounded-full">
          SYNCED
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pt-2 relative">
         <div className="relative">
            <img 
              src={mascotUrl} 
              alt="KUBA Mascot" 
              className={`w-24 h-24 rounded-full border-4 border-kuba-yellow mb-2 shadow-lg bg-gray-800 ${isGenerating ? 'animate-spin opacity-50' : animClass}`}
            />
            <button 
                onClick={handleGenerateMascot}
                disabled={isGenerating}
                className="absolute bottom-2 right-0 bg-gray-900 text-white p-2 rounded-full border border-gray-600 shadow-md active:scale-90 transition-transform hover:bg-gray-800 z-10"
            >
                🎨
            </button>
         </div>
        <h2 className="text-xl font-bold tracking-widest uppercase">My Stash</h2>
      </div>

      <div className="w-full bg-gradient-to-br from-gray-800 to-black border border-gray-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-9xl font-black">K</span>
        </div>
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Balance</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-kuba-yellow">{state.balance.toLocaleString()}</span>
          <span className="text-xl font-bold text-white">KUBA</span>
        </div>
      </div>

      {/* AdGem Button */}
      <button 
        onClick={handleOfferwall}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.5)] active:scale-95 transition-all uppercase flex items-center justify-center gap-2 border-2 border-purple-400 animate-pulse"
      >
        <span>🎁</span> Earn KUBA Coins (Offerwall)
      </button>

      <div className="w-full grid grid-cols-2 gap-3">
         <button 
           className="bg-gray-700 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed border border-gray-600 flex flex-col items-center justify-center"
           onClick={handleWithdraw}
         >
           <span className="text-xs">WITHDRAW</span>
           <span className="text-[10px] opacity-75">(Coming Soon)</span>
         </button>
         <button 
           className="bg-kuba-yellow text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors flex flex-col items-center justify-center shadow-lg"
           onClick={openChart}
         >
           <span className="text-xs">VIEW CHART</span>
         </button>
      </div>

      <div className="w-full h-48 bg-gray-900 rounded-xl p-4 border border-gray-800">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full space-y-2">
        <label className="text-xs text-gray-500 font-bold uppercase ml-1">Contract Address</label>
        <div 
          onClick={handleCopy}
          className="bg-gray-800 border border-dashed border-gray-600 rounded-xl p-4 cursor-pointer hover:bg-gray-700"
        >
          <p className="font-mono text-xs text-gray-300 break-all text-center">
            {CONTRACT_ADDRESS}
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-kuba-yellow font-bold text-sm">
              {copied ? "COPIED! ✅" : "CLICK TO COPY 📋"}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Wallet;
