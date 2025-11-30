
# KUBA Coin AI - Telegram Mini App

## 🚀 Deployment Guide (Vercel + AdGem)

This app now includes a Backend (Serverless) to handle AdGem rewards securely.

### 1. Database Setup (Crucial)
Since AdGem sends data to the server, and the user is on their phone, we need a Database to sync the balance.
1. Deploy this project to Vercel.
2. In Vercel Project Dashboard -> **Storage**.
3. Create **KV (Redis)**.
4. Click **Connect**. Vercel will automatically add `KV_URL`, `KV_REST_API_URL`, etc., to your environment variables.
5. **Redeploy** your app (Deployments -> Redeploy) to apply changes.

### 2. AdGem Configuration
1. Open `constants.ts` and set your `ADGEM_APP_ID`.
2. Go to **AdGem Dashboard** -> **Postback Settings**.
3. **Reward Postback URL**: 
   ```
   https://YOUR-VERCEL-URL.vercel.app/api/adgem/callback?user_id={player_id}&amount={amount}&currency={currency}&transaction_id={transaction_id}&verifier={verifier}&offer_id={offer_id}
   ```
4. **Banned User Webhook URL**:
   ```
   https://YOUR-VERCEL-URL.vercel.app/api/adgem/banned?webhook_secret=5lblnajen32hid6095ad8hdl
   ```
   *If AdGem asks for a secret field separately, use: `5lblnajen32hid6095ad8hdl`*

### 3. Telegram Bot Setup
1. Create a bot via @BotFather.
2. Create a Menu Button or Inline Button with the URL pointing to your Vercel App.
3. When users open the app via Telegram, their `user_id` is automatically captured and used for the AdGem Offerwall link.

### 4. Testing
1. Open the app in Telegram.
2. Go to Wallet -> Click "Earn KUBA Coins".
3. Complete a test offer (or simulate it).
4. Reload the app. The balance should update automatically via the sync API.
