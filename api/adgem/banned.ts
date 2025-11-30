
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ADGEM_BANNED_SECRET } from '../../constants';
import { banUser } from '../../services/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // AdGem Banned Webhook
  const { user_id, reason, secret } = req.query; // Check if AdGem sends secret in query or headers

  // Note: AdGem might pass the secret in a custom way. 
  // We assume here it's passed as a query param or we validate against the known secret logic.
  
  // If your configured webhook URL includes the secret, you can validate it here.
  // URL: .../api/adgem/banned?secret=5lblnajen32hid6095ad8hdl
  
  const providedSecret = secret || req.headers['x-adgem-secret'];

  if (providedSecret !== ADGEM_BANNED_SECRET && req.query.webhook_secret !== ADGEM_BANNED_SECRET) {
      // Loose check for query param "webhook_secret" just in case user set it there
      console.error("[AdGem Ban] Invalid Secret");
      return res.status(403).send("Forbidden");
  }

  if (!user_id) {
    return res.status(400).send("Missing user_id");
  }

  const uId = Array.isArray(user_id) ? user_id[0] : user_id;
  const reasonStr = Array.isArray(reason) ? reason[0] : (reason || 'Unknown');

  const success = await banUser(uId, reasonStr as string);

  if (success) {
    return res.status(200).send("1");
  } else {
    return res.status(500).send("0");
  }
}
