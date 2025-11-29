
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  // Initialize State with Telegram User Detection
  const [state, setState] = useState<AppState>(() => {
    const today = new Date().toDateString();
    
    // 1. Try to get Telegram User Data
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const userId = tgUser?.id || null; // Null if running in browser/testing
    
    // 2. Define LocalStorage Key based on User ID (supports multi-user on same device if needed)
    const storageKey = userId ? `kuba_data_v1_${userId}` : 'kuba_data_v1_guest';

    // 3. Load previous data
    const saved = localStorage.getItem(storageKey);
    
    // Default fresh state
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
      // Merge saved data with current user info (in case username changed)
      const mergedState = { ...parsed, telegramUserId: userId, telegramUsername: defaultState.telegramUsername };

      // Daily Reset Logic
      if (parsed.lastResetDate !== today) {
        return { 
          ...mergedState, 
          dailyQuota: INITIAL_QUOTA, 
          lastResetDate: today, 
          hasSeenAdToday: false 
        };
      }
      return mergedState;
    }
    
    return defaultState;
  });

  // Persist State whenever it changes
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
