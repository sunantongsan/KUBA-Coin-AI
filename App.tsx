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
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  // Initial State Load from LocalStorage
  const loadState = (): AppState => {
    const saved = localStorage.getItem('kuba_app_state');
    const today = new Date().toDateString();
    
    // Default fresh state
    const defaultState: AppState = {
      balance: 0,
      dailyQuota: INITIAL_QUOTA,
      lastResetDate: today,
      hasSeenAdToday: false,
      language: navigator.language || 'en-US'
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      // Daily Reset Logic
      if (parsed.lastResetDate !== today) {
        return { ...parsed, dailyQuota: INITIAL_QUOTA, lastResetDate: today, hasSeenAdToday: false };
      }
      return parsed;
    }
    return defaultState;
  };

  const [state, setState] = useState<AppState>(loadState);

  // Persist State
  useEffect(() => {
    localStorage.setItem('kuba_app_state', JSON.stringify(state));
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

  return (
    <AppContext.Provider value={{ state, incrementBalance, decrementQuota, addQuota }}>
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