
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, language, data, timestamp } = req.body;
    
    // Validate
    if (!data || !data.prompt || !data.response || !data.feedback) {
       return res.status(400).json({ error: 'Missing feedback data' });
    }

    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      userId: userId || 'anonymous',
      language: language || 'unknown',
      ...data
    };

    // Store in a list in Redis/KV (key: feedback_logs)
    // lpush adds to the head of the list
    await kv.lpush('feedback_logs', logEntry);

    // Optional: Trim list to keep only last 1000 entries to save space
    await kv.ltrim('feedback_logs', 0, 999);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Feedback Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
