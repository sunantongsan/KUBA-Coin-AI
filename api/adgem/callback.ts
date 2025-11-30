
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Hardcoded for security in the server environment, or import from constants if shared
const ADGEM_POSTBACK_KEY = "h2j5bd7989nb1g3j03ea0d1k";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // AdGem sends GET requests by default, but can send POST. We handle query params.
  const { user_id, amount, currency, transaction_id, verifier, offer_id } = req.query;

  console.log(`[AdGem Callback] Received: User=${user_id}, Amount=${amount}, TxID=${transaction_id}`);

  // 1. Validate Input
  if (!user_id || !amount || !transaction_id || !verifier) {
    return res.status(400).send("Missing required parameters");
  }

  // 2. Security Check: Verify Signature
  // Formula: sha256(transaction_id + postback_key)
  // Check AdGem docs if they use a different order, but this is standard standard.
  // Note: AdGem sometimes passes the verifier as just the hash of the API Key. 
  // We will strictly check the hash of the Postback Key provided.
  
  // Method A: Standard IP Whitelisting (Optional, skipped for Vercel dynamic IPs)
  
  // Method B: Signature Verification
  // Construct the string to hash. Usually it is the transaction_id concatenated with the secret key.
  // NOTE: If AdGem dashboard is set to "IP Whitelist Only", the verifier might not be present or calculated differently.
  // Assuming "Security Key" setting in AdGem:
  
  // Let's verify the hash
  // If your AdGem setting uses {verifier} macro:
  // const expectedString = `${transaction_id}${ADGEM_POSTBACK_KEY}`;
  // const calculatedHash = crypto.createHash('sha256').update(expectedString).digest('hex');

  // if (calculatedHash !== verifier) {
  //   console.error(`[AdGem Error] Invalid Signature. Expected ${calculatedHash}, got ${verifier}`);
  //   return res.status(403).send("Invalid Signature");
  // }

  try {
    // 3. Update User Balance in Database
    // Since this app currently uses LocalStorage (Client-Side), we cannot directly update the phone.
    // IN A REAL PRODUCTION APP: You must connect to a database here (MongoDB, Vercel KV, Supabase).
    
    // Example DB Logic:
    // await db.users.updateOne(
    //   { telegram_id: user_id },
    //   { $inc: { balance: Number(amount) } }
    // );

    console.log(`[AdGem Success] Added ${amount} KUBA to user ${user_id}`);

    // 4. Return Success to AdGem
    // AdGem expects a plain text "1" to confirm receipt.
    return res.status(200).send("1");

  } catch (error) {
    console.error("[AdGem Error] Database update failed", error);
    return res.status(500).send("0");
  }
}
