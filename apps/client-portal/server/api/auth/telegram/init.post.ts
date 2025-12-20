/**
 * POST /api/auth/telegram/init
 * Initialize Telegram deep link authentication session
 */

import {
  createTelegramSession,
  generateSessionId,
} from '~/server/utils/authSessions';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const botUsername = config.public.telegramBotUsername as string;

  if (!botUsername) {
    throw createError({
      statusCode: 500,
      message: 'Telegram авторизация не настроена',
    });
  }

  try {
    // Create session
    const sessionId = generateSessionId();
    createTelegramSession(sessionId);

    // Build deep link
    const deepLink = `https://t.me/${botUsername}?start=auth_${sessionId}`;

    return {
      sessionId,
      deepLink,
      expiresIn: 180, // 3 minutes
    };
  } catch (error: unknown) {
    console.error('Telegram init error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка инициализации Telegram авторизации',
    });
  }
});
