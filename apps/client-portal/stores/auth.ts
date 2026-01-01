import { defineStore } from 'pinia';
import type { User, Account } from '@pg19/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  account: Account | null;
}

const STORAGE_KEY = 'pg19_client_auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    account: null,
  }),

  getters: {
    currentBalance: (state): number => {
      // Balance in DB is stored in 1/100 kopeks (10000 per ruble)
      // UI components expect kopeks (100 per ruble)
      // Divide by 100 to convert to kopeks
      return (state.account?.balance || 0) / 100;
    },

    isBlocked: (state): boolean => {
      return state.account?.status === 'blocked';
    },

    contractNumber: (state): number | null => {
      return state.account?.contract_number ?? null;
    },

    contractStatus: (state): string | null => {
      return state.account?.contract_status ?? null;
    },
  },

  actions: {
    setAuth(user: User, account: Account) {
      this.isAuthenticated = true;
      this.user = user;
      this.account = account;
      this.persist();
    },

    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.account = null;
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    persist() {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isAuthenticated: this.isAuthenticated,
          user: this.user,
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
            // Handle legacy data with 'person' field
            this.user = data.user || data.person;
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
