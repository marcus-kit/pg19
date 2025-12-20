/**
 * Asterisk CDR integration for phone verification
 *
 * This module provides functionality to check if a call was received
 * from a specific phone number on the Asterisk PBX.
 *
 * TODO: Implement actual Asterisk integration based on your setup:
 * - Option A: Query CDR database (MySQL/PostgreSQL)
 * - Option B: AMI (Asterisk Manager Interface)
 * - Option C: Webhook from Asterisk dialplan
 */

import type { RuntimeConfig } from 'nuxt/schema';

export interface CallRecord {
  calldate: Date;
  src: string;
  dst: string;
  duration: number;
}

/**
 * Check if there's an incoming call from the specified phone number
 * within the given time window
 *
 * @param phone - Phone number to check (normalized format: 7XXXXXXXXXX)
 * @param since - Check calls after this timestamp
 * @param config - Runtime config with Asterisk credentials
 */
export async function checkIncomingCall(
  phone: string,
  since: Date,
  config: RuntimeConfig
): Promise<boolean> {
  const { asteriskAmiHost } = config;

  // If Asterisk is not configured, use mock mode
  if (!asteriskAmiHost) {
    console.log(`[Asterisk Mock] Checking call from ${phone} since ${since.toISOString()}`);
    // In mock mode, always return false (user needs to configure Asterisk)
    // For testing, you can change this to return true
    return false;
  }

  // TODO: Implement actual Asterisk CDR check
  // Example implementation for MySQL CDR database:
  //
  // import mysql from 'mysql2/promise';
  //
  // const connection = await mysql.createConnection({
  //   host: config.asteriskCdrHost,
  //   user: config.asteriskCdrUser,
  //   password: config.asteriskCdrPassword,
  //   database: config.asteriskCdrDatabase,
  // });
  //
  // const [rows] = await connection.execute(
  //   `SELECT * FROM cdr
  //    WHERE src LIKE ?
  //    AND dst = ?
  //    AND calldate >= ?
  //    AND disposition = 'ANSWERED'
  //    ORDER BY calldate DESC
  //    LIMIT 1`,
  //   [`%${phone.slice(-10)}`, config.public.asteriskVerifyNumber, since]
  // );
  //
  // await connection.end();
  // return rows.length > 0;

  // Placeholder: throw error to indicate not implemented
  throw new Error('Asterisk integration not implemented. Configure CDR database access.');
}

/**
 * Normalize phone number for comparison
 * Removes all non-digits and converts 8 prefix to 7
 */
export function normalizePhoneForCdr(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  // Handle 8 prefix (Russia)
  if (digits.startsWith('8') && digits.length === 11) {
    digits = '7' + digits.slice(1);
  }

  // Handle short format starting with 9
  if (digits.startsWith('9') && digits.length === 10) {
    digits = '7' + digits;
  }

  return digits;
}
