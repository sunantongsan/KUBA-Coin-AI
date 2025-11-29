export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AppState {
  balance: number;
  dailyQuota: number;
  lastResetDate: string;
  hasSeenAdToday: boolean;
  language: string;
}

export interface AdConfig {
  url: string;
  rewardQuota: number;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    }
  }
}