/**
 * POST /api/auth/email/send
 * Send verification code to email
 */

import { z } from 'zod';
import { findPersonByField } from '~/server/utils/directus';
import {
  createEmailSession,
  generateCode,
  generateSessionId,
} from '~/server/utils/authSessions';
import { sendVerificationEmail } from '~/server/utils/email';

const bodySchema = z.object({
  email: z
    .string()
    .min(1, 'Введите email')
    .email('Неверный формат email')
    .transform((v) => v.toLowerCase().trim()),
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

  const { email } = result.data;

  try {
    // Find person by email
    const person = await findPersonByField('email', email, config);

    if (!person) {
      throw createError({
        statusCode: 404,
        message: 'Пользователь с таким email не найден',
      });
    }

    if (person.status === 'terminated') {
      throw createError({
        statusCode: 403,
        message: 'Аккаунт деактивирован',
      });
    }

    // Generate code and session
    const code = generateCode();
    const sessionId = generateSessionId();

    // Store session
    createEmailSession(sessionId, email, code, person.id);

    // Send email
    await sendVerificationEmail(email, code, config);

    return {
      data: {
        sessionId,
        expiresIn: 300, // 5 minutes in seconds
      },
    };
  } catch (error: unknown) {
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Email auth error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка отправки кода',
    });
  }
});
