
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Wallet from './pages/Wallet';
import { AppState } from './types';
import { INITIAL_QUOTA, AD_REWARD_QUOTA } from './constants';

// Context Definition
interface AppContextType {
  state: AppState;
  incrementBalance: (amount: number) => void;
  decrementQuota: () => void;
  addQuota: () => void;
  setLanguage: (lang: string) => void;
  setSoundMode: (mode: 'off' | 'comedy' | 'cartoon' | 'game' | 'laughter') => void;
  incrementAdsWatched: () => void;
  claimDailyReward: (amount: number) => void;
  lockTokens: (amount: number, days: number) => void; // New Action
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// Component to handle redirection on startup
const StartupRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/'); }, []);
  return null;
};

const App: React.FC = () => {
  // Initialize State
  const [state, setState] = useState<AppState>(() => {
    const today = new Date().toDateString();
    
    // 1. Get User ID & Language
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = tgUser?.id || null;
    const storageKey = userId ? `kuba_data_v1_${userId}` : 'kuba_data_v1_guest';

    // Normalize Language Detection
    const rawLang = tgUser?.language_code || navigator.language || 'en';
    let detectedLang = 'en-US'; // Default

    const lowerLang = rawLang.toLowerCase();
    if (lowerLang.includes('th')) detectedLang = 'th-TH';
    else if (lowerLang.includes('zh')) detectedLang = 'zh-CN';
    else if (lowerLang.includes('es')) detectedLang = 'es-ES';
    else if (lowerLang.includes('ja')) detectedLang = 'ja-JP';

    console.log(`[App] Detected Language: ${rawLang} -> ${detectedLang}`);

    // 2. Load Local Data
    const saved = localStorage.getItem(storageKey);
    const defaultState: AppState = {
      telegramUserId: userId,
      telegramUsername: tgUser?.username || tgUser?.first_name || 'Guest',
      balance: 0,
      
      // VESTING DEFAULTS
      lockedBalance: 0,
      unlockDate: null,

      dailyQuota: INITIAL_QUOTA,
      lastResetDate: today,
      hasSeenAdToday: false,
      language: detectedLang, 
      soundMode: 'comedy', 
      adsWatchedToday: 0,
      dailyRewardClaimed: false,
      referralCount: 0
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedState = { ...defaultState, ...parsed, telegramUserId: userId, telegramUsername: defaultState.telegramUsername };
        
        // Reset if new day
        if (parsed.lastResetDate !== today) {
          return { 
            ...mergedState, 
            dailyQuota: INITIAL_QUOTA, 
            lastResetDate: today, 
            hasSeenAdToday: false,
            adsWatchedToday: 0,
            dailyRewardClaimed: false
          };
        }
        return mergedState;
      } catch (e) {
        console.error("Failed to parse saved state", e);
        return defaultState;
      }
    }
    return defaultState;
  });

  // Handle Referrals & Sync
  useEffect(() => {
    const initApp = async () => {
      if (!state.telegramUserId) return;

      // 1. Check Referral
      const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (startParam && startParam !== state.telegramUserId.toString()) {
         const referrerId = startParam.replace('ref_', '');
         try {
            const res = await fetch('/api/referral/claim', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ userId: state.telegramUserId, referrerId })
            });
            const data = await res.json();
            if (data.success) {
               alert(`🎉 WELCOME BONUS! \nYou got 2000 KUBA for joining via friend ${referrerId}.`);
               setState(prev => ({ ...prev, balance: prev.balance + data.bonus }));
            }
         } catch (e) {
            console.error("Referral Claim Failed", e);
         }
      }

      // 2. Sync Data
      try {
        const response = await fetch(`/api/user/sync?user_id=${state.telegramUserId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.isBanned) alert("🚫 Account Suspended");

          setState(prev => {
             // Use server balance if it's generally higher (basic sync strategy)
             // or authoritative. Here we trust server.
             const newBalance = data.balance > prev.balance ? data.balance : prev.balance;
             
             return { 
               ...prev, 
               balance: newBalance,
               lockedBalance: data.lockedBalance || prev.lockedBalance,
               unlockDate: data.unlockDate || prev.unlockDate,
               referralCount: data.referralCount || 0
             };
          });
        }
      } catch (e) {
        console.error("Sync failed", e);
      }
    };

    initApp();
  }, [state.telegramUserId]);

  // Persist State
  useEffect(() => {
    const storageKey = state.telegramUserId ? `kuba_data_v1_${state.telegramUserId}` : 'kuba_data_v1_guest';
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  // Actions
  const incrementBalance = (amount: number) => {
    setState(prev => ({ ...prev, balance: prev.balance + amount }));
  };

  const decrementQuota = () => {
    setState(prev => ({ ...prev, dailyQuota: Math.max(0, prev.dailyQuota - 1) }));
  };

  const addQuota = () => {
    setState(prev => ({ ...prev, dailyQuota: prev.dailyQuota + AD_REWARD_QUOTA }));
  };

  const setLanguage = (lang: string) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const setSoundMode = (mode: 'off' | 'comedy' | 'cartoon' | 'game' | 'laughter') => {
    setState(prev => ({ ...prev, soundMode: mode }));
  };

  const incrementAdsWatched = () => {
    setState(prev => ({ ...prev, adsWatchedToday: prev.adsWatchedToday + 1 }));
  };

  const claimDailyReward = (amount: number) => {
    setState(prev => {
      const newState = { 
        ...prev, 
        balance: prev.balance + amount,
        dailyRewardClaimed: true 
      };
      
      if (prev.telegramUserId) {
        fetch('/api/user/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: prev.telegramUserId,
                balance: newState.balance
            })
        }).catch(console.error);
      }
      return newState;
    });
  };

  const lockTokens = (amount: number, days: number) => {
    setState(prev => {
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + days);
        const isoDate = unlockDate.toISOString();
        const newBalance = Math.max(0, prev.balance - amount);
        const newLocked = prev.lockedBalance + amount;

        // Sync to Server
        if (prev.telegramUserId) {
            fetch('/api/user/update', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    userId: prev.telegramUserId,
                    balance: newBalance,
                    lockedBalance: newLocked,
                    unlockDate: isoDate
                })
            }).catch(console.error);
        }

        return {
            ...prev,
            balance: newBalance,
            lockedBalance: newLocked,
            unlockDate: isoDate
        };
    });
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      incrementBalance, 
      decrementQuota, 
      addQuota, 
      setLanguage, 
      setSoundMode,
      incrementAdsWatched,
      claimDailyReward,
      lockTokens
    }}>
      <HashRouter>
        <StartupRedirect />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
