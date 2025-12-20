import { defineStore } from 'pinia';

interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
}

const STORAGE_KEY = 'pg19_admin_auth';

export const useAdminAuthStore = defineStore('adminAuth', {
  state: (): AdminAuthState => ({
    isAuthenticated: false,
    user: null,
    token: null,
  }),

  getters: {
    userName: (state): string => {
      if (!state.user) return '';
      if (state.user.first_name || state.user.last_name) {
        return [state.user.first_name, state.user.last_name].filter(Boolean).join(' ');
      }
      return state.user.email;
    },
  },

  actions: {
    setAuth(user: AdminUser, token: string) {
      this.isAuthenticated = true;
      this.user = user;
      this.token = token;
      this.persist();
    },

    logout() {
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    persist() {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isAuthenticated: this.isAuthenticated,
          user: this.user,
          token: this.token,
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
            this.user = data.user;
            this.token = data.token;
          } catch {
            this.logout();
          }
        }
      }
    },
  },
});
