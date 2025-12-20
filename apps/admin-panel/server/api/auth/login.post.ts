export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const directusUrl = (config.public.directusUrl as string).replace(/\/$/, '');

  try {
    const response = await $fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      body: {
        email: body.email,
        password: body.password,
      },
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      message: error.data?.errors?.[0]?.message || 'Ошибка авторизации',
    });
  }
});
