
import { kv } from '@vercel/kv';
import { INITIAL_QUOTA, WELCOME_BONUS, REFERRAL_REWARD } from '../constants';

// Define User Data Structure for DB
export interface UserData {
  balance: number;
  lockedBalance?: number;
  unlockDate?: string | null;
  quota?: number; 
  isBanned: boolean;
  transactions: string[]; // Store transaction IDs to prevent duplicates
  referredBy?: string; // ID of the person who invited this user
  referrals?: string[]; // List of IDs this user has invited
  lastUpdated: number;
}

// === STATS FUNCTIONS ===

export const updateGlobalStats = async (coinChange: number, isNewUser: boolean) => {
    try {
        const pipeline = kv.pipeline();
        if (coinChange > 0) pipeline.incrby('stats:total_coins', Math.floor(coinChange));
        if (isNewUser) pipeline.incr('stats:total_users');
        await pipeline.exec();
    } catch (e) {
        console.error("Stats Update Error", e);
    }
};

export const incrementVisits = async () => {
    try {
        await kv.incr('stats:visits');
    } catch (e) {
        console.error("Visit Incr Error", e);
    }
};

export const getAppStats = async () => {
    try {
        const [coins, users, visits] = await Promise.all([
            kv.get('stats:total_coins'),
            kv.get('stats:total_users'),
            kv.get('stats:visits')
        ]);
        return {
            totalCoins: Number(coins) || 0,
            totalUsers: Number(users) || 0,
            totalVisits: Number(visits) || 0,
            activeNow: Math.floor(Math.random() * 50) + 10 // Mock for now, real active requires socket/polling logic
        };
    } catch (e) {
        return { totalCoins: 0, totalUsers: 0, totalVisits: 0, activeNow: 0 };
    }
};

// === USER FUNCTIONS ===

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    return await kv.get<UserData>(`user:${userId}`);
  } catch (error) {
    console.error("KV Get Error:", error);
    return null;
  }
};

export const updateBalance = async (userId: string, amount: number, transactionId: string): Promise<boolean> => {
  try {
    const userKey = `user:${userId}`;
    let userData = await kv.get<UserData>(userKey);
    let isNew = false;

    if (!userData) {
      userData = { balance: 0, isBanned: false, transactions: [], lastUpdated: Date.now() };
      isNew = true;
    }

    // Check for duplicate transaction
    if (userData.transactions.includes(transactionId)) {
      console.log(`Transaction ${transactionId} already processed.`);
      return true; // Treat as success to stop AdGem from retrying
    }

    if (userData.isBanned) {
      console.log(`User ${userId} is banned. Skipping reward.`);
      return false;
    }

    userData.balance += amount;
    userData.transactions.push(transactionId);
    userData.lastUpdated = Date.now();

    await kv.set(userKey, userData);
    
    // Update Global Stats
    await updateGlobalStats(amount, isNew);

    return true;
  } catch (error) {
    console.error("KV Update Error:", error);
    return false;
  }
};

// NEW: Generic Save for Client-Side updates (Quota, Chat Rewards, Locking)
export const saveUserState = async (userId: string, data: Partial<UserData>): Promise<boolean> => {
  try {
    const userKey = `user:${userId}`;
    let userData = await kv.get<UserData>(userKey);
    let isNew = false;

    if (!userData) {
      userData = { balance: 0, isBanned: false, transactions: [], lastUpdated: Date.now() };
      isNew = true;
    }
    
    // Calculate coin difference for stats
    let coinDelta = 0;
    if (data.balance !== undefined && data.balance > userData.balance) {
        coinDelta = data.balance - userData.balance;
    }

    // Update fields if provided
    if (data.balance !== undefined) userData.balance = data.balance;
    if (data.quota !== undefined) userData.quota = data.quota;
    if (data.lockedBalance !== undefined) userData.lockedBalance = data.lockedBalance;
    if (data.unlockDate !== undefined) userData.unlockDate = data.unlockDate;

    userData.lastUpdated = Date.now();
    await kv.set(userKey, userData);

    // Update Global Stats
    if (coinDelta > 0 || isNew) {
        await updateGlobalStats(coinDelta, isNew);
    }

    return true;
  } catch (error) {
    console.error("KV Save Error:", error);
    return false;
  }
};

// Process Referral Logic
export const processReferral = async (newUserId: string, referrerId: string): Promise<{ success: boolean, message: string, bonus: number }> => {
  try {
    if (newUserId === referrerId) return { success: false, message: "Self-referral", bonus: 0 };

    const newUserKey = `user:${newUserId}`;
    const referrerKey = `user:${referrerId}`;

    const [newUser, referrer] = await Promise.all([
      kv.get<UserData>(newUserKey),
      kv.get<UserData>(referrerKey)
    ]);

    // 1. Validate Referrer exists
    if (!referrer) {
      return { success: false, message: "Invalid Referrer ID", bonus: 0 };
    }

    // 2. Validate New User is actually new (or hasn't been referred yet)
    // If user exists and has balance > 0 or has already been referred, deny.
    if (newUser && (newUser.referredBy || newUser.balance > 100)) {
      return { success: false, message: "User already exists", bonus: 0 };
    }

    // Initialize New User if not exists
    const finalNewUser = newUser || { 
      balance: 0, 
      quota: INITIAL_QUOTA,
      isBanned: false, 
      transactions: [], 
      lastUpdated: Date.now() 
    };

    // Apply Logic
    finalNewUser.referredBy = referrerId;
    finalNewUser.balance += WELCOME_BONUS; // 2000 Bonus for New User
    finalNewUser.transactions.push(`REF_WELCOME_${referrerId}`);

    referrer.balance += REFERRAL_REWARD; // 2000 Reward for Referrer
    referrer.referrals = referrer.referrals || [];
    referrer.referrals.push(newUserId);
    referrer.transactions.push(`REF_REWARD_${newUserId}`);

    // Atomic-ish Save
    await Promise.all([
      kv.set(newUserKey, finalNewUser),
      kv.set(referrerKey, referrer)
    ]);

    // Update Stats: New User + Total Coins (Welcome + Referral)
    await updateGlobalStats(WELCOME_BONUS + REFERRAL_REWARD, !newUser);

    return { success: true, message: "Referral Successful", bonus: WELCOME_BONUS };

  } catch (error) {
    console.error("Referral Error:", error);
    return { success: false, message: "Server Error", bonus: 0 };
  }
};

export const banUser = async (userId: string, reason: string): Promise<boolean> => {
  try {
    const userKey = `user:${userId}`;
    let userData = await kv.get<UserData>(userKey);

    if (!userData) {
      userData = { balance: 0, isBanned: true, transactions: [], lastUpdated: Date.now() };
    } else {
      userData.isBanned = true;
    }

    await kv.set(userKey, userData);
    console.log(`User ${userId} banned via AdGem Alert. Reason: ${reason}`);
    return true;
  } catch (error) {
    console.error("KV Ban Error:", error);
    return false;
  }
};
