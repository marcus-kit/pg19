import { createDirectus, rest, authentication } from '@directus/sdk';
import type { DirectusSchema } from '@pg19/types';

export function createApiClient(url: string) {
  return createDirectus<DirectusSchema>(url)
    .with(rest())
    .with(authentication());
}

export type ApiClient = ReturnType<typeof createApiClient>;

export * from './composables';
