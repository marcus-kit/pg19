import { defineStore } from 'pinia';
import type { Person, Contract, Account } from '@pg19/types';

interface AuthState {
  isAuthenticated: boolean;
  person: Person | null;
  contract: Contract | null;
  accounts: Account[];
}

const STORAGE_KEY = 'pg19_client_auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    person: null,
    contract: null,
    accounts: [],
  }),

  getters: {
    primaryAccount: (state): Account | null => {
      return state.accounts[0] || null;
    },

    currentBalance: (state): number => {
      return state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    },

    isBlocked: (state): boolean => {
      return state.accounts.some(acc => acc.status === 'blocked');
    },
  },

  actions: {
    setAuth(person: Person, contract: Contract, accounts: Account[]) {
      this.isAuthenticated = true;
      this.person = person;
      this.contract = contract;
      this.accounts = accounts;
      this.persist();
    },

    logout() {
      this.isAuthenticated = false;
      this.person = null;
      this.contract = null;
      this.accounts = [];
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
          accounts: this.accounts,
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
            this.accounts = data.accounts;
          } catch {
            this.logout();
          }
        }
      }
    },

    updateAccounts(accounts: Account[]) {
      this.accounts = accounts;
      this.persist();
    },
  },
});
