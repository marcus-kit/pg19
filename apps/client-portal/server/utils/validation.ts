/**
 * Validation schemas for authentication
 */

import { z } from 'zod';

/**
 * Phone number validation (Russian format)
 * Accepts: +7XXXXXXXXXX, 7XXXXXXXXXX, 8XXXXXXXXXX, 9XXXXXXXXXX
 */
export const phoneSchema = z
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
  );

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Введите email')
  .email('Неверный формат email')
  .transform((v) => v.toLowerCase().trim());

/**
 * 6-digit verification code
 */
export const codeSchema = z
  .string()
  .length(6, 'Код должен содержать 6 цифр')
  .regex(/^\d{6}$/, 'Код должен содержать только цифры');

/**
 * Session ID (UUID)
 */
export const sessionIdSchema = z
  .string()
  .uuid('Неверный формат сессии');

/**
 * Telegram auth data
 */
export const telegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

export type TelegramAuthData = z.infer<typeof telegramAuthSchema>;

/**
 * Validate and parse request body with Zod schema
 */
export async function validateBody<T>(
  event: Parameters<typeof readBody>[0],
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.errors[0];
    throw createError({
      statusCode: 400,
      message: firstError.message,
    });
  }

  return result.data;
}
