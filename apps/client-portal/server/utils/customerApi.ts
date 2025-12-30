/**
 * Customer API client via RabbitMQ
 *
 * All customer data operations go through customer-api-worker.
 * This abstracts the data source from the client portal.
 */

import type { RuntimeConfig } from 'nuxt/schema';
import type {
  Person,
  Contract,
  Account,
  Service,
  Subscription,
  Transaction,
  Invoice,
  AuthData,
} from '@pg19/types';

// ===== API RESPONSE TYPES =====

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface PaginatedData<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ===== WORKER RESPONSE TYPES (camelCase from worker) =====

interface WorkerPerson {
  id: number;
  customerNumber: string;
  status: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  telegramId?: string;
  telegramUsername?: string;
}

interface WorkerContract {
  id: string;
  contractNumber: string;
  status: string;
  startDate?: string;
  endDate?: string;
  address: string;
}

interface WorkerAccount {
  id: string;
  accountNumber: string;
  contractId: string;
  status: string;
  balance: string; // "1250,00"
  creditLimit: string;
  address: string;
  nextChargeDate?: string;
}

interface WorkerCustomerData {
  person: WorkerPerson;
  contracts: WorkerContract[];
  accounts: WorkerAccount[];
}

interface WorkerService {
  id: number;
  name: string;
  description?: string;
  price: string;
  speed?: string;
  features?: string[];
}

interface WorkerSubscription {
  id: string;
  accountId: string;
  service: WorkerService;
  status: string;
  startDate: string;
  nextChargeDate?: string;
  nextChargeAmount?: string;
}

interface WorkerTransaction {
  id: string;
  accountId: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
}

interface WorkerInvoice {
  id: string;
  accountId: string;
  invoiceNumber: string;
  status: string;
  amount: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidAt?: string;
}

// ===== MAPPERS (Worker format -> @pg19/types format) =====

/**
 * Parse money string "1250,00" to kopeks (integer)
 */
function parseMoneyToKopeks(money: string): number {
  if (!money) return 0;
  // "1250,00" -> 125000 kopeks
  // "-500,00" -> -50000 kopeks
  const normalized = money.replace(',', '.').replace(/\s/g, '');
  return Math.round(parseFloat(normalized) * 100);
}

function mapPerson(worker: WorkerPerson): Person {
  return {
    id: worker.id,
    customer_number: worker.customerNumber,
    status: worker.status as Person['status'],
    first_name: worker.firstName,
    last_name: worker.lastName,
    email: worker.email || null,
    phone: worker.phone || null,
    telegram_id: worker.telegramId || null,
    telegram_username: worker.telegramUsername || null,
    passport_series: null,
    passport_number: null,
    reg_city: null,
    reg_street: null,
    reg_building: null,
    reg_apartment: null,
    created_at: new Date().toISOString(),
    date_updated: new Date().toISOString(),
  };
}

function mapContract(worker: WorkerContract, personId: number): Contract {
  // Parse address into parts (simple split by comma)
  const addressParts = worker.address ? worker.address.split(',').map(s => s.trim()) : [];

  return {
    id: worker.id,
    contract_number: worker.contractNumber,
    person_id: personId,
    status: worker.status as Contract['status'],
    start_date: worker.startDate || null,
    end_date: worker.endDate || null,
    address_city: addressParts[0] || null,
    address_street: addressParts[1] || null,
    address_building: addressParts[2] || null,
    address_apartment: addressParts[3] || null,
    address_full: worker.address || null,
    notes: null,
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString(),
  };
}

function mapAccount(worker: WorkerAccount): Account {
  const addressParts = worker.address ? worker.address.split(',').map(s => s.trim()) : [];

  return {
    id: worker.id,
    account_number: worker.accountNumber,
    contract_id: worker.contractId,
    status: worker.status as Account['status'],
    balance: parseMoneyToKopeks(worker.balance),
    credit_limit: parseMoneyToKopeks(worker.creditLimit),
    currency: 'RUB',
    next_charge_date: worker.nextChargeDate || null,
    address_city: addressParts[0] || null,
    address_street: addressParts[1] || null,
    address_building: addressParts[2] || null,
    address_apartment: addressParts[3] || null,
    address_entrance: null,
    address_floor: null,
    address_intercom: null,
    address_full: worker.address || null,
    blocked_at: null,
    coverage_id: null,
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString(),
  };
}

