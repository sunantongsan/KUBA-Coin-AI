# KUBA Coin AI - Telegram Mini App

This is a complete React-based Telegram Mini App (TMA) for KUBA Coin. It features a troll AI chatbot (Gemini), a simulated wallet, and an ad-reward system.

## 🚀 Quick Start & Deployment

### 1. Prerequisites
- Node.js (v18+)
- A GitHub Account
- A Telegram Account

### 2. Local Development
1. Unzip the file.
2. Run `npm install` (you need to create a `package.json` first, see below).
3. Run `npm start`.

**Create a `package.json` manually if needed:**
```json
{
  "name": "kuba-ai",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "deploy": "gh-pages -d build"
  },
  "dependencies": {
    "@google/genai": "^0.0.10",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "react-scripts": "5.0.1",
    "recharts": "^2.12.0",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4",
    "gh-pages": "^6.1.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### 3. Deploying to GitHub Pages (Free Hosting)

1. **Create a Repository:** Go to GitHub and create a new public repo named `kuba-ai`.
2. **Push Code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kuba-ai.git
   git push -u origin main
   ```
3. **Configure Homepage:**
   Open `package.json` and add this line at the top:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/kuba-ai",
   ```
4. **Deploy:**
   ```bash
   npm run build
   npm run deploy
   ```
   *This command uploads the `build` folder to a `gh-pages` branch.*

### 4. Setting up Telegram Mini App

1. Open Telegram and search for **@BotFather**.
2. Type `/newbot` and follow instructions to create a bot (if you haven't).
3. Type `/newapp`.
4. Select your bot.
5. Enter title: "KUBA AI".
6. Enter description: "Troll AI & Wallet".
7. Upload a photo (use the KUBA logo).
8. **WebApp URL:** Enter your GitHub Pages URL (e.g., `https://yourname.github.io/kuba-ai`).
   *Note: Ensure the URL starts with `https://`.*
9. Enter a short name for the button.
10. Done! You will get a link like `t.me/YourBotName/appname`.

### 🔑 Configuration

**API Key:**
The Gemini API Key is currently embedded in `services/geminiService.ts` for demonstration purposes using `process.env`.
To change it securely:
1. Create a `.env` file in the root.
2. Add `REACT_APP_API_KEY=your_key_here`.
3. Update `geminiService.ts` to use `process.env.REACT_APP_API_KEY`.

**Contract Address:**
Edit `constants.ts` to update the KUBA contract address.

### 📱 Features

- **Troll AI:** Uses Gemini 2.5 Flash with a custom system prompt to be sarcastic.
- **Language Auto-Detect:** Detects browser/Telegram language and responds accordingly.
- **Earn System:** Clicking "Watch Ad" simulates an ad view and adds +2 to the daily chat quota.
- **Wallet:** Shows balance (stored in localStorage) and chart.

Enjoy building with KUBA! 🚀
