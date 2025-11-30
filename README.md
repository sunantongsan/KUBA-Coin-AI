
# KUBA Coin AI - Telegram Mini App

This is a complete React-based Telegram Mini App (TMA) for KUBA Coin.

## 🚀 Deployment Guide

This project uses **Vite** for fast and reliable building.

### 1. Vercel Deployment (Recommended)

1.  Push this code to **GitHub**.
2.  Go to [Vercel](https://vercel.com) -> **Add New Project**.
3.  Select your `kuba-coin-ai` repository.
4.  Click **Deploy**.
    *   Vercel will automatically detect `vite` and run `npm run build`.
    *   API Endpoints in `/api` will be automatically deployed as Serverless Functions.

### 2. AdGem Offerwall Setup

To earn revenue and reward users, this app supports AdGem Offerwall.

1.  Go to **constants.ts** and update `ADGEM_APP_ID` with your ID from the AdGem Dashboard.
2.  In AdGem Dashboard -> **Postback Settings**:
    *   **Postback URL:** `https://YOUR-APP-URL.vercel.app/api/adgem/callback?user_id={player_id}&amount={amount}&currency={currency}&transaction_id={transaction_id}&verifier={verifier}&offer_id={offer_id}`
    *   **Banned Users Postback:** `https://YOUR-APP-URL.vercel.app/api/adgem/banned?user_id={player_id}&reason={reason}`
3.  **Important:** The current implementation validates the AdGem callback on the server. However, since the app's wallet is currently stored in the user's phone (LocalStorage), the server cannot directly update the balance you see on the screen.
    *   **For Production:** You MUST connect a real database (like Vercel KV, MongoDB, or Firebase) in `api/adgem/callback.ts` to persist user balances across devices.

### 3. Telegram Setup

1.  Open **@BotFather** in Telegram.
2.  `/newapp` -> Select Bot -> Enter Details.
3.  **WebApp URL:** Paste your Vercel URL (e.g., `https://kuba-coin-ai.vercel.app`).
4.  Done!