function mapService(worker: WorkerService): Service {
  return {
    id: worker.id,
    name: worker.name,
    price_monthly: parseMoneyToKopeks(worker.price) / 100, // service uses rubles
    price_connection: null,
    description: worker.description || null,
    sort_order: 0,
    is_active: true,
  };
}

function mapSubscription(worker: WorkerSubscription): Subscription {
  return {
    id: parseInt(worker.id) || 0,
    account_id: worker.accountId,
    service_id: worker.service?.id || 0,
    status: worker.status as Subscription['status'],
    started_at: worker.startDate,
    expires_at: null,
    custom_price: worker.nextChargeAmount ? parseMoneyToKopeks(worker.nextChargeAmount) : null,
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString(),
    service: worker.service ? mapService(worker.service) : undefined,
  };
}

function mapTransaction(worker: WorkerTransaction): Transaction {
  return {
    id: parseInt(worker.id) || 0,
    account_id: worker.accountId,
    type: worker.type as Transaction['type'],
    amount: parseMoneyToKopeks(worker.amount),
    balance_after: 0,
    description: worker.description || null,
    subscription_id: null,
    payment_id: null,
    invoice_id: null,
    fiscal_receipt_id: null,
    fiscalized_at: null,
    date_created: worker.createdAt,
  };
}

function mapInvoice(worker: WorkerInvoice): Invoice {
  return {
    id: worker.id,
    invoice_number: worker.invoiceNumber,
    account_id: worker.accountId,
    status: worker.status as Invoice['status'],
    amount: parseMoneyToKopeks(worker.amount),
    description: null,
    period_start: worker.periodStart || null,
    period_end: worker.periodEnd || null,
    issued_at: null,
    due_date: worker.dueDate || null,
    paid_at: worker.paidAt || null,
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString(),
  };
}

function mapCustomerToAuthData(worker: WorkerCustomerData): AuthData {
  const person = mapPerson(worker.person);
  const contracts = worker.contracts.map(c => mapContract(c, person.id));
  const accounts = worker.accounts.map(mapAccount);

  // Find active contract
  const activeContract = contracts.find(c => c.status === 'active') || contracts[0];

  return {
    person,
    contract: activeContract,
    accounts,
  };
}

// ===== API CLIENT =====

/**
 * Call Customer API via RabbitMQ
 */
