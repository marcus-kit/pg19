/**
 * POST /api/auth/telegram/check
 * Check Telegram authentication session status (polling endpoint)
 */

import { z } from 'zod';
import {
  getTelegramSession,
  deleteTelegramSession,
} from '~/server/utils/authSessions';

const bodySchema = z.object({
  sessionId: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  // Validate body
  const body = await readBody(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Неверный формат sessionId',
    });
  }

  const { sessionId } = result.data;

  try {
    const session = getTelegramSession(sessionId);

    // Session not found or expired
    if (!session) {
      return {
        status: 'expired',
        message: 'Сессия истекла. Начните заново',
      };
    }

    // Session still pending
    if (session.status === 'pending') {
      return {
        status: 'pending',
      };
    }

    // Session verified - return data and delete session
    if (session.status === 'verified' && session.authData) {
      deleteTelegramSession(sessionId);
      return {
        status: 'verified',
        data: session.authData,
      };
    }

    // Fallback
    return {
      status: 'pending',
    };
  } catch (error: unknown) {
    console.error('Telegram check error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка проверки статуса',
    });
  }
});
