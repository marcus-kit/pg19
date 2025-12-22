/**
 * GET /api/data/subscriptions?accountId=xxx
 * Get subscriptions for an account
 */

import { z } from 'zod';
import { getSubscriptions } from '~/server/utils/customerApi';

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
    const subscriptions = await getSubscriptions(accountId, config);

    return {
      data: subscriptions,
    };
  } catch (error: unknown) {
    console.error('Get subscriptions error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка получения подписок',
    });
  }
});
