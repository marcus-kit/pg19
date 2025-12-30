/**
 * POST /api/auth/login
 * Login with contract number + full name
 */

import { getCustomerByContract } from '~/server/utils/customerApi';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

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
    // Get customer data via RabbitMQ
    const authData = await getCustomerByContract(contractNumber, config);

    if (!authData) {
      throw createError({
        statusCode: 404,
        message: 'Договор не найден',
      });
    }

    const { person, contract } = authData;

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

    // Check contract status
    if (contract.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: 'Договор не активен',
      });
    }

    // Return auth data
    return {
      data: authData,
    };
  } catch (error: unknown) {
    // Re-throw createError errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    console.error('Client auth error:', error);
    throw createError({
      statusCode: 500,
      message: 'Ошибка авторизации',
    });
  }
});
