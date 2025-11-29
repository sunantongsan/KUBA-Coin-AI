
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AppState {
  // User Identity
  telegramUserId: number | null;
  telegramUsername: string | null;
  
  // App Data
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
      WebApp: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        openTelegramLink: (url: string) => void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
      };
    }
  }
}
