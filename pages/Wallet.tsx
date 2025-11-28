import React, { useState } from 'react';
import { useAppContext } from '../App';
import { CONTRACT_ADDRESS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Wallet: React.FC = () => {
  const { state } = useAppContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fake chart data for visual appeal
  const data = [
    { name: 'Your KUBA', value: state.balance > 0 ? state.balance : 100 },
    { name: 'Locked', value: 5000 },
    { name: 'Pool', value: 2000 },
  ];
  
  const COLORS = ['#FFD700', '#333333', '#666666'];

  return (
    <div className="flex flex-col items-center space-y-6 animate-fade-in pb-10">
      
      {/* Balance Card */}
      <div className="w-full bg-gradient-to-br from-gray-800 to-black border border-gray-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-9xl font-black">K</span>
        </div>
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Balance</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-kuba-yellow">{state.balance.toLocaleString()}</span>
          <span className="text-xl font-bold text-white">KUBA</span>
        </div>
        <div className="mt-4 text-xs text-green-400 font-mono">
          ▲ +{state.balance > 0 ? '100%' : '0%'} today (Airdrop)
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="w-full h-48 bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h4 className="text-xs text-gray-500 font-bold uppercase mb-2 text-center">Wallet Allocation</h4>
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
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Contract Address */}
      <div className="w-full space-y-2">
        <label className="text-xs text-gray-500 font-bold uppercase ml-1">Contract Address (TON)</label>
        <div 
          onClick={handleCopy}
          className="bg-gray-800 border border-dashed border-gray-600 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-colors group relative"
        >
          <p className="font-mono text-xs text-gray-300 break-all text-center">
            {CONTRACT_ADDRESS}
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-kuba-yellow font-bold text-sm">
              {copied ? "COPIED! ✅" : "CLICK TO COPY 📋"}
            </span>
          </div>
        </div>
      </div>

      {/* External Chart Link */}
      <button 
        className="w-full bg-white text-black font-bold py-3 rounded-xl shadow-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        onClick={() => window.open('https://geckoterminal.com', '_blank')} 
      >
        <span>📈</span> View Live Chart
      </button>

    </div>
  );
};

export default Wallet;