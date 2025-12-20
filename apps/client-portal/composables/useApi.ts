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

interface QueryParams {
  filter?: Record<string, unknown>;
  sort?: string[];
  limit?: number;
  offset?: number;
  fields?: string[];
}

function buildQueryString(params?: QueryParams): string {
  if (!params) return '';

  const queryParts: string[] = [];

  if (params.filter && Object.keys(params.filter).length > 0) {
    queryParts.push(`filter=${encodeURIComponent(JSON.stringify(params.filter))}`);
  }
  if (params.sort?.length) {
    queryParts.push(`sort=${params.sort.join(',')}`);
  }
  if (params.limit !== undefined) {
    queryParts.push(`limit=${params.limit}`);
  }
  if (params.offset !== undefined) {
    queryParts.push(`offset=${params.offset}`);
  }
  if (params.fields?.length) {
    queryParts.push(`fields=${params.fields.join(',')}`);
  }

  return queryParts.length > 0 ? '?' + queryParts.join('&') : '';
}

export function useApi() {
  // Use server-side proxy for all API calls
  async function fetchApi<T>(path: string, options: {
    method?: string;
    body?: unknown;
    params?: QueryParams;
  } = {}): Promise<T> {
    const queryString = buildQueryString(options.params);
    const url = `/api/directus/${path}${queryString}`;

    const response = await $fetch<{ data: T }>(url, {
      method: options.method || 'GET',
      body: options.body,
    });

    return response.data;
  }

  return {
    // ============ Services ============
    async getServices(params?: QueryParams) {
      const mergedParams = {
        filter: { is_active: { _eq: true } },
        sort: ['sort_order'],
        ...params
      };
      return fetchApi<Service[]>('Services', { params: mergedParams });
    },

    async getService(id: number) {
      return fetchApi<Service>(`Services/${id}`);
    },

    // ============ Subscriptions ============
    async getSubscriptions(params?: QueryParams) {
      const mergedParams = {
        fields: ['*', 'service_id.*'],
        ...params
      };
      return fetchApi<Subscription[]>('subscriptions', { params: mergedParams });
    },

    // ============ Transactions ============
    async getTransactions(params?: QueryParams) {
      const mergedParams = {
        sort: ['-date_created'],
        ...params
      };
      return fetchApi<Transaction[]>('transactions', { params: mergedParams });
    },

    // ============ Invoices ============
    async getInvoices(params?: QueryParams) {
      const mergedParams = {
        sort: ['-date_created'],
        ...params
      };
      return fetchApi<Invoice[]>('invoices', { params: mergedParams });
    },

    async getInvoice(id: string) {
      return fetchApi<Invoice>(`invoices/${id}`);
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
