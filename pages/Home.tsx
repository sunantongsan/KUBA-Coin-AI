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
          ปากแจ๋ว แจกจริง
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-kuba-yellow uppercase italic tracking-widest leading-none">
          อยากรวยก็เข้ามา!<br/>
          <span className="text-white text-sm not-italic font-sans">ไอ้มุษย์หน้าโง่ 🤪</span>
        </h2>
        
        <div className="bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-600 max-w-[280px] mx-auto mt-2">
          <p className="text-gray-300 text-xs font-bold text-center">
             "มาให้ด่าซะดีๆ... แชทปุ๊บ รับเหรียญปั๊บ"<br/>
             <span className="text-kuba-yellow block mt-1">(ด่าเจ็บ จ่ายจริง 200 KUBA/คำ)</span>
          </p>
        </div>
        
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
          💰 หา KUBA ได้ที่ไหน? (อ่านซะ!)
        </h3>
        <ul className="space-y-2 text-xs text-gray-300">
          <li className="flex items-center gap-2">
            <span className="bg-gray-800 p-1 rounded">💬</span> 
            <span>คุยกับข้า (Chat): <b className="text-green-400">รับ 200 KUBA/ข้อความ</b></span>
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-gray-800 p-1 rounded">📺</span> 
            <span>ดูโฆษณา (Ads): <b className="text-green-400">ปลดล็อคโควต้าแชท</b></span>
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-gray-800 p-1 rounded">🎁</span> 
            <span>ทำภารกิจ (Offers): <b className="text-green-400">รับ 5,000+ KUBA</b></span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-3">
        <button 
          onClick={() => navigate('/chat')}
          className="w-full bg-kuba-yellow text-black font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-lg"
        >
          เริ่มแชท (โดนด่าฟรี มีตังค์ให้) 💬
        </button>

        <button 
          onClick={handleEarnClick}
          className="w-full bg-gray-800 text-white border-2 border-gray-600 font-bold py-3 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <span>📺</span> ดูโฆษณา (แก้เซ็ง)
        </button>

        <button 
          onClick={() => navigate('/wallet')}
          className="w-full bg-kuba-black text-kuba-yellow border-2 border-kuba-yellow font-bold py-3 rounded-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
        >
          <span>💼</span> กระเป๋าตังค์ (เช็คยอด)
        </button>
      </div>
    </div>
  );
};

export default Home;