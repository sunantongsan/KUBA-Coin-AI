
import { kv } from '@vercel/kv';

// Define User Data Structure for DB
export interface UserData {
  balance: number;
  quota?: number; // Added quota sync
  isBanned: boolean;
  transactions: string[]; // Store transaction IDs to prevent duplicates
  lastUpdated: number;
}

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

    if (!userData) {
      userData = { balance: 0, isBanned: false, transactions: [], lastUpdated: Date.now() };
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
    return true;
  } catch (error) {
    console.error("KV Update Error:", error);
    return false;
  }
};

// NEW: Generic Save for Client-Side updates (Quota, Chat Rewards)
export const saveUserState = async (userId: string, data: Partial<UserData>): Promise<boolean> => {
  try {
    const userKey = `user:${userId}`;
    let userData = await kv.get<UserData>(userKey);

    if (!userData) {
      userData = { balance: 0, isBanned: false, transactions: [], lastUpdated: Date.now() };
    }
    
    // Update fields if provided
    if (data.balance !== undefined) userData.balance = data.balance;
    if (data.quota !== undefined) userData.quota = data.quota;

    userData.lastUpdated = Date.now();
    await kv.set(userKey, userData);
    return true;
  } catch (error) {
    console.error("KV Save Error:", error);
    return false;
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
