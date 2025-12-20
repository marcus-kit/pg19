import type {
  Person,
  Contract,
  Account,
  Service,
  Subscription,
  Transaction,
  Payment,
  Invoice,
  DashboardStats
} from '@pg19/types';

interface QueryParams {
  filter?: Record<string, unknown>;
  sort?: string[];
  limit?: number;
  offset?: number;
  fields?: string[];
  search?: string;
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
  if (params.search) {
    queryParts.push(`search=${encodeURIComponent(params.search)}`);
  }

  return queryParts.length > 0 ? '?' + queryParts.join('&') : '';
}

export function useApi() {
  // Use server-side proxy for all API calls to avoid CORS issues
  async function fetchApi<T>(path: string, options: {
    method?: string;
    body?: any;
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
    // ============ Persons ============
    async getPersons(params?: QueryParams) {
      return fetchApi<Person[]>('Persons', { params });
    },

    async getPerson(id: number) {
      return fetchApi<Person>(`Persons/${id}`, {
        params: {
          fields: ['*', 'contracts.*', 'contracts.accounts.*']
        }
      });
    },

    async createPerson(data: Partial<Person>) {
      return fetchApi<Person>('Persons', {
        method: 'POST',
        body: data
      });
    },

    async updatePerson(id: number, data: Partial<Person>) {
      return fetchApi<Person>(`Persons/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    async deletePerson(id: number) {
      return fetchApi<void>(`Persons/${id}`, {
        method: 'DELETE'
      });
    },

    async searchPersons(query: string) {
      return fetchApi<Person[]>('Persons', {
        params: {
          search: query,
          limit: 20,
          fields: ['*', 'contracts.contract_number', 'contracts.id']
        }
      });
    },

    // ============ Contracts ============
    async getContracts(params?: QueryParams) {
      return fetchApi<Contract[]>('contracts', { params });
    },

    async getContract(id: string) {
      return fetchApi<Contract>(`contracts/${id}`, {
        params: {
          fields: ['*', 'person_id.*', 'accounts.*']
        }
      });
    },

    // ============ Accounts ============
    async getAccounts(params?: QueryParams) {
      return fetchApi<Account[]>('accounts', { params });
    },

    async getAccount(id: string) {
      return fetchApi<Account>(`accounts/${id}`, {
        params: {
          fields: ['*', 'contract_id.*', 'contract_id.person_id.*', 'subscriptions.*', 'subscriptions.service_id.*', 'transactions.*', 'payments.*', 'invoices.*']
        }
      });
    },

    async updateAccount(id: string, data: Partial<Account>) {
      return fetchApi<Account>(`accounts/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // ============ Services ============
    async getServices(params?: QueryParams) {
      const mergedParams = {
        sort: ['sort_order'],
        ...params
      };
      return fetchApi<Service[]>('Services', { params: mergedParams });
    },

    async getService(id: number) {
      return fetchApi<Service>(`Services/${id}`);
    },

    async createService(data: Partial<Service>) {
      return fetchApi<Service>('Services', {
        method: 'POST',
        body: data
      });
    },

    async updateService(id: number, data: Partial<Service>) {
      return fetchApi<Service>(`Services/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // ============ Subscriptions ============
    async getSubscriptions(params?: QueryParams) {
      const mergedParams = {
        fields: ['*', 'service_id.*'],
        ...params
      };
      return fetchApi<Subscription[]>('subscriptions', { params: mergedParams });
    },

    async createSubscription(data: Partial<Subscription>) {
      return fetchApi<Subscription>('subscriptions', {
        method: 'POST',
        body: data
      });
    },

    async updateSubscription(id: number, data: Partial<Subscription>) {
      return fetchApi<Subscription>(`subscriptions/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // ============ Transactions ============
    async getTransactions(params?: QueryParams) {
      const mergedParams = {
        sort: ['-date_created'],
        ...params
      };
      return fetchApi<Transaction[]>('transactions', { params: mergedParams });
    },

    async createTransaction(data: Partial<Transaction>) {
      return fetchApi<Transaction>('transactions', {
        method: 'POST',
        body: data
      });
    },

    // ============ Payments ============
    async getPayments(params?: QueryParams) {
      const mergedParams = {
        sort: ['-date_created'],
        ...params
      };
      return fetchApi<Payment[]>('payments', { params: mergedParams });
    },

    async createPayment(data: Partial<Payment>) {
      return fetchApi<Payment>('payments', {
        method: 'POST',
        body: data
      });
    },

    async getPayment(id: number) {
      return fetchApi<Payment>(`payments/${id}`);
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

    async createInvoice(data: Partial<Invoice>) {
      return fetchApi<Invoice>('invoices', {
        method: 'POST',
        body: data
      });
    },

    async updateInvoice(id: string, data: Partial<Invoice>) {
      return fetchApi<Invoice>(`invoices/${id}`, {
        method: 'PATCH',
        body: data
      });
    },

    // ============ Dashboard Stats ============
    async getDashboardStats(): Promise<DashboardStats> {
      // Use dedicated endpoint for aggregations
      const response = await $fetch<{ data: DashboardStats }>('/api/stats/dashboard');
      return response.data;
    },

    // ============ Auth (uses existing endpoints) ============
    async login(email: string, password: string) {
      const response = await $fetch<{ data: { access_token: string; refresh_token: string } }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      return response.data;
    },

    async logout() {
      // Client-side only
    },

    async getCurrentUser(token?: string) {
      const response = await $fetch<{ data: { id: string; email: string; first_name?: string; last_name?: string } }>('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    },
  };
}
