import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

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
}

// Manifest URL for TON Connect (Must be absolute in production, relative works for some local setups but absolute is safer)
// Since we are in a dynamic environment, we use window.location.origin
const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);