async function callCustomerApi<T>(
  action: string,
  payload: Record<string, unknown>,
  config: RuntimeConfig
): Promise<ApiResponse<T>> {
  const baseUrl = config.rabbitmqProxyUrl || 'https://mq.dokasteel.ru';

  try {
    const response = await fetch(`${baseUrl}/api/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: { code: 'HTTP_ERROR', message: `HTTP ${response.status}` },
      };
    }

    return response.json();
  } catch (err) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: (err as Error).message },
    };
  }
}

// ===== AUTH FUNCTIONS (return AuthData for login flow) =====

/**
 * Get customer by ID and return AuthData
 */
export async function getCustomerAuthData(
  personId: number,
  config: RuntimeConfig
): Promise<AuthData | null> {
  const result = await callCustomerApi<WorkerCustomerData>('customer.get', { personId }, config);

  if (!result.success || !result.data) {
    return null;
  }

  return mapCustomerToAuthData(result.data);
}

/**
 * Get customer by phone and return AuthData
 */
export async function getCustomerByPhone(
  phone: string,
  config: RuntimeConfig
): Promise<AuthData | null> {
  const result = await callCustomerApi<WorkerCustomerData>('customer.getByPhone', { phone }, config);

  if (!result.success || !result.data) {
    return null;
  }

  return mapCustomerToAuthData(result.data);
}

/**
 * Get customer by email and return AuthData
 */
export async function getCustomerByEmail(
  email: string,
  config: RuntimeConfig
): Promise<AuthData | null> {
  const result = await callCustomerApi<WorkerCustomerData>('customer.getByEmail', { email }, config);

  if (!result.success || !result.data) {
    return null;
  }

  return mapCustomerToAuthData(result.data);
}

/**
 * Get customer by Telegram ID and return AuthData
 */
export async function getCustomerByTelegram(
  telegramId: string,
  config: RuntimeConfig
): Promise<AuthData | null> {
  const result = await callCustomerApi<WorkerCustomerData>('customer.getByTelegram', { telegramId }, config);

  if (!result.success || !result.data) {
    return null;
  }

  return mapCustomerToAuthData(result.data);
}

/**
 * Get customer by contract number and return AuthData
 */
export async function getCustomerByContract(
  contractNumber: string,
  config: RuntimeConfig
): Promise<AuthData | null> {
  const result = await callCustomerApi<WorkerCustomerData>('customer.getByContract', { contractNumber }, config);

  if (!result.success || !result.data) {
    return null;
  }

  return mapCustomerToAuthData(result.data);
}

// ===== DATA FUNCTIONS (for dashboard, pages) =====

/**
 * Get available services
 */
export async function getServices(
  config: RuntimeConfig
): Promise<Service[]> {
  const result = await callCustomerApi<PaginatedData<WorkerService>>('service.list', {}, config);

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.items.map(mapService);
}

/**
 * Get subscriptions for an account
 */
export async function getSubscriptions(
  accountId: string,
  config: RuntimeConfig
): Promise<Subscription[]> {
  const result = await callCustomerApi<PaginatedData<WorkerSubscription>>(
    'subscription.list',
    { accountId },
    config
  );

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.items.map(mapSubscription);
}

/**
 * Get transactions for an account
 */
export async function getTransactions(
  accountId: string,
  config: RuntimeConfig,
  options: { limit?: number; offset?: number; year?: number } = {}
): Promise<{ items: Transaction[]; total: number }> {
  const result = await callCustomerApi<PaginatedData<WorkerTransaction>>(
    'transaction.list',
    { accountId, ...options },
    config
  );

  if (!result.success || !result.data) {
    return { items: [], total: 0 };
  }

  return {
    items: result.data.items.map(mapTransaction),
    total: result.data.total,
  };
}

/**
 * Get invoices for an account
 */
export async function getInvoices(
  accountId: string,
  config: RuntimeConfig,
  options: { status?: string; limit?: number; offset?: number; year?: number } = {}
): Promise<{ items: Invoice[]; total: number }> {
  const result = await callCustomerApi<PaginatedData<WorkerInvoice>>(
    'invoice.list',
    { accountId, ...options },
    config
  );

  if (!result.success || !result.data) {
    return { items: [], total: 0 };
  }

  return {
    items: result.data.items.map(mapInvoice),
    total: result.data.total,
  };
}

/**
 * Get account balance
 */
export async function getAccountBalance(
  accountId: string,
  config: RuntimeConfig
): Promise<{ balance: number; creditLimit: number } | null> {
  interface BalanceResponse {
    accountId: string;
    balance: string;
    creditLimit: string;
    availableBalance: string;
  }

  const result = await callCustomerApi<BalanceResponse>('account.balance', { accountId }, config);

  if (!result.success || !result.data) {
    return null;
  }

  return {
    balance: parseMoneyToKopeks(result.data.balance),
    creditLimit: parseMoneyToKopeks(result.data.creditLimit),
  };
}

// ===== UTILITY =====

/**
 * Normalize phone number to format: 79XXXXXXXXX
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, '');

  // Handle 8 prefix (Russia)
  if (digits.startsWith('8') && digits.length === 11) {
    digits = '7' + digits.slice(1);
  }

  // Add 7 if starts with 9 and has 10 digits
  if (digits.startsWith('9') && digits.length === 10) {
    digits = '7' + digits;
  }

  return digits;
}
