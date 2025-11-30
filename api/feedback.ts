
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, language, data, timestamp } = req.body;
    
    if (!data || !data.prompt || !data.response || !data.feedback) {
       return res.status(400).json({ error: 'Missing feedback data' });
    }

    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      userId: userId || 'anonymous',
      language: language || 'unknown',
      ...data
    };

    // Store in Redis list 'feedback_logs'
    await kv.lpush('feedback_logs', logEntry);
    await kv.ltrim('feedback_logs', 0, 999); // Keep last 1000 logs

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Feedback Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
