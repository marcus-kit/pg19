/**
 * GET /api/data/balance?accountId=xxx
 * Get account balance
 */

import { z } from 'zod';
import { getAccountBalance } from '~/server/utils/customerApi';

const querySchema = z.object({
  accountId: z.string().min(1, 'accountId required'),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const result = querySchema.safeParse(query);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    });
  }

  const { accountId } = result.data;

  try {
    const balance = await getAccountBalance(accountId, config);

    if (!balance) {
      throw createError({
        statusCode: 404,
        message: 'Счёт не найден',
      });
    }

    return {
      data: balance,
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Get balance error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка получения баланса',
    });
  }
});
