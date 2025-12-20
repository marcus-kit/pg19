export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const path = event.context.params?.path || '';
  const query = getQuery(event);

  // Build query string
  const queryString = Object.entries(query)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  const url = `${config.public.directusUrl}/items/${path}${queryString ? '?' + queryString : ''}`;

  const method = event.method;
  let body = undefined;

  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    body = await readBody(event);
  }

  try {
    const response = await $fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${config.directusApiToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return response;
  } catch (error: any) {
    console.error('Directus API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Directus API error',
    });
  }
});
