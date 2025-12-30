import type {
  Person,
  Contract,
  Account,
  AuthData,
  PhoneAuthInitResponse,
  PhoneAuthCheckResponse,
  EmailAuthSendResponse,
  TelegramAuthData,
} from '@pg19/types';
import type { SupabaseClient } from '../index';

export function useClientAuth(supabaseUrl: string) {
  const functionsUrl = `${supabaseUrl}/functions/v1`;

  return {
    // 1. Contract + Name authentication
    async loginWithContract(
      contractNumber: string,
      firstName: string,
      lastName: string
    ): Promise<AuthData> {
      const response = await fetch(`${functionsUrl}/contract-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractNumber, firstName, lastName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Authentication failed');
      }

      return response.json();
    },

    // 2. Phone authentication - init
    async initPhoneAuth(phone: string): Promise<PhoneAuthInitResponse> {
      const response = await fetch(`${functionsUrl}/phone-auth-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate phone auth');
      }

      return response.json();
    },

    // 2. Phone authentication - verify
    async verifyPhoneAuth(sessionId: string): Promise<PhoneAuthCheckResponse> {
      const response = await fetch(`${functionsUrl}/phone-auth-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify phone auth');
      }

      return response.json();
    },

    // 3. Email authentication - send code
    async sendEmailCode(email: string): Promise<EmailAuthSendResponse> {
      const response = await fetch(`${functionsUrl}/email-auth-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email code');
      }

      return response.json();
    },

    // 3. Email authentication - verify code
    async verifyEmailCode(sessionId: string, code: string): Promise<AuthData> {
      const response = await fetch(`${functionsUrl}/email-auth-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid code');
      }

      return response.json();
    },

    // 4. Telegram authentication
    async loginWithTelegram(authData: TelegramAuthData): Promise<AuthData> {
      const response = await fetch(`${functionsUrl}/telegram-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Telegram authentication failed');
      }

      return response.json();
    },
  };
}
