/**
 * RabbitMQ integration via HTTP proxy
 *
 * Uses mq.dokasteel.ru as HTTP-to-AMQP bridge for:
 * - Fire-and-forget messages (email sending)
 * - RPC calls with response (call checking)
 */

import type { RuntimeConfig } from 'nuxt/schema';

interface RpcResponse<T> {
  success?: boolean;
  error?: string;
  data?: T;
}

/**
 * Send a message to a queue (fire-and-forget)
 * Used for tasks that don't need a response (like sending emails)
 */
export async function publishToQueue<T extends Record<string, unknown>>(
  queue: string,
  message: T,
  config: RuntimeConfig
): Promise<void> {
  const baseUrl = config.rabbitmqProxyUrl || 'https://mq.dokasteel.ru';

  const response = await fetch(`${baseUrl}/api/publish/${queue}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`RabbitMQ publish failed: ${error.error || response.statusText}`);
  }
}

/**
 * Make an RPC call to a queue and wait for response
 * Used for synchronous request-response patterns (like checking calls)
 */
export async function callRpc<T, R>(
  queue: string,
  message: T,
  config: RuntimeConfig,
  timeout?: number
): Promise<RpcResponse<R>> {
  const baseUrl = config.rabbitmqProxyUrl || 'https://mq.dokasteel.ru';
  const url = new URL(`${baseUrl}/api/rpc/${queue}`);

  if (timeout) {
    url.searchParams.set('timeout', timeout.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    return { success: false, error: error.error || response.statusText };
  }

  return response.json();
}

// ===== AUTH-SPECIFIC HELPERS =====

export interface EmailSendRequest {
  to: string;
  code: string;
  template?: 'verification' | 'welcome';
}

/**
 * Queue an email to be sent via RabbitMQ
 * The email-worker will pick this up and send via SMTP
 */
export async function queueEmailSend(
  request: EmailSendRequest,
  config: RuntimeConfig
): Promise<void> {
  const baseUrl = config.rabbitmqProxyUrl || 'https://mq.dokasteel.ru';

  const response = await fetch(`${baseUrl}/api/auth/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Email queue failed: ${error.error || response.statusText}`);
  }
}

export interface CallCheckRequest {
  phone: string;
  since: string; // ISO date string
  verifyNumber?: string;
}

export interface CallCheckResponse {
  found: boolean;
  callTime?: string;
  caller?: string;
  error?: string;
}

/**
 * Check if a call was received from the specified phone number
 * Uses RPC to query the call-check-worker
 */
export async function checkIncomingCallRpc(
  request: CallCheckRequest,
  config: RuntimeConfig
): Promise<CallCheckResponse> {
  const baseUrl = config.rabbitmqProxyUrl || 'https://mq.dokasteel.ru';

  const response = await fetch(`${baseUrl}/api/auth/phone/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return { found: false, error: 'RPC call failed' };
  }

  return response.json();
}
