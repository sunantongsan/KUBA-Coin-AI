
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { ADGEM_POSTBACK_KEY } from '../../constants';
import { updateBalance } from '../../services/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { user_id, amount, transaction_id, verifier } = req.query;

    console.log(`[AdGem Callback] Start: User=${user_id}, Amount=${amount}, TxID=${transaction_id}`);

    if (!user_id || !amount || !transaction_id || !verifier) {
      console.error("[AdGem Error] Missing parameters");
      return res.status(400).send("0");
    }

    const uId = Array.isArray(user_id) ? user_id[0] : user_id;
    const amtString = Array.isArray(amount) ? amount[0] : amount;
    const txId = Array.isArray(transaction_id) ? transaction_id[0] : transaction_id;
    const providedVerifier = Array.isArray(verifier) ? verifier[0] : verifier;

    // Validate Signature: SHA256(transaction_id + ADGEM_POSTBACK_KEY)
    const expectedSignature = crypto
      .createHash('sha256')
      .update(`${txId}${ADGEM_POSTBACK_KEY}`)
      .digest('hex');

    if (providedVerifier !== expectedSignature) {
       console.error(`[AdGem Error] Signature Mismatch! Expected: ${expectedSignature}, Got: ${providedVerifier}`);
       return res.status(403).send("0");
    }

    const amt = parseFloat(amtString);
    const success = await updateBalance(uId, amt, txId);

    if (success) {
      console.log(`[AdGem Success] Credited ${amt} to ${uId}`);
      return res.status(200).send("1");
    } else {
      console.error("[AdGem Failure] DB Update Failed");
      return res.status(500).send("0");
    }

  } catch (error) {
    console.error("[AdGem Critical Error]", error);
    return res.status(500).send("0");
  }
}
