import { defineStore } from 'pinia';
import type { Person, Account } from '@pg19/types';

interface AuthState {
  isAuthenticated: boolean;
  person: Person | null;
  account: Account | null;
}

const STORAGE_KEY = 'pg19_client_auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    person: null,
    account: null,
  }),

  getters: {
    currentBalance: (state): number => {
      return state.account?.balance || 0;
    },

    isBlocked: (state): boolean => {
      return state.account?.status === 'blocked';
    },

    // Contract data is now in account
    contractNumber: (state): number | null => {
      return state.account?.contract_number ?? null;
    },

    contractStatus: (state): string | null => {
      return state.account?.contract_status ?? null;
    },

    // Backward compatibility: contract getter returns account with contract fields
    contract: (state) => {
      if (!state.account) return null;
      return {
        id: state.account.id,
        contract_number: state.account.contract_number,
        status: state.account.contract_status,
        start_date: state.account.start_date,
        end_date: state.account.end_date,
        address_city: state.account.address_city,
        address_street: state.account.address_street,
        address_building: state.account.address_building,
        address_apartment: state.account.address_apartment,
        address_full: state.account.address_full,
        notes: state.account.notes,
      };
    },
  },

  actions: {
    setAuth(person: Person, account: Account) {
      this.isAuthenticated = true;
      this.person = person;
      this.account = account;
      this.persist();
    },

    // Backward compatible version
    setAuthLegacy(person: Person, _contract: unknown, account: Account) {
      this.setAuth(person, account);
    },

    logout() {
      this.isAuthenticated = false;
      this.person = null;
      this.account = null;
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    persist() {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isAuthenticated: this.isAuthenticated,
          person: this.person,
          account: this.account,
        }));
      }
    },

    hydrate() {
      if (import.meta.client) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            this.isAuthenticated = data.isAuthenticated;
            this.person = data.person;
            // Handle legacy data with separate contract field
            this.account = data.account;
          } catch {
            this.logout();
          }
        }
      }
    },

    updateAccount(account: Account) {
      this.account = account;
      this.persist();
    },
  },
});
