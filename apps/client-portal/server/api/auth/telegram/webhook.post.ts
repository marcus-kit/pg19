/**
 * POST /api/auth/telegram/webhook
 * Webhook endpoint called by Telegram bot when user confirms auth
 */

import crypto from 'crypto';
import { z } from 'zod';
import {
  getTelegramSession,
  verifyTelegramSession,
} from '~/server/utils/authSessions';
import { getCustomerByTelegram } from '~/server/utils/customerApi';

const bodySchema = z.object({
  session_id: z.string().uuid(),
  telegram_id: z.string(),
  first_name: z.string(),
  last_name: z.string().optional().default(''),
  username: z.string().optional().default(''),
  signature: z.string(),
});

/**
 * Verify webhook signature
 * Signature = HMAC-SHA256(sessionId:telegramId, secret)
 */
function verifySignature(
  sessionId: string,
  telegramId: string,
  signature: string,
  secret: string
): boolean {
  const data = `${sessionId}:${telegramId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const webhookSecret = config.telegramWebhookSecret as string;

  if (!webhookSecret) {
    throw createError({
      statusCode: 500,
      message: 'Webhook не настроен',
    });
  }

  // Validate body
  const body = await readBody(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    });
  }

  const { session_id, telegram_id, signature } = result.data;

  try {
    // Verify signature
    if (!verifySignature(session_id, telegram_id, signature, webhookSecret)) {
      throw createError({
        statusCode: 401,
        message: 'Недействительная подпись',
      });
    }

    // Check session exists
    const session = getTelegramSession(session_id);
    if (!session) {
      throw createError({
        statusCode: 404,
        message: 'Сессия не найдена или истекла',
      });
    }

    // Find person by telegram_id via RabbitMQ
    const authData = await getCustomerByTelegram(telegram_id, config);

    if (!authData) {
      throw createError({
        statusCode: 404,
        message: 'Telegram не привязан к аккаунту',
      });
    }

    if (authData.person.status === 'terminated') {
      throw createError({
        statusCode: 403,
        message: 'Аккаунт деактивирован',
      });
    }

    // Mark session as verified with auth data
    verifyTelegramSession(session_id, telegram_id, authData);

    return {
      success: true,
      message: 'Авторизация подтверждена',
    };
  } catch (error: unknown) {
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Telegram webhook error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка обработки webhook',
    });
  }
});
