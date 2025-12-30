import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false, // We manage sessions ourselves
    },
  });
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;

export * from './composables';
