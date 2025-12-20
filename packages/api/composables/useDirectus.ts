import {
  readItems,
  readItem,
  createItem,
  updateItem,
  deleteItem,
  aggregate
} from '@directus/sdk';
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
import type { ApiClient } from '../index';

interface QueryParams {
  filter?: Record<string, unknown>;
  sort?: string[];
  limit?: number;
  offset?: number;
  fields?: string[];
  search?: string;
}

export function useDirectus(client: ApiClient) {
  return {
    client,

    // ============ Persons ============
    async getPersons(params?: QueryParams) {
      return client.request(readItems('Persons', params as any));
    },

    async getPerson(id: number) {
      return client.request(readItem('Persons', id, {
        fields: ['*', { contracts: ['*', { accounts: ['*'] }] }]
      } as any));
    },

    async createPerson(data: Partial<Person>) {
      return client.request(createItem('Persons', data as any));
    },

    async updatePerson(id: number, data: Partial<Person>) {
      return client.request(updateItem('Persons', id, data as any));
    },

    async deletePerson(id: number) {
      return client.request(deleteItem('Persons', id));
    },

    async searchPersons(query: string) {
      return client.request(readItems('Persons', {
        search: query,
        limit: 20,
        fields: ['*', { contracts: ['contract_number', 'id'] }]
      } as any));
    },

    // ============ Contracts ============
    async getContracts(params?: QueryParams) {
      return client.request(readItems('contracts', params as any));
    },

    async getContract(id: string) {
      return client.request(readItem('contracts', id, {
        fields: ['*', { person_id: ['*'], accounts: ['*'] }]
      } as any));
    },

    async getContractByNumber(contractNumber: string) {
      const result = await client.request(readItems('contracts', {
        filter: {
          contract_number: { _eq: contractNumber },
          status: { _eq: 'active' }
        },
        fields: ['*', { person_id: ['*'], accounts: ['*'] }],
        limit: 1
      } as any));
      return result[0] || null;
    },

    async createContract(data: Partial<Contract>) {
      return client.request(createItem('contracts', data as any));
    },

    async updateContract(id: string, data: Partial<Contract>) {
      return client.request(updateItem('contracts', id, data as any));
    },

    // ============ Accounts ============
    async getAccounts(params?: QueryParams) {
      return client.request(readItems('accounts', params as any));
    },

    async getAccount(id: string) {
      return client.request(readItem('accounts', id, {
        fields: [
          '*',
          { contract_id: ['*', { person_id: ['*'] }] },
          { subscriptions: ['*', { service_id: ['*'] }] },
          { transactions: ['*'] },
          { payments: ['*'] },
          { invoices: ['*'] }
        ]
      } as any));
    },

    async updateAccount(id: string, data: Partial<Account>) {
      return client.request(updateItem('accounts', id, data as any));
    },

    async getAccountTransactions(accountId: string, params?: QueryParams) {
      return client.request(readItems('transactions', {
        filter: { account_id: { _eq: accountId } },
        sort: ['-date_created'],
        ...params
      } as any));
    },

    async getAccountPayments(accountId: string, params?: QueryParams) {
      return client.request(readItems('payments', {
        filter: { account_id: { _eq: accountId } },
        sort: ['-date_created'],
        ...params
      } as any));
    },

    async getAccountInvoices(accountId: string, params?: QueryParams) {
      return client.request(readItems('invoices', {
        filter: { account_id: { _eq: accountId } },
        sort: ['-date_created'],
        ...params
      } as any));
    },

    // ============ Services ============
    async getServices(params?: QueryParams) {
      return client.request(readItems('Services', {
        filter: { is_active: { _eq: true } },
        sort: ['sort_order'],
        ...params
      } as any));
    },

    async getService(id: number) {
      return client.request(readItem('Services', id));
    },

    async createService(data: Partial<Service>) {
      return client.request(createItem('Services', data as any));
    },

    async updateService(id: number, data: Partial<Service>) {
      return client.request(updateItem('Services', id, data as any));
    },

    // ============ Subscriptions ============
    async getSubscriptions(params?: QueryParams) {
      return client.request(readItems('subscriptions', {
        fields: ['*', { service_id: ['*'] }],
        ...params
      } as any));
    },

    async createSubscription(data: Partial<Subscription>) {
      return client.request(createItem('subscriptions', data as any));
    },

    async updateSubscription(id: number, data: Partial<Subscription>) {
      return client.request(updateItem('subscriptions', id, data as any));
    },

    // ============ Transactions ============
    async getTransactions(params?: QueryParams) {
      return client.request(readItems('transactions', {
        sort: ['-date_created'],
        ...params
      } as any));
    },

    async createTransaction(data: Partial<Transaction>) {
      return client.request(createItem('transactions', data as any));
    },

    // ============ Payments ============
    async getPayments(params?: QueryParams) {
      return client.request(readItems('payments', {
        sort: ['-date_created'],
        ...params
      } as any));
    },

    async createPayment(data: Partial<Payment>) {
      return client.request(createItem('payments', data as any));
    },

    async getPayment(id: number) {
      return client.request(readItem('payments', id));
    },

    // ============ Invoices ============
    async getInvoices(params?: QueryParams) {
      return client.request(readItems('invoices', {
        sort: ['-date_created'],
        ...params
      } as any));
    },

    async getInvoice(id: string) {
      return client.request(readItem('invoices', id));
    },

    async createInvoice(data: Partial<Invoice>) {
      return client.request(createItem('invoices', data as any));
    },

    async updateInvoice(id: string, data: Partial<Invoice>) {
      return client.request(updateItem('invoices', id, data as any));
    },

    // ============ Dashboard Stats ============
    async getDashboardStats(): Promise<DashboardStats> {
      const [totalPersons, activePersons, activeAccounts, blockedAccounts, balanceResult] = await Promise.all([
        client.request(aggregate('Persons', { aggregate: { count: '*' } })),
        client.request(aggregate('Persons', {
          aggregate: { count: '*' },
          query: { filter: { status: { _eq: 'active' } } }
        } as any)),
        client.request(aggregate('accounts', {
          aggregate: { count: '*' },
          query: { filter: { status: { _eq: 'active' } } }
        } as any)),
        client.request(aggregate('accounts', {
          aggregate: { count: '*' },
          query: { filter: { status: { _eq: 'blocked' } } }
        } as any)),
        client.request(aggregate('accounts', {
          aggregate: { sum: ['balance'] },
          query: { filter: { balance: { _gt: 0 } } }
        } as any))
      ]);

      return {
        totalPersons: Number((totalPersons[0] as any)?.count) || 0,
        activePersons: Number((activePersons[0] as any)?.count) || 0,
        activeAccounts: Number((activeAccounts[0] as any)?.count) || 0,
        blockedAccounts: Number((blockedAccounts[0] as any)?.count) || 0,
        totalPositiveBalance: Number((balanceResult[0] as any)?.sum?.balance) || 0
      };
    }
  };
}
