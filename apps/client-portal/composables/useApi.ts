import type {
  Person,
  Contract,
  Account,
  Service,
  Subscription,
  Transaction,
  Invoice,
  AuthData,
  PhoneAuthInitResponse,
  PhoneAuthCheckResponse,
  EmailAuthSendResponse,
  TelegramAuthData,
} from '@pg19/types';

export function useApi() {
  return {
    // ============ Services ============
    async getServices() {
      const response = await $fetch<{ data: Service[] }>('/api/data/services');
      return response.data;
    },

    // ============ Subscriptions ============
    async getSubscriptions(accountId: string) {
      const response = await $fetch<{ data: Subscription[] }>(
        '/api/data/subscriptions',
        { params: { accountId } }
      );
      return response.data;
    },

    // ============ Transactions ============
    async getTransactions(
      accountId: string,
      params?: { limit?: number; offset?: number; year?: number }
    ) {
      const response = await $fetch<{
        data: Transaction[];
        meta: { total: number; limit: number; offset: number };
      }>('/api/data/transactions', {
        params: { accountId, ...params },
      });
      return response;
    },

    async getAccountTransactions(accountId: string, params?: { limit?: number }) {
      const response = await $fetch<{
        data: Transaction[];
        meta: { total: number; limit: number; offset: number };
      }>('/api/data/transactions', {
        params: { accountId, limit: params?.limit || 10 },
      });
      return response.data;
    },

    // ============ Invoices ============
    async getInvoices(
      accountId: string,
      params?: { status?: string; limit?: number; offset?: number; year?: number }
    ) {
      const response = await $fetch<{
        data: Invoice[];
        meta: { total: number; limit: number; offset: number };
      }>('/api/data/invoices', {
        params: { accountId, ...params },
      });
      return response;
    },

    async getInvoice(accountId: string, invoiceId: string) {
      // Get single invoice by filtering
      const response = await $fetch<{
        data: Invoice[];
        meta: { total: number; limit: number; offset: number };
      }>('/api/data/invoices', {
        params: { accountId, limit: 1 },
      });
      const invoice = response.data.find((inv) => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('Счёт не найден');
      }
      return invoice;
    },

    // ============ Balance ============
    async getBalance(accountId: string) {
      const response = await $fetch<{
        data: { balance: number; creditLimit: number };
      }>('/api/data/balance', { params: { accountId } });
      return response.data;
    },

    // ============ Auth ============
    auth: {
      // Contract + FIO login
      async login(contractNumber: string, fullName: string) {
        const response = await $fetch<{
          data: {
            person: Person;
            contract: Contract;
            accounts: Account[];
          };
        }>('/api/auth/login', {
          method: 'POST',
          body: { contractNumber, fullName },
        });
        return response.data;
      },

      // Phone auth - Step 1: Initialize
      async phoneInit(phone: string): Promise<PhoneAuthInitResponse> {
        const response = await $fetch<{ data: PhoneAuthInitResponse }>(
          '/api/auth/phone/init',
          {
            method: 'POST',
            body: { phone },
          }
        );
        return response.data;
      },

      // Phone auth - Step 2: Check if call received
      async phoneCheck(sessionId: string): Promise<PhoneAuthCheckResponse> {
        const response = await $fetch<{ data: PhoneAuthCheckResponse }>(
          '/api/auth/phone/check',
          {
            method: 'POST',
            body: { sessionId },
          }
        );
        return response.data;
      },

      // Email auth - Step 1: Send verification code
      async emailSend(email: string): Promise<EmailAuthSendResponse> {
        const response = await $fetch<{ data: EmailAuthSendResponse }>(
          '/api/auth/email/send',
          {
            method: 'POST',
            body: { email },
          }
        );
        return response.data;
      },

      // Email auth - Step 2: Verify code
      async emailVerify(sessionId: string, code: string): Promise<AuthData> {
        const response = await $fetch<{ data: AuthData }>(
          '/api/auth/email/verify',
          {
            method: 'POST',
            body: { sessionId, code },
          }
        );
        return response.data;
      },

      // Telegram auth - Verify widget data
      async telegramVerify(data: TelegramAuthData): Promise<AuthData> {
        const response = await $fetch<{ data: AuthData }>(
          '/api/auth/telegram/verify',
          {
            method: 'POST',
            body: data,
          }
        );
        return response.data;
      },
    },
  };
}
