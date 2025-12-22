/**
 * GET /api/data/services
 * Get available services list
 */

import { getServices } from '~/server/utils/customerApi';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const services = await getServices(config);

    return {
      data: services,
    };
  } catch (error: unknown) {
    console.error('Get services error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка получения списка услуг',
    });
  }
});
