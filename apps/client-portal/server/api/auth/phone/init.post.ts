/**
 * POST /api/auth/phone/init
 * Initialize phone authentication - user will call to verify
 */

import { z } from 'zod';
import { getCustomerByPhone, normalizePhone } from '~/server/utils/customerApi';
import { createPhoneSession, generateSessionId } from '~/server/utils/authSessions';

const bodySchema = z.object({
  phone: z
    .string()
    .min(1, 'Введите номер телефона')
    .transform((v) => v.replace(/\D/g, ''))
    .refine(
      (v) => {
        // Handle 8 prefix
        if (v.startsWith('8') && v.length === 11) {
          v = '7' + v.slice(1);
        }
        // Handle short format starting with 9
        if (v.startsWith('9') && v.length === 10) {
          v = '7' + v;
        }
        return /^7\d{10}$/.test(v);
      },
      { message: 'Неверный формат номера телефона' }
    ),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const verifyNumber = config.public.asteriskVerifyNumber as string;

  // Validate body
  const body = await readBody(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    });
  }

  // Normalize phone
  let phone = result.data.phone;
  if (phone.startsWith('8')) {
    phone = '7' + phone.slice(1);
  } else if (phone.startsWith('9')) {
    phone = '7' + phone;
  }

  try {
    // Find person by phone via RabbitMQ
    // Phone normalization is handled by customer-api-worker
    const authData = await getCustomerByPhone(phone, config);

    if (!authData) {
      throw createError({
        statusCode: 404,
        message: 'Пользователь с таким номером телефона не найден',
      });
    }

    if (authData.person.status === 'terminated') {
      throw createError({
        statusCode: 403,
        message: 'Аккаунт деактивирован',
      });
    }

    // Generate session
    const sessionId = generateSessionId();

    // Store session
    createPhoneSession(sessionId, phone, authData.person.id);

    return {
      data: {
        sessionId,
        verifyNumber,
        expiresIn: 180, // 3 minutes in seconds
      },
    };
  } catch (error: unknown) {
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Phone auth init error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка инициализации авторизации',
    });
  }
});
