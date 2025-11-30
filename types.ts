
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  feedback?: 'up' | 'down';
  sources?: { title: string; uri: string }[];
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

// Adsgram Interfaces
export interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: 'load' | 'render' | 'playing' | 'destroy';
  error: boolean;
}

export interface AdsgramController {
  show: () => Promise<ShowPromiseResult>;
}

declare global {
  interface Window {
    Adsgram?: {
      init: (params: { blockId: string; debug?: boolean }) => AdsgramController;
    };
    html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
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