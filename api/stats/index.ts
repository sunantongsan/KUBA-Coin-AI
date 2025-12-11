
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAppStats } from '../../services/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const stats = await getAppStats();
    // Cache for 1 minute to reduce DB load
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}
