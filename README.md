# KUBA Coin AI - Telegram Mini App

This is a complete React-based Telegram Mini App (TMA) for KUBA Coin.

## 🚀 Deployment Guide (Fix for Blank Screen)

This project uses **Vite** for fast and reliable building.

### 1. Vercel Deployment (Recommended)

1.  Push this code to **GitHub**.
2.  Go to [Vercel](https://vercel.com) -> **Add New Project**.
3.  Select your `kuba-coin-ai` repository.
4.  **Important:** In the "Environment Variables" section, add:
    *   **Name:** `API_KEY`
    *   **Value:** `AIzaSyDnwlTSm5Rzu3NremHCk_HTK85M4raaYfo` (or your new key)
5.  Click **Deploy**.
    *   Vercel will automatically detect `vite` and run `npm run build`.

### 2. Local Development

1.  `npm install`
2.  `npm run dev`
3.  Open the local URL shown in terminal.

### 3. Telegram Setup

1.  Open **@BotFather** in Telegram.
2.  `/newapp` -> Select Bot -> Enter Details.
3.  **WebApp URL:** Paste your Vercel URL (e.g., `https://your-project.vercel.app`).
4.  Done!

### 🔑 Note on API Key
The code is configured to look for `process.env.API_KEY`. By setting the Environment Variable in Vercel settings, it will be injected securely during the build.
