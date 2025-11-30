
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
    
    // 1. Get User ID
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = tgUser?.id || null;
    const storageKey = userId ? `kuba_data_v1_${userId}` : 'kuba_data_v1_guest';

    // 2. Load Local Data
    const saved = localStorage.getItem(storageKey);
    const defaultState: AppState = {
      telegramUserId: userId,
      telegramUsername: tgUser?.username || tgUser?.first_name || 'Guest',
      balance: 0,
      dailyQuota: INITIAL_QUOTA,
      lastResetDate: today,
      hasSeenAdToday: false,
      language: tgUser?.language_code || navigator.language || 'en-US'
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      const mergedState = { ...parsed, telegramUserId: userId, telegramUsername: defaultState.telegramUsername };
      if (parsed.lastResetDate !== today) {
        return { ...mergedState, dailyQuota: INITIAL_QUOTA, lastResetDate: today, hasSeenAdToday: false };
      }
      return mergedState;
    }
    return defaultState;
  });

  // Sync with Server (Vercel KV) on Mount
  useEffect(() => {
    const syncWithServer = async () => {
      if (!state.telegramUserId) return;

      try {
        const response = await fetch(`/api/user/sync?user_id=${state.telegramUserId}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.isBanned) {
            alert("🚫 Your account has been banned for suspicious activity.");
            // Handle ban logic (e.g., disable interactions)
          }

          // If server balance is higher (due to AdGem rewards), update local state
          setState(prev => {
             // We prioritize server balance ONLY if it's an update from Offerwall.
             // Since this is a simple example, we simply ADD the server balance to local 
             // or replace if implementation logic dictates. 
             // To keep it simple: Use the server balance if it's non-zero and greater than local.
             if (data.balance > prev.balance) {
               return { ...prev, balance: data.balance };
             }
             return prev;
          });
        }
      } catch (e) {
        console.error("Sync failed", e);
      }
    };

    syncWithServer();
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

  return (
    <AppContext.Provider value={{ state, incrementBalance, decrementQuota, addQuota, setLanguage }}>
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
