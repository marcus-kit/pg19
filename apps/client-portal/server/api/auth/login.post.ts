export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const directusUrl = (config.public.directusUrl as string).replace(/\/$/, '');

  const { contractNumber, fullName } = body;

  if (!contractNumber || !fullName) {
    throw createError({
      statusCode: 400,
      message: 'Заполните все поля',
    });
  }

  // Parse fullName into parts (supports "Фамилия Имя" or "Фамилия Имя Отчество")
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    throw createError({
      statusCode: 400,
      message: 'Введите фамилию и имя',
    });
  }

  const lastName = nameParts[0];
  const firstName = nameParts[1];

  try {
    // Use static API token for Directus access
    const token = config.directusApiToken as string;

    if (!token) {
      throw createError({
        statusCode: 500,
        message: 'Сервер не настроен для авторизации',
      });
    }

    // Build query string manually for Directus bracket notation
    const params = new URLSearchParams();
    params.append('filter[contract_number][_eq]', contractNumber);
    params.append('filter[status][_eq]', 'active');
    params.append('fields', '*,person_id.*,accounts.*');
    params.append('limit', '1');

    const contractsResponse = await $fetch<{ data: any[] }>(
      `${directusUrl}/items/contracts?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const contracts = contractsResponse.data;

    if (!contracts || contracts.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Договор не найден',
      });
    }

    const contract = contracts[0];
    const person = contract.person_id;

    if (!person) {
      throw createError({
        statusCode: 404,
        message: 'Абонент не найден',
      });
    }

    // Check name (case-insensitive)
    const normalizedLastName = lastName.trim().toLowerCase();
    const normalizedFirstName = firstName.trim().toLowerCase();
    const personLastName = (person.last_name || '').toLowerCase();
    const personFirstName = (person.first_name || '').toLowerCase();

    if (personLastName !== normalizedLastName || personFirstName !== normalizedFirstName) {
      throw createError({
        statusCode: 401,
        message: 'ФИО не совпадает с данными договора',
      });
    }

    // Check person status
    if (person.status === 'terminated') {
      throw createError({
        statusCode: 403,
        message: 'Договор расторгнут',
      });
    }

    // Return auth data
    return {
      data: {
        person,
        contract: {
          ...contract,
          person_id: person.id, // Replace nested object with ID
        },
        accounts: contract.accounts || [],
      },
    };
  } catch (error: any) {
    // Re-throw createError errors
    if (error.statusCode) {
      throw error;
    }

    console.error('Client auth error:', error);
    console.error('Error details:', JSON.stringify({
      message: error.message,
      statusCode: error.statusCode,
      data: error.data,
      response: error.response,
    }));
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.errors?.[0]?.message || error.message || 'Ошибка авторизации',
    });
  }
});
