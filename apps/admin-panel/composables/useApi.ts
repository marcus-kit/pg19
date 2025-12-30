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
import { createSupabaseClient, useSupabase } from '@pg19/api';

interface QueryParams {
  filter?: Record<string, unknown>;
  sort?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export function useApi() {
  const config = useRuntimeConfig();
  const supabase = createSupabaseClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  );
  const api = useSupabase(supabase);

  return api;
}
