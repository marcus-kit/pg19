import { readItems } from '@directus/sdk';
import type { Person, Contract, Account, ClientAuthState } from '@pg19/types';
import type { ApiClient } from '../index';

export function useClientAuth(client: ApiClient) {
  const state: ClientAuthState = {
    isAuthenticated: false,
    person: null,
    contract: null,
    accounts: []
  };

  return {
    state,

    async login(contractNumber: string, lastName: string, firstName: string): Promise<ClientAuthState> {
      // Поиск договора по номеру
      const contracts = await client.request(readItems('contracts', {
        filter: {
          contract_number: { _eq: contractNumber },
          status: { _eq: 'active' }
        },
        fields: ['*', { person_id: ['*'], accounts: ['*'] }],
        limit: 1
      } as any));

      if (!contracts || contracts.length === 0) {
        throw new Error('Договор не найден');
      }

      const contract = contracts[0] as unknown as Contract & { person_id: Person; accounts: Account[] };
      const person = contract.person_id as Person;

      if (!person) {
        throw new Error('Абонент не найден');
      }

      // Проверка ФИО (регистронезависимо)
      const normalizedLastName = lastName.trim().toLowerCase();
      const normalizedFirstName = firstName.trim().toLowerCase();
      const personLastName = (person.last_name || '').toLowerCase();
      const personFirstName = (person.first_name || '').toLowerCase();

      if (personLastName !== normalizedLastName || personFirstName !== normalizedFirstName) {
        throw new Error('ФИО не совпадает с данными договора');
      }

      // Проверка статуса абонента
      if (person.status === 'terminated') {
        throw new Error('Договор расторгнут');
      }

      state.isAuthenticated = true;
      state.person = person;
      state.contract = contract;
      state.accounts = contract.accounts || [];

      return state;
    },

    logout() {
      state.isAuthenticated = false;
      state.person = null;
      state.contract = null;
      state.accounts = [];
    },

    isAuthenticated(): boolean {
      return state.isAuthenticated;
    },

    getState(): ClientAuthState {
      return state;
    }
  };
}
