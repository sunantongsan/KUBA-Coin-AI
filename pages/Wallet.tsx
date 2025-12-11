import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { CONTRACT_ADDRESS, KUBA_LOGO_URL, ADGEM_APP_ID, REFERRAL_REWARD, TELEGRAM_BOT_USERNAME } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

const Wallet: React.FC = () => {
  const { state, lockTokens } = useAppContext();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [copied, setCopied] = useState(false);
  const [animClass, setAnimClass] = useState('animate-float');
  const [mascotUrl, setMascotUrl] = useState(KUBA_LOGO_URL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

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

  // --- GAS FEE & CLAIM LOGIC ---
  const handleClaimAndLock = async () => {
    if (!wallet) {
      alert("Please connect your TON wallet first!");
      return;
    }

    if (state.balance < 1000) {
      alert("You need at least 1,000 KUBA to claim.");
      return;
    }

    setIsClaiming(true);

    try {
        // 1. Construct Transaction (User Pays Gas)
        // We ask the user to send a small amount (e.g. 0.05 TON) to verify wallet and pay gas.
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
            messages: [
                {
                    address: CONTRACT_ADDRESS, // The contract/wallet that will hold/distribute tokens
                    amount: "50000000", // 0.05 TON (in nanotons) for Gas + Processing Fee
                    payload: "", // Optional: specific payload
                }
            ]
        };

        // 2. Request User Signature
        // This opens the wallet app. The user MUST approve and pay the gas fee here.
        await tonConnectUI.sendTransaction(transaction);

        // 3. On Success (If no error thrown)
        // Lock tokens for 30 days in the Database (Simulating On-Chain Vesting)
        lockTokens(state.balance, 30);
        
        alert("✅ CLAIM SUCCESSFUL!\n\nYour tokens have been moved to Vesting Storage.\nThey are now LOCKED for 30 Days to prevent dumping.");

    } catch (e) {
        console.error("Transaction Failed", e);
        // User rejected or transaction failed
        alert("❌ Claim Cancelled.\nYou must confirm the transaction to pay the Gas Fee.");
    } finally {
        setIsClaiming(false);
    }
  };

  const handleOfferwall = () => {
    if (!ADGEM_APP_ID || (ADGEM_APP_ID as string) === "YOUR_ADGEM_APP_ID") {
        alert("System Configuration Error: App ID missing.");
        return;
    }
    const userId = state.telegramUserId || 12345;
    const offerwallUrl = `https://api.adgem.com/v1/wall?appid=${ADGEM_APP_ID}&playerid=${userId}`;
    if (window.Telegram?.WebApp?.openLink && window.Telegram.WebApp.isVersionAtLeast('6.4')) {
        window.Telegram.WebApp.openLink(offerwallUrl, { try_instant_view: false });
    } else {
        window.open(offerwallUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleGenerateMascot = () => {
    setIsGenerating(true);
    const randomSeed = Math.random().toString(36).substring(7);
    const newUrl = `https://api.dicebear.com/9.x/micah/png?seed=${randomSeed}&backgroundColor=ffd700&radius=50`;
    const img = new Image();
    img.src = newUrl;
    img.onload = () => { setMascotUrl(newUrl); setIsGenerating(false); };
    img.onerror = () => { setIsGenerating(false); alert("Failed to generate mascot."); };
  };

  const copyRefLink = () => {
     const myId = state.telegramUserId || 'guest';
     const url = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=ref_${myId}`;
     navigator.clipboard.writeText(url);
     alert("Invite Link Copied!");
  };

  const data = [
    { name: 'Available', value: state.balance > 0 ? state.balance : 0.01 },
    { name: 'Locked', value: state.lockedBalance > 0 ? state.lockedBalance : 0.01 },
  ];
  const COLORS = ['#FFD700', '#FF0000', '#333333'];

  // Format Date
  const unlockDateStr = state.unlockDate ? new Date(state.unlockDate).toLocaleDateString() : 'N/A';

  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in pb-20">
      
      {/* Wallet Header */}
      <div className="w-full flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-kuba-yellow rounded-full overflow-hidden border border-white">
                <img src={mascotUrl} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{state.telegramUsername || 'Guest'}</span>
                <span className="text-[9px] text-gray-500">Connected to TON</span>
            </div>
        </div>
        {/* TON CONNECT BUTTON */}
        <div className="transform scale-75 origin-right">
            <TonConnectButton />
        </div>
      </div>

      {/* BALANCE CARDS */}
      <div className="w-full grid grid-cols-2 gap-3">
          {/* Main Balance */}
          <div className="bg-gradient-to-br from-gray-800 to-black border border-gray-700 rounded-2xl p-4 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl font-black">K</div>
             <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Unclaimed</h3>
             <div className="flex flex-col">
                <span className="text-2xl font-black text-kuba-yellow truncate">{state.balance.toLocaleString()}</span>
                <span className="text-[10px] text-white">KUBA</span>
             </div>
          </div>

          {/* Locked Balance */}
          <div className="bg-gradient-to-br from-red-900/50 to-black border border-red-900 rounded-2xl p-4 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl font-black">🔒</div>
             <h3 className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1">Vesting Locked</h3>
             <div className="flex flex-col">
                <span className="text-2xl font-black text-white truncate">{state.lockedBalance.toLocaleString()}</span>
                <span className="text-[10px] text-red-300">Unlock: {unlockDateStr}</span>
             </div>
          </div>
      </div>

      {/* CLAIM ACTION */}
      <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-kuba-yellow blur-[50px] opacity-10"></div>
          
          <h3 className="text-white font-bold uppercase italic tracking-widest relative z-10">CLAIM TO WALLET</h3>
          
          <div className="text-[10px] text-gray-400 bg-black/40 p-2 rounded-lg border border-gray-800">
             <p className="mb-1">Claiming moves your KUBA to the blockchain.</p>
             <p className="text-kuba-yellow font-bold">⚠️ GAS FEE REQUIRED: ~0.05 TON</p>
             <p className="text-[9px] opacity-70 mt-1">You must confirm the transaction in your wallet to pay gas.</p>
          </div>
          
          {!wallet ? (
              <div className="bg-yellow-900/30 text-yellow-500 text-xs p-2 rounded border border-yellow-700 animate-pulse">
                  Connect Wallet to Claim
              </div>
          ) : (
              <button 
                onClick={handleClaimAndLock}
                disabled={isClaiming || state.balance < 1000}
                className={`w-full font-black py-3 rounded-xl uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isClaiming || state.balance < 1000
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-kuba-yellow text-black hover:bg-yellow-400 active:scale-95'
                }`}
              >
                {isClaiming ? (
                    <>
                        <span className="animate-spin">⌛</span> Processing Tx...
                    </>
                ) : (
                    <>
                        <span>⛏️</span> Pay Gas & Claim
                    </>
                )}
              </button>
          )}
      </div>

      {/* REFERRAL STATS */}
      <div className="w-full bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-2xl p-4 flex justify-between items-center">
         <div>
             <h3 className="text-white font-black text-sm">GANG RECRUITS</h3>
             <p className="text-[10px] text-pink-300">{state.referralCount} members invited</p>
         </div>
         <button onClick={copyRefLink} className="bg-pink-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-pink-500">
             INVITE +
         </button>
      </div>

      {/* AdGem Button */}
      <button 
        onClick={handleOfferwall}
        className="w-full bg-indigo-900/50 text-indigo-200 text-xs font-bold py-3 rounded-xl border border-indigo-700 hover:bg-indigo-900 transition-all flex items-center justify-center gap-2"
      >
        <span>🎁</span> Free Crypto Task Wall
      </button>

      {/* Chart */}
      <div className="w-full h-40 bg-gray-900/50 rounded-xl p-2 border border-gray-800">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: '10px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Contract Address */}
      <div className="w-full space-y-1">
        <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Contract Address</label>
        <div 
          onClick={handleCopy}
          className="bg-black border border-dashed border-gray-800 rounded-lg p-3 cursor-pointer hover:border-gray-500 transition-colors relative group"
        >
          <p className="font-mono text-[10px] text-gray-400 break-all text-center">
            {CONTRACT_ADDRESS}
          </p>
          <div className={`absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg transition-opacity ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <span className="text-kuba-yellow font-bold text-xs">
              {copied ? "COPIED! ✅" : "COPY"}
            </span>
          </div>
        </div>
      </div>

      {/* Avatar Generator */}
      <div className="flex items-center justify-center gap-2">
           <img src={mascotUrl} className={`w-8 h-8 rounded-full border border-gray-600 ${isGenerating ? 'animate-spin' : ''}`} />
           <button onClick={handleGenerateMascot} className="text-[10px] text-gray-500 underline hover:text-white">
               Change My Look
           </button>
      </div>

    </div>
  );
};

export default Wallet;