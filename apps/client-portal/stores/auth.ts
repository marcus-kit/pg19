import { defineStore } from 'pinia';
import type { Person, Contract, Account } from '@pg19/types';

interface AuthState {
  isAuthenticated: boolean;
  person: Person | null;
  contract: Contract | null;
  account: Account | null;
}

const STORAGE_KEY = 'pg19_client_auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    person: null,
    contract: null,
    account: null,
  }),

  getters: {
    currentBalance: (state): number => {
      return state.account?.balance || 0;
    },

    isBlocked: (state): boolean => {
      return state.account?.status === 'blocked';
    },
  },

  actions: {
    setAuth(person: Person, contract: Contract, account: Account) {
      this.isAuthenticated = true;
      this.person = person;
      this.contract = contract;
      this.account = account;
      this.persist();
    },

    logout() {
      this.isAuthenticated = false;
      this.person = null;
      this.contract = null;
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
          contract: this.contract,
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
            this.contract = data.contract;
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
