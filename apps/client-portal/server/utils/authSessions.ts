/**
 * In-memory storage for authentication sessions
 * Used for phone and email verification flows
 */

export interface PhoneSession {
  phone: string;
  personId: number;
  createdAt: number;
  verified: boolean;
}

export interface EmailSession {
  email: string;
  code: string;
  personId: number;
  createdAt: number;
  attempts: number;
}

export interface TelegramSession {
  status: 'pending' | 'verified';
  createdAt: number;
  telegramId?: string;
  authData?: unknown; // Данные для возврата клиенту после верификации
}

// In-memory storage (will be cleared on server restart)
const phoneSessions = new Map<string, PhoneSession>();
const emailSessions = new Map<string, EmailSession>();
const telegramSessions = new Map<string, TelegramSession>();

// Session expiry times
const PHONE_SESSION_EXPIRY = 3 * 60 * 1000; // 3 minutes
const EMAIL_SESSION_EXPIRY = 5 * 60 * 1000; // 5 minutes
const TELEGRAM_SESSION_EXPIRY = 3 * 60 * 1000; // 3 minutes
const MAX_EMAIL_ATTEMPTS = 5;

// Phone session functions
export function createPhoneSession(
  sessionId: string,
  phone: string,
  personId: number
): void {
  phoneSessions.set(sessionId, {
    phone,
    personId,
    createdAt: Date.now(),
    verified: false,
  });
}

export function getPhoneSession(sessionId: string): PhoneSession | undefined {
  const session = phoneSessions.get(sessionId);
  if (!session) return undefined;

  // Check expiry
  if (Date.now() - session.createdAt > PHONE_SESSION_EXPIRY) {
    phoneSessions.delete(sessionId);
    return undefined;
  }

  return session;
}

export function verifyPhoneSession(sessionId: string): boolean {
  const session = phoneSessions.get(sessionId);
  if (!session) return false;

  session.verified = true;
  return true;
}

export function deletePhoneSession(sessionId: string): void {
  phoneSessions.delete(sessionId);
}

// Email session functions
export function createEmailSession(
  sessionId: string,
  email: string,
  code: string,
  personId: number
): void {
  emailSessions.set(sessionId, {
    email,
    code,
    personId,
    createdAt: Date.now(),
    attempts: 0,
  });
}

export function getEmailSession(sessionId: string): EmailSession | undefined {
  const session = emailSessions.get(sessionId);
  if (!session) return undefined;

  // Check expiry
  if (Date.now() - session.createdAt > EMAIL_SESSION_EXPIRY) {
    emailSessions.delete(sessionId);
    return undefined;
  }

  return session;
}

export function incrementEmailAttempts(sessionId: string): number {
  const session = emailSessions.get(sessionId);
  if (!session) return -1;

  session.attempts += 1;

  // Delete session if max attempts exceeded
  if (session.attempts > MAX_EMAIL_ATTEMPTS) {
    emailSessions.delete(sessionId);
    return -1;
  }

  return session.attempts;
}

export function deleteEmailSession(sessionId: string): void {
  emailSessions.delete(sessionId);
}

// Telegram session functions
export function createTelegramSession(sessionId: string): void {
  telegramSessions.set(sessionId, {
    status: 'pending',
    createdAt: Date.now(),
  });
}

export function getTelegramSession(sessionId: string): TelegramSession | undefined {
  const session = telegramSessions.get(sessionId);
  if (!session) return undefined;

  // Check expiry
  if (Date.now() - session.createdAt > TELEGRAM_SESSION_EXPIRY) {
    telegramSessions.delete(sessionId);
    return undefined;
  }

  return session;
}

export function verifyTelegramSession(
  sessionId: string,
  telegramId: string,
  authData: unknown
): boolean {
  const session = telegramSessions.get(sessionId);
  if (!session) return false;

  // Check expiry
  if (Date.now() - session.createdAt > TELEGRAM_SESSION_EXPIRY) {
    telegramSessions.delete(sessionId);
    return false;
  }

  session.status = 'verified';
  session.telegramId = telegramId;
  session.authData = authData;
  return true;
}

export function deleteTelegramSession(sessionId: string): void {
  telegramSessions.delete(sessionId);
}

// Cleanup function (call periodically)
export function cleanupExpiredSessions(): void {
  const now = Date.now();

  for (const [id, session] of phoneSessions.entries()) {
    if (now - session.createdAt > PHONE_SESSION_EXPIRY) {
      phoneSessions.delete(id);
    }
  }

  for (const [id, session] of emailSessions.entries()) {
    if (now - session.createdAt > EMAIL_SESSION_EXPIRY) {
      emailSessions.delete(id);
    }
  }

  for (const [id, session] of telegramSessions.entries()) {
    if (now - session.createdAt > TELEGRAM_SESSION_EXPIRY) {
      telegramSessions.delete(id);
    }
  }
}

// Generate 6-digit code
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate session ID
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// Constant-time comparison for codes (prevent timing attacks)
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
