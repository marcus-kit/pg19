/**
 * POST /api/auth/phone/check
 * Check if user has called to verify phone
 */

import { z } from 'zod';
import { getCustomerAuthData } from '~/server/utils/customerApi';
import {
  getPhoneSession,
  verifyPhoneSession,
  deletePhoneSession,
} from '~/server/utils/authSessions';
import { checkIncomingCall } from '~/server/utils/asterisk';

const bodySchema = z.object({
  sessionId: z.string().uuid('Неверный формат сессии'),
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

  const { sessionId } = result.data;

  try {
    // Get session
    const session = getPhoneSession(sessionId);

    if (!session) {
      throw createError({
        statusCode: 400,
        message: 'Сессия истекла. Начните авторизацию заново',
      });
    }

    // If already verified, return auth data
    if (session.verified) {
      const authData = await getCustomerAuthData(session.personId, config);

      if (!authData) {
        throw createError({
          statusCode: 404,
          message: 'Данные пользователя не найдены',
        });
      }

      // Delete session after returning data
      deletePhoneSession(sessionId);

      return {
        data: {
          verified: true,
          auth: authData,
        },
      };
    }

    // Check if call was received
    const callReceived = await checkIncomingCall(
      session.phone,
      new Date(session.createdAt),
      config
    );

    if (!callReceived) {
      return {
        data: {
          verified: false,
        },
      };
    }

    // Mark session as verified
    verifyPhoneSession(sessionId);

    // Get auth data via RabbitMQ
    const authData = await getCustomerAuthData(session.personId, config);

    if (!authData) {
      throw createError({
        statusCode: 404,
        message: 'Данные пользователя не найдены',
      });
    }

    // Delete session after successful verification
    deletePhoneSession(sessionId);

    return {
      data: {
        verified: true,
        auth: authData,
      },
    };
  } catch (error: unknown) {
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    // If Asterisk not implemented, return specific message
    if (error instanceof Error && error.message.includes('not implemented')) {
      return {
        data: {
          verified: false,
          message: 'Проверка звонков временно недоступна',
        },
      };
    }

    console.error('Phone auth check error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка проверки звонка',
    });
  }
});
