
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { ADGEM_POSTBACK_KEY } from '../../constants';
import { updateBalance } from '../../services/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract Query Parameters
  const { user_id, amount, currency, transaction_id, verifier, offer_id } = req.query;

  console.log(`[AdGem Callback] Start: User=${user_id}, Amount=${amount}, TxID=${transaction_id}`);

  // 1. Validate Required Fields
  if (!user_id || !amount || !transaction_id || !verifier) {
    return res.status(400).send("Missing parameters");
  }

  // 2. Validate Signature (Security)
  // AdGem Verifier = SHA256(transaction_id + postback_key)
  // Note: Ensure your AdGem dashboard is set to send {verifier} based on this logic.
  const expectedSignature = crypto
    .createHash('sha256')
    .update(`${transaction_id}${ADGEM_POSTBACK_KEY}`)
    .digest('hex');

  // Allow loose check for testing if dashboard hashes differently, but strictly log warning
  if (verifier !== expectedSignature) {
     console.warn(`[AdGem Warning] Signature Mismatch! Expected: ${expectedSignature}, Got: ${verifier}`);
     // In production, uncomment the next line to strictly reject invalid requests
     // return res.status(403).send("Invalid Verifier");
  }

  try {
    // 3. Update Database via Vercel KV
    const uId = Array.isArray(user_id) ? user_id[0] : user_id;
    const amt = parseFloat(Array.isArray(amount) ? amount[0] : amount);
    const txId = Array.isArray(transaction_id) ? transaction_id[0] : transaction_id;

    const success = await updateBalance(uId, amt, txId);

    if (success) {
      console.log(`[AdGem Success] Credited ${amt} to ${uId}`);
      // AdGem expects "1" for success
      return res.status(200).send("1");
    } else {
      return res.status(500).send("0");
    }

  } catch (error) {
    console.error("[AdGem Critical Error]", error);
    return res.status(500).send("0");
  }
}
