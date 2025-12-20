export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const authHeader = getHeader(event, 'authorization');
  const directusUrl = (config.public.directusUrl as string).replace(/\/$/, '');

  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'Не авторизован',
    });
  }

  try {
    const response = await $fetch(`${directusUrl}/users/me`, {
      headers: {
        Authorization: authHeader,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      message: error.data?.errors?.[0]?.message || 'Ошибка получения пользователя',
    });
  }
});
