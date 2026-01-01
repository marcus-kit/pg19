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
  News,
  NewsAttachment,
} from '@pg19/types';
import { createSupabaseClient } from '@pg19/api';

// AbortController management for cancellable requests
const abortControllers = new Map<string, AbortController>();

function getAbortSignal(key: string): AbortSignal {
  // Cancel previous request with same key
  const existing = abortControllers.get(key);
  if (existing) {
    existing.abort();
  }

  // Create new controller
  const controller = new AbortController();
  abortControllers.set(key, controller);
  return controller.signal;
}

function clearAbortController(key: string): void {
  abortControllers.delete(key);
}

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
    async getSubscriptions(accountId: number) {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, service:service_id(*)')
        .eq('account_id', accountId)
        .eq('status', 'active');

      if (error) throw new Error(error.message);
      return data || [];
    },

    // ============ Transactions ============
    async getTransactions(
      accountId: number,
      params?: {
        limit?: number;
        offset?: number;
        year?: number;
        type?: string;
        startDate?: string;
        endDate?: string;
      }
    ) {
      const signal = getAbortSignal(`transactions-${accountId}`);

      try {
        let query = supabase
          .from('transactions')
          .select('*', { count: 'exact' })
          .eq('account_id', accountId)
          .abortSignal(signal)
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
        // Server-side filtering by type
        if (params?.type && params.type !== 'all') {
          query = query.eq('type', params.type);
        }
        // Server-side filtering by date range
        if (params?.startDate) {
          query = query.gte('date_created', params.startDate);
        }
        if (params?.endDate) {
          query = query.lte('date_created', params.endDate);
        }

        const { data, error, count } = await query;

        if (error) {
          // Don't throw on abort
          if (error.message?.includes('aborted')) return null;
          throw new Error(error.message);
        }

        clearAbortController(`transactions-${accountId}`);

        return {
          data: data || [],
          meta: {
            total: count || 0,
            limit: params?.limit || 10,
            offset: params?.offset || 0,
          },
        };
      } catch (e) {
        // Handle abort gracefully
        if (e instanceof Error && e.name === 'AbortError') {
          return null;
        }
        throw e;
      }
    },

    async getAccountTransactions(accountId: number, params?: { limit?: number }) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .order('date_created', { ascending: false })
        .limit(params?.limit || 10);

      if (error) throw new Error(error.message);
      return data || [];
    },

    async getLastPayment(accountId: number) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .eq('type', 'payment')
        .gt('amount', 0)
        .order('date_created', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data;
    },

    // ============ Invoices ============
    async getInvoices(
      accountId: number,
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

    async getInvoice(accountId: number, invoiceId: number) {
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
    async getBalance(accountId: number) {
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

    // ============ News ============
    async getNews(userId: number, params?: { limit?: number; offset?: number }) {
      const now = new Date().toISOString();
      const limit = params?.limit || 10;

      // Single query with LEFT JOIN to read status
      // Uses Supabase's ability to join related tables
      let query = supabase
        .from('news')
        .select(`
          *,
          attachments:news_attachments(*),
          read_status:news_read_status!left(news_id)
        `)
        .eq('status', 'published')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .eq('news_read_status.user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);

      if (params?.offset) {
        query = query.range(params.offset, params.offset + limit - 1);
      }

      const { data, error } = await query;
      if (error) {
        // Fallback to old method if the join fails (schema mismatch)
        console.warn('News query with join failed, using fallback:', error.message);
        return this.getNewsFallback(userId, params);
      }

      return (data || []).map(item => ({
        ...item,
        is_read: Array.isArray(item.read_status) && item.read_status.length > 0,
        attachments: item.attachments || [],
        read_status: undefined, // Remove the join field from output
      })) as News[];
    },

    // Fallback method if join doesn't work (backward compatibility)
    async getNewsFallback(userId: number, params?: { limit?: number; offset?: number }) {
      const now = new Date().toISOString();
      const limit = params?.limit || 10;

      let query = supabase
        .from('news')
        .select(`
          *,
          attachments:news_attachments(*)
        `)
        .eq('status', 'published')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);

      if (params?.offset) {
        query = query.range(params.offset, params.offset + limit - 1);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      // Get read status only for fetched news IDs (not all)
      const newsIds = (data || []).map(n => n.id);
      if (newsIds.length === 0) return [];

      const { data: readStatuses } = await supabase
        .from('news_read_status')
        .select('news_id')
        .eq('user_id', userId)
        .in('news_id', newsIds);

      const readNewsIds = new Set((readStatuses || []).map(rs => rs.news_id));

      return (data || []).map(item => ({
        ...item,
        is_read: readNewsIds.has(item.id),
        attachments: item.attachments || [],
      })) as News[];
    },

    async getUnreadNewsCount(userId: number) {
      const now = new Date().toISOString();

      // Optimized: count unread news in single query using left join
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          read_status:news_read_status!left(news_id)
        `)
        .eq('status', 'published')
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .eq('news_read_status.user_id', userId);

      if (error) {
        // Fallback to counting manually
        const { count } = await supabase
          .from('news')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .or(`expires_at.is.null,expires_at.gt.${now}`);

        const { data: readStatuses } = await supabase
          .from('news_read_status')
          .select('news_id')
          .eq('user_id', userId);

        const readCount = readStatuses?.length || 0;
        return Math.max(0, (count || 0) - readCount);
      }

      // Count items where read_status is empty (not read)
      return (data || []).filter(
        n => !Array.isArray(n.read_status) || n.read_status.length === 0
      ).length;
    },

    async markNewsAsRead(newsId: number, userId: number) {
      const { error } = await supabase
        .from('news_read_status')
        .upsert(
          { news_id: newsId, user_id: userId },
          { onConflict: 'news_id,user_id' }
        );

      if (error) throw new Error(error.message);
      return true;
    },

    async getAttachmentUrl(filePath: string) {
      const { data, error } = await supabase.storage
        .from('news-attachments')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw new Error('Не удалось получить ссылку на файл');
      return data.signedUrl;
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

      // Telegram auth - Step 1: Initialize session and get deep link
      async telegramInit(): Promise<{ sessionId: string; deepLink: string; expiresIn: number }> {
        return await $fetch<{ sessionId: string; deepLink: string; expiresIn: number }>(
          `${config.public.supabaseUrl}/functions/v1/telegram-auth-init`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );
      },

      // Telegram auth - Step 2: Check session status
      async telegramCheck(sessionId: string): Promise<{
        status: 'pending' | 'verified' | 'expired';
        data?: AuthData;
        message?: string;
      }> {
        return await $fetch(
          `${config.public.supabaseUrl}/functions/v1/telegram-auth-check`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { sessionId },
          }
        );
      },
    },
  };
}
