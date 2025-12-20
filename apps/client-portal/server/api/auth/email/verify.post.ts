/**
 * POST /api/auth/email/verify
 * Verify email code and authenticate
 */

import { z } from 'zod';
import { getPersonAuthData } from '~/server/utils/directus';
import {
  getEmailSession,
  incrementEmailAttempts,
  deleteEmailSession,
  secureCompare,
} from '~/server/utils/authSessions';

const bodySchema = z.object({
  sessionId: z.string().uuid('Неверный формат сессии'),
  code: z
    .string()
    .length(6, 'Код должен содержать 6 цифр')
    .regex(/^\d{6}$/, 'Код должен содержать только цифры'),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Validate body
  const body = await readBody(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    });
  }

  const { sessionId, code } = result.data;

  try {
    // Get session
    const session = getEmailSession(sessionId);

    if (!session) {
      throw createError({
        statusCode: 400,
        message: 'Сессия истекла. Запросите код повторно',
      });
    }

    // Increment attempts
    const attempts = incrementEmailAttempts(sessionId);

    if (attempts < 0) {
      throw createError({
        statusCode: 429,
        message: 'Слишком много попыток. Запросите код повторно',
      });
    }

    // Verify code (constant-time comparison)
    if (!secureCompare(code, session.code)) {
      throw createError({
        statusCode: 401,
        message: `Неверный код. Осталось попыток: ${5 - attempts}`,
      });
    }

    // Get auth data
    const authData = await getPersonAuthData(session.personId, config);

    if (!authData) {
      throw createError({
        statusCode: 404,
        message: 'Данные пользователя не найдены',
      });
    }

    // Delete session after successful verification
    deleteEmailSession(sessionId);

    return {
      data: authData,
    };
  } catch (error: unknown) {
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Email verify error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка проверки кода',
    });
  }
});
