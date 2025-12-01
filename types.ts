
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  feedback?: 'up' | 'down';
  sources?: { title: string; uri: string }[];
  attachment?: {
    type: 'image'; // Removed audio support
    url: string; // Base64 data URL for display
    mimeType: string;
  };
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
  // Removed selectedVoice
  soundMode: 'off' | 'comedy' | 'cartoon' | 'game' | 'laughter';

  // Daily Mission Data
  adsWatchedToday: number;
  dailyRewardClaimed: boolean;
}

export interface AdConfig {
  url: string;
  rewardQuota: number;
}

declare global {
  interface Window {
    html2canvas?: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        isVersionAtLeast: (version: string) => boolean;
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