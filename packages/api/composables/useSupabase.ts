import type {
  User,
  Contract,
  Account,
  Service,
  Subscription,
  Transaction,
  Payment,
  Invoice,
  DashboardStats,
} from '@pg19/types';
import type { SupabaseClient } from '../index';

interface QueryParams {
  filter?: Record<string, unknown>;
  sort?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export function useSupabase(client: SupabaseClient) {
  return {
    client,

    // ============ Users ============
    async getUsers(params?: QueryParams) {
      let query = client.from('users').select('*, contracts(*)');

      if (params?.search) {
        query = query.or(`customer_number.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
      }
      if (params?.sort) query = query.order(params.sort);
      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getUser(id: number) {
      const { data, error } = await client
        .from('users')
        .select('*, contracts(*, accounts(*))')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async createUser(data: Partial<User>) {
      const { data: result, error } = await client
        .from('users')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async updateUser(id: number, data: Partial<User>) {
      const { data: result, error } = await client
        .from('users')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async deleteUser(id: number) {
      const { error } = await client.from('users').delete().eq('id', id);
      if (error) throw error;
    },

    async searchUsers(query: string) {
      const { data, error } = await client
        .from('users')
        .select('*, contracts(contract_number, id)')
        .or(`customer_number.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20);
      if (error) throw error;
      return data;
    },

    // ============ Contracts ============
    async getContracts(params?: QueryParams) {
      let query = client.from('contracts').select('*, person_id(*), accounts(*)');

      if (params?.sort) query = query.order(params.sort);
      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getContract(id: number) {
      const { data, error } = await client
        .from('contracts')
        .select('*, person_id(*), accounts(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async getContractByNumber(contractNumber: string) {
      const { data, error } = await client
        .from('contracts')
        .select('*, person_id(*), accounts(*)')
        .eq('contract_number', contractNumber)
        .eq('status', 'active')
        .limit(1)
        .single();
      if (error) return null;
      return data;
    },

    async createContract(data: Partial<Contract>) {
      const { data: result, error } = await client
        .from('contracts')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async updateContract(id: number, data: Partial<Contract>) {
      const { data: result, error } = await client
        .from('contracts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    // ============ Accounts ============
    async getAccounts(params?: QueryParams) {
      let query = client.from('accounts').select('*, contract_id(*, person_id(*))');

      if (params?.sort) query = query.order(params.sort);
      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getAccount(id: number) {
      const { data, error } = await client
        .from('accounts')
        .select('*, contract_id(*, person_id(*)), subscriptions(*, service_id(*)), transactions(*), payments(*), invoices(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async updateAccount(id: number, data: Partial<Account>) {
      const { data: result, error } = await client
        .from('accounts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async getAccountTransactions(accountId: number, params?: QueryParams) {
      let query = client
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .order('date_created', { ascending: false });

      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getAccountPayments(accountId: number, params?: QueryParams) {
      let query = client
        .from('payments')
        .select('*')
        .eq('account_id', accountId)
        .order('date_created', { ascending: false });

      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getAccountInvoices(accountId: number, params?: QueryParams) {
      let query = client
        .from('invoices')
        .select('*')
        .eq('account_id', accountId)
        .order('date_created', { ascending: false });

      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    // ============ Services ============
    async getServices(params?: QueryParams) {
      let query = client
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (params?.limit) query = query.limit(params.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getService(id: number) {
      const { data, error } = await client
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async createService(data: Partial<Service>) {
      const { data: result, error } = await client
        .from('services')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async updateService(id: number, data: Partial<Service>) {
      const { data: result, error } = await client
        .from('services')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    // ============ Subscriptions ============
    async getSubscriptions(params?: QueryParams) {
      let query = client.from('subscriptions').select('*, service_id(*)');

      if (params?.sort) query = query.order(params.sort);
      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async createSubscription(data: Partial<Subscription>) {
      const { data: result, error } = await client
        .from('subscriptions')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async updateSubscription(id: number, data: Partial<Subscription>) {
      const { data: result, error } = await client
        .from('subscriptions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    // ============ Transactions ============
    async getTransactions(params?: QueryParams) {
      let query = client
        .from('transactions')
        .select('*')
        .order('date_created', { ascending: false });

      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async createTransaction(data: Partial<Transaction>) {
      const { data: result, error } = await client
        .from('transactions')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    // ============ Payments ============
    async getPayments(params?: QueryParams) {
      let query = client
        .from('payments')
        .select('*')
        .order('date_created', { ascending: false });

      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async createPayment(data: Partial<Payment>) {
      const { data: result, error } = await client
        .from('payments')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async getPayment(id: number) {
      const { data, error } = await client
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    // ============ Invoices ============
    async getInvoices(params?: QueryParams) {
      let query = client
        .from('invoices')
        .select('*')
        .order('date_created', { ascending: false });

      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) query = query.range(params.offset, params.offset + (params.limit || 10) - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getInvoice(id: number) {
      const { data, error } = await client
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async createInvoice(data: Partial<Invoice>) {
      const { data: result, error } = await client
        .from('invoices')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    async updateInvoice(id: number, data: Partial<Invoice>) {
      const { data: result, error } = await client
        .from('invoices')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },

    // ============ Dashboard Stats ============
    async getDashboardStats(): Promise<DashboardStats> {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: activeAccounts },
        { count: blockedAccounts },
        { data: positiveBalances },
      ] = await Promise.all([
        client.from('users').select('*', { count: 'exact', head: true }),
        client.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        client.from('accounts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        client.from('accounts').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
        client.from('accounts').select('balance').gt('balance', 0),
      ]);

      const totalPositiveBalance = positiveBalances?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        activeAccounts: activeAccounts || 0,
        blockedAccounts: blockedAccounts || 0,
        totalPositiveBalance,
      };
    },
  };
}
