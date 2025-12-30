/**
 * Asterisk CDR integration for phone verification
 *
 * Supports two modes:
 * 1. RabbitMQ (production) - RPC call to call-check-worker
 * 2. Mock mode (development) - returns false or configurable response
 *
 * The call-check-worker queries Asterisk CDR database or AMI
 * and responds with whether a call was detected.
 */

import type { RuntimeConfig } from 'nuxt/schema';
import { checkIncomingCallRpc, type CallCheckResponse } from './rabbitmq';

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
 * @param config - Runtime config with RabbitMQ/Asterisk settings
 */
export async function checkIncomingCall(
  phone: string,
  since: Date,
  config: RuntimeConfig
): Promise<boolean> {
  // Try RabbitMQ RPC first (production mode)
  if (config.rabbitmqProxyUrl) {
    try {
      const response: CallCheckResponse = await checkIncomingCallRpc(
        {
          phone: normalizePhoneForCdr(phone),
          since: since.toISOString(),
          verifyNumber: config.public.asteriskVerifyNumber as string,
        },
        config
      );

      if (response.error) {
        console.warn(`[Asterisk] RPC error: ${response.error}`);
        // Don't fall through - if RabbitMQ is configured but failed,
        // we should not return mock data in production
        return false;
      }

      console.log(
        `[Asterisk] RPC check for ${phone}: ${response.found ? 'FOUND' : 'NOT FOUND'}`,
        response.callTime ? `at ${response.callTime}` : ''
      );

      return response.found;
    } catch (error) {
      console.error(`[Asterisk] RPC failed:`, error);
      return false;
    }
  }

  // Mock mode (development without RabbitMQ)
  console.log(`[Asterisk Mock] Checking call from ${phone} since ${since.toISOString()}`);

  // For development: check if mock mode should return true
  // Set ASTERISK_MOCK_CALL_FOUND=true in .env to simulate successful call
  if (process.env.ASTERISK_MOCK_CALL_FOUND === 'true') {
    console.log(`[Asterisk Mock] Returning mock success`);
    return true;
  }

  return false;
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
