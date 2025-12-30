// User (Абонент)
export interface User {
  id: number;
  status: UserStatus;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  telegram_id: string | null;
  telegram_username: string | null;
  passport_series: string | null;
  passport_number: string | null;
  reg_city: string | null;
  reg_street: string | null;
  reg_building: string | null;
  reg_apartment: string | null;
  created_at: string;
  date_updated: string;
  contract?: Contract;
}

export type UserStatus = 'active' | 'suspended' | 'terminated';

// Alias for backward compatibility
export type Person = User;

// Contract (Договор)
export interface Contract {
  id: number;
  contract_number: string;        // 100001
  person_id: number | User;
  status: ContractStatus;
  start_date: string | null;
  end_date: string | null;
  address_city: string | null;
  address_street: string | null;
  address_building: string | null;
  address_apartment: string | null;
  address_full: string | null;
  notes: string | null;
  date_created: string;
  date_updated: string;
  account?: Account;
}

export type ContractStatus = 'draft' | 'active' | 'terminated';

// Account (Лицевой счёт)
export interface Account {
  id: number;
  account_number: string;         // 100001-1
  contract_id: number | Contract;
  status: AccountStatus;
  balance: number;                // копейки
  credit_limit: number;           // копейки
  currency: string;               // RUB
  next_charge_date: string | null;
  address_city: string | null;
  address_street: string | null;
  address_building: string | null;
  address_apartment: string | null;
  address_entrance: string | null;
  address_floor: string | null;
  address_intercom: string | null;
  address_full: string | null;
  blocked_at: string | null;
  date_created: string;
  date_updated: string;
  subscriptions?: Subscription[];
  transactions?: Transaction[];
  payments?: Payment[];
  invoices?: Invoice[];
}

export type AccountStatus = 'active' | 'blocked' | 'closed';

// Service (Тариф/Услуга)
export interface Service {
  id: number;
  name: string;
  price_monthly: number;          // рубли
  price_connection: number | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

// Subscription (Подписка на тариф)
export interface Subscription {
  id: number;
  account_id: number;
  service_id: number | Service;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  custom_price: number | null;    // копейки
  date_created: string;
  date_updated: string;
  service?: Service;
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

// Transaction (Транзакция)
export interface Transaction {
  id: number;
  account_id: number;
  type: TransactionType;
  amount: number;                 // копейки (+ пополнение, - списание)
  balance_after: number;          // копейки
  description: string | null;
  subscription_id: number | null;
  payment_id: number | null;
  invoice_id: number | null;
  fiscal_receipt_id: string | null;
  fiscalized_at: string | null;
  date_created: string;
}

export type TransactionType = 'charge' | 'payment' | 'correction' | 'refund' | 'bonus';

// Payment (Платёж)
export interface Payment {
  id: number;
  account_id: number;
  amount: number;                 // копейки
  provider: PaymentProvider;
  external_id: string | null;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  fiscal_receipt_id: string | null;
  fiscalized_at: string | null;
  date_created: string;
  confirmed_at: string | null;
}

export type PaymentProvider = 'yookassa' | 'cloudpayments' | 'sbp' | 'cash' | 'bank_transfer' | 'terminal';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

// Invoice (Счёт)
export interface Invoice {
  id: number;
  invoice_number: string;         // СЧ-2024/00001
  account_id: number;
  status: InvoiceStatus;
  amount: number;                 // копейки
  description: string | null;
  period_start: string | null;
  period_end: string | null;
  issued_at: string | null;
  due_date: string | null;
  paid_at: string | null;
  date_created: string;
  date_updated: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

// Auth types for client portal
export interface ClientAuthState {
  isAuthenticated: boolean;
  user: User | null;
  contract: Contract | null;
  account: Account | null;
}

// Dashboard stats for admin panel
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  activeAccounts: number;
  blockedAccounts: number;
  totalPositiveBalance: number;
}

// Auth data returned on successful authentication
export interface AuthData {
  person: User;  // Keep as 'person' for API compatibility
  contract: Contract;
  account: Account;
}

// Phone auth types
export interface PhoneAuthInitResponse {
  sessionId: string;
  verifyNumber: string;
  expiresIn: number;
}

export interface PhoneAuthCheckResponse {
  verified: boolean;
  auth?: AuthData;
  message?: string;
}

// Email auth types
export interface EmailAuthSendResponse {
  sessionId: string;
  expiresIn: number;
}

// Telegram auth types
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}
