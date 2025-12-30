/**
 * GET /api/data/invoices?accountId=xxx&status=pending&limit=10&offset=0&year=2024
 * Get invoices for an account
 */

import { z } from 'zod';
import { getInvoices } from '~/server/utils/customerApi';

const querySchema = z.object({
  accountId: z.string().min(1, 'accountId required'),
  status: z.string().optional(),
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

  const { accountId, status, limit, offset, year } = result.data;

  try {
    const { items, total } = await getInvoices(accountId, config, {
      status,
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
    console.error('Get invoices error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка получения счетов',
    });
  }
});
