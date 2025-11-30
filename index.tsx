
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize Telegram WebApp with Version Safety Checks
if (window.Telegram?.WebApp) {
  const webApp = window.Telegram.WebApp;
  
  // Always call ready() to notify Telegram that the app is initialized
  webApp.ready();
  
  // Expand if available (Safe to call on most versions, but check existence)
  if (typeof webApp.expand === 'function') {
    webApp.expand();
  }

  // Version Check for setHeaderColor (Available in 6.1+)
  if (
    webApp.isVersionAtLeast && 
    typeof webApp.isVersionAtLeast === 'function' &&
    webApp.isVersionAtLeast('6.1') &&
    typeof webApp.setHeaderColor === 'function'
  ) {
    webApp.setHeaderColor('#FFD700'); 
  }

  // Polyfill CloudStorage for versions < 6.9 to prevent errors from external SDKs (like Monetag)
  // We use Object.defineProperty to bypass the read-only getter warning if possible
  if (webApp.isVersionAtLeast && typeof webApp.isVersionAtLeast === 'function' && !webApp.isVersionAtLeast('6.9')) {
    try {
      const CloudStoragePolyfill = {
        setItem: (key: string, value: string, callback?: (err: any, saved: boolean) => void) => {
          try {
            localStorage.setItem(key, value);
            if (callback) callback(null, true);
          } catch (e) {
            if (callback) callback(e, false);
          }
        },
        getItem: (key: string, callback: (err: any, value: string | null) => void) => {
           const val = localStorage.getItem(key);
           if (callback) callback(null, val);
        },
        getItems: (keys: string[], callback: (err: any, values: any) => void) => {
           const result: any = {};
           keys.forEach(k => result[k] = localStorage.getItem(k));
           if (callback) callback(null, result);
        },
        removeItem: (key: string, callback?: (err: any, deleted: boolean) => void) => {
           localStorage.removeItem(key);
           if (callback) callback(null, true);
        },
        removeItems: (keys: string[], callback?: (err: any, deleted: boolean) => void) => {
           keys.forEach(k => localStorage.removeItem(k));
           if (callback) callback(null, true);
        },
        getKeys: (callback: (err: any, keys: string[]) => void) => {
           if (callback) callback(null, Object.keys(localStorage));
        }
      };

      // Define CloudStorage on the WebApp object
      Object.defineProperty(webApp, 'CloudStorage', {
        value: CloudStoragePolyfill,
        writable: true,
        configurable: true
      });
    } catch (e) {
      console.warn("Failed to polyfill CloudStorage", e);
    }
  }

  // Note: We use localStorage for data persistence which is compatible with all versions.
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
