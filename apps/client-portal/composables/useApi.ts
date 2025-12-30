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
import { createSupabaseClient } from '@pg19/api';

export function useApi() {
  const config = useRuntimeConfig();
  const supabase = createSupabaseClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  );

  return {
    // ============ Services ============
    async getServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw new Error(error.message);
      return data || [];
    },

    // ============ Subscriptions ============
    async getSubscriptions(accountId: string) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, service_id(*)')
        .eq('account_id', accountId)
        .eq('status', 'active');

      if (error) throw new Error(error.message);
      return data || [];
    },

    // ============ Transactions ============
    async getTransactions(
      accountId: string,
      params?: { limit?: number; offset?: number; year?: number }
    ) {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('account_id', accountId)
        .order('date_created', { ascending: false });

      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }
      if (params?.year) {
        query = query
          .gte('date_created', `${params.year}-01-01`)
          .lt('date_created', `${params.year + 1}-01-01`);
      }

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);

      return {
        data: data || [],
        meta: {
          total: count || 0,
          limit: params?.limit || 10,
          offset: params?.offset || 0,
        },
      };
    },

    async getAccountTransactions(accountId: string, params?: { limit?: number }) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .order('date_created', { ascending: false })
        .limit(params?.limit || 10);

      if (error) throw new Error(error.message);
      return data || [];
    },

    // ============ Invoices ============
    async getInvoices(
      accountId: string,
      params?: { status?: string; limit?: number; offset?: number; year?: number }
    ) {
      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .eq('account_id', accountId)
        .order('date_created', { ascending: false });

      if (params?.status) query = query.eq('status', params.status);
      if (params?.limit) query = query.limit(params.limit);
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }
      if (params?.year) {
        query = query
          .gte('date_created', `${params.year}-01-01`)
          .lt('date_created', `${params.year + 1}-01-01`);
      }

      const { data, error, count } = await query;
      if (error) throw new Error(error.message);

      return {
        data: data || [],
        meta: {
          total: count || 0,
          limit: params?.limit || 10,
          offset: params?.offset || 0,
        },
      };
    },

    async getInvoice(accountId: string, invoiceId: string) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('account_id', accountId)
        .eq('id', invoiceId)
        .single();

      if (error) throw new Error('Счёт не найден');
      return data;
    },

    // ============ Balance ============
    async getBalance(accountId: string) {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance, credit_limit')
        .eq('id', accountId)
        .single();

      if (error) throw new Error(error.message);
      return {
        balance: data.balance || 0,
        creditLimit: data.credit_limit || 0,
      };
    },

    // ============ Auth ============
    auth: {
      // Contract + FIO login
      async login(contractNumber: string, fullName: string) {
        const [lastName, firstName] = fullName.trim().split(/\s+/);

        const response = await $fetch<AuthData>(
          `${config.public.supabaseUrl}/functions/v1/contract-auth`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { contractNumber, firstName, lastName },
          }
        );

        return response;
      },

      // Phone auth - Step 1: Initialize
      async phoneInit(phone: string): Promise<PhoneAuthInitResponse> {
        return await $fetch<PhoneAuthInitResponse>(
          `${config.public.supabaseUrl}/functions/v1/phone-auth-init`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { phone },
          }
        );
      },

      // Phone auth - Step 2: Check if call received
      async phoneCheck(sessionId: string): Promise<PhoneAuthCheckResponse> {
        return await $fetch<PhoneAuthCheckResponse>(
          `${config.public.supabaseUrl}/functions/v1/phone-auth-verify`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { sessionId },
          }
        );
      },

      // Email auth - Step 1: Send verification code
      async emailSend(email: string): Promise<EmailAuthSendResponse> {
        return await $fetch<EmailAuthSendResponse>(
          `${config.public.supabaseUrl}/functions/v1/email-auth-send`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email },
          }
        );
      },

      // Email auth - Step 2: Verify code
      async emailVerify(sessionId: string, code: string): Promise<AuthData> {
        return await $fetch<AuthData>(
          `${config.public.supabaseUrl}/functions/v1/email-auth-verify`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { sessionId, code },
          }
        );
      },

      // Telegram auth - Verify widget data
      async telegramVerify(data: TelegramAuthData): Promise<AuthData> {
        return await $fetch<AuthData>(
          `${config.public.supabaseUrl}/functions/v1/telegram-auth`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
          }
        );
      },
    },
  };
}
