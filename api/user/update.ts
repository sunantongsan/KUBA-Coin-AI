
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveUserState } from '../../services/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, balance, quota } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Security Note: In a production app, you would verify a Telegram WebApp Signature here
    // to ensure the request actually comes from that user. 
    // For this demo/prototype, we accept the ID.

    const success = await saveUserState(userId, { balance, quota });

    if (success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Database update failed' });
    }
  } catch (error) {
    console.error("Update API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
