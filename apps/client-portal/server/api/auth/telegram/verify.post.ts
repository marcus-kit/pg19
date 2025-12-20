/**
 * POST /api/auth/telegram/verify
 * Verify Telegram Login Widget auth data and authenticate
 */

import crypto from 'crypto';
import { z } from 'zod';
import { findPersonByField, getPersonAuthData } from '~/server/utils/directus';

const bodySchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

/**
 * Verify Telegram auth data hash
 * https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramAuth(
  data: Record<string, unknown>,
  botToken: string
): boolean {
  const { hash, ...authData } = data;

  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // Create data-check-string (sorted alphabetically)
  const dataCheckArr = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`);
  const dataCheckString = dataCheckArr.join('\n');

  // Create secret key from bot token (SHA256)
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // Calculate HMAC-SHA256
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const botToken = config.telegramBotToken as string;

  if (!botToken) {
    throw createError({
      statusCode: 500,
      message: 'Telegram авторизация не настроена',
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

  const telegramData = result.data;

  try {
    // Verify hash
    if (!verifyTelegramAuth(body, botToken)) {
      throw createError({
        statusCode: 401,
        message: 'Недействительные данные авторизации',
      });
    }

    // Check auth_date is not too old (max 1 day)
    const authAge = Date.now() / 1000 - telegramData.auth_date;
    if (authAge > 86400) {
      throw createError({
        statusCode: 401,
        message: 'Срок авторизации истёк. Повторите вход через Telegram',
      });
    }

    // Find person by telegram_id
    const person = await findPersonByField(
      'telegram_id',
      telegramData.id.toString(),
      config
    );

    if (!person) {
      throw createError({
        statusCode: 404,
        message: 'Telegram не привязан к аккаунту. Обратитесь в поддержку для привязки',
      });
    }

    if (person.status === 'terminated') {
      throw createError({
        statusCode: 403,
        message: 'Аккаунт деактивирован',
      });
    }

    // Get auth data
    const authData = await getPersonAuthData(person.id, config);

    if (!authData) {
      throw createError({
        statusCode: 404,
        message: 'Данные пользователя не найдены',
      });
    }

    return {
      data: authData,
    };
  } catch (error: unknown) {
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Telegram auth error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка авторизации через Telegram',
    });
  }
});
