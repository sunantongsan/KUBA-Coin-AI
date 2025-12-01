
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processReferral } from '../../services/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, referrerId } = req.body;

    if (!userId || !referrerId) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const result = await processReferral(userId.toString(), referrerId.toString());

    if (result.success) {
      return res.status(200).json({ success: true, bonus: result.bonus });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }

  } catch (error) {
    console.error("Referral API Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
