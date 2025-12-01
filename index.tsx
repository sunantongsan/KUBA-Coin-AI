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

  // Note: CloudStorage polyfill is handled in index.html before external SDKs load.
  // Note: We use localStorage for data persistence which is compatible with all versions.
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);