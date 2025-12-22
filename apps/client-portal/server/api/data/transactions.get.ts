/**
 * GET /api/data/transactions?accountId=xxx&limit=10&offset=0&year=2024
 * Get transactions for an account
 */

import { z } from 'zod';
import { getTransactions } from '~/server/utils/customerApi';

const querySchema = z.object({
  accountId: z.string().min(1, 'accountId required'),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  year: z.coerce.number().optional(),
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

  const { accountId, limit, offset, year } = result.data;

  try {
    const { items, total } = await getTransactions(accountId, config, {
      limit,
      offset,
      year,
    });

    return {
      data: items,
      meta: {
        total,
        limit: limit || 50,
        offset: offset || 0,
      },
    };
  } catch (error: unknown) {
    console.error('Get transactions error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка получения транзакций',
    });
  }
});
