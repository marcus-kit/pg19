/**
 * Directus API utilities for authentication
 */

import type { RuntimeConfig } from 'nuxt/schema';

export interface Person {
  id: number;
  customer_number: string;
  status: 'active' | 'suspended' | 'terminated';
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  telegram_id: string | null;
  telegram_username: string | null;
}

export interface Contract {
  id: string;
  contract_number: string;
  person_id: number | Person;
  status: 'draft' | 'active' | 'terminated';
  accounts?: Account[];
}

export interface Account {
  id: string;
  account_number: string;
  status: 'active' | 'blocked' | 'closed';
  balance: number;
}

export interface AuthData {
  person: Person;
  contract: Contract;
  accounts: Account[];
}

/**
 * Find a person by phone, email, or telegram_id
 */
export async function findPersonByField(
  field: 'phone' | 'email' | 'telegram_id',
  value: string,
  config: RuntimeConfig
): Promise<Person | null> {
  const directusUrl = (config.public.directusUrl as string).replace(/\/$/, '');
  const token = config.directusApiToken as string;

  if (!token) {
    throw new Error('Directus API token not configured');
  }

  // Build filter
  const filter = {
    [field]: { _eq: value },
    status: { _neq: 'terminated' },
  };

  const params = new URLSearchParams({
    'filter': JSON.stringify(filter),
    'limit': '1',
  });

  const response = await $fetch<{ data: Person[] }>(
    `${directusUrl}/items/Persons?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.data || response.data.length === 0) {
    return null;
  }

  return response.data[0];
}

/**
 * Get full auth data for a person (person, contract, accounts)
 */
export async function getPersonAuthData(
  personId: number,
  config: RuntimeConfig
): Promise<AuthData | null> {
  const directusUrl = (config.public.directusUrl as string).replace(/\/$/, '');
  const token = config.directusApiToken as string;

  if (!token) {
    throw new Error('Directus API token not configured');
  }

  // Get person with contracts and accounts
  const params = new URLSearchParams({
    'fields': '*,contracts.*,contracts.accounts.*',
    'filter': JSON.stringify({
      id: { _eq: personId },
    }),
  });

  const response = await $fetch<{ data: (Person & { contracts: Contract[] })[] }>(
    `${directusUrl}/items/Persons?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.data || response.data.length === 0) {
    return null;
  }

  const person = response.data[0];
  const contracts = person.contracts || [];

  // Find active contract
  const activeContract = contracts.find(c => c.status === 'active');
  if (!activeContract) {
    return null;
  }

  // Get accounts from contract
  const accounts = activeContract.accounts || [];

  // Clean up contract object (remove nested accounts from it)
  const contract: Contract = {
    id: activeContract.id,
    contract_number: activeContract.contract_number,
    person_id: personId,
    status: activeContract.status,
  };

  // Clean up person object (remove contracts from it)
  const cleanPerson: Person = {
    id: person.id,
    customer_number: person.customer_number,
    status: person.status,
    first_name: person.first_name,
    last_name: person.last_name,
    email: person.email,
    phone: person.phone,
    telegram_id: person.telegram_id,
    telegram_username: person.telegram_username,
  };

  return {
    person: cleanPerson,
    contract,
    accounts,
  };
}

/**
 * Normalize phone number to format: 79XXXXXXXXX
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');

  // Handle 8 prefix (Russia)
  if (digits.startsWith('8') && digits.length === 11) {
    digits = '7' + digits.slice(1);
  }

  // Add 7 if starts with 9 and has 10 digits
  if (digits.startsWith('9') && digits.length === 10) {
    digits = '7' + digits;
  }

  return digits;
}
