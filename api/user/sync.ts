
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserData } from '../../services/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const userData = await getUserData(user_id);
    
    // Return 0 if user doesn't exist yet in DB
    return res.status(200).json({
      balance: userData ? userData.balance : 0,
      isBanned: userData ? userData.isBanned : false
    });
  } catch (error) {
    return res.status(500).json({ error: "Sync failed" });
  }
}
