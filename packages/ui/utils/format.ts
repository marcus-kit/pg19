// Деньги (копейки → рубли)
export function formatMoney(kopecks: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(kopecks / 100);
}

// Деньги со знаком
export function formatMoneyWithSign(kopecks: number, currency = 'RUB'): string {
  const formatted = formatMoney(Math.abs(kopecks), currency);
  if (kopecks > 0) return '+' + formatted;
  if (kopecks < 0) return '-' + formatted;
  return formatted;
}

// Дата
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

// Дата и время
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Относительная дата
export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return formatDate(date);
}

// ФИО (Фамилия Имя Отчество)
export function formatFullName(user: { first_name?: string | null; last_name?: string | null; middle_name?: string | null }): string {
  return [user.last_name, user.first_name, user.middle_name].filter(Boolean).join(' ');
}

// Короткое ФИО (Иванов И. О.)
export function formatShortName(user: { first_name?: string | null; last_name?: string | null; middle_name?: string | null }): string {
  const lastName = user.last_name || '';
  const firstInitial = user.first_name ? user.first_name[0] + '.' : '';
  const middleInitial = user.middle_name ? user.middle_name[0] + '.' : '';
  return [lastName, firstInitial, middleInitial].filter(Boolean).join(' ');
}

// Телефон
export function formatPhone(phone: string | null): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}

// Адрес
export function formatAddress(address: {
  city?: string | null;
  street?: string | null;
  building?: string | null;
  apartment?: string | null;
}): string {
  const parts = [];
  if (address.city) parts.push(address.city);
  if (address.street) parts.push(address.street);
  if (address.building) parts.push(`д. ${address.building}`);
  if (address.apartment) parts.push(`кв. ${address.apartment}`);
  return parts.join(', ');
}

// Статус на русском
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    // Person
    active: 'Активен',
    suspended: 'Приостановлен',
    terminated: 'Расторгнут',
    // Contract
    draft: 'Черновик',
    // Account
    blocked: 'Заблокирован',
    closed: 'Закрыт',
    // Subscription
    paused: 'Приостановлена',
    cancelled: 'Отменена',
    // Payment
    pending: 'Ожидает',
    succeeded: 'Успешно',
    failed: 'Ошибка',
    refunded: 'Возвращён',
    // Invoice
    issued: 'Выставлен',
    paid: 'Оплачен',
    overdue: 'Просрочен',
  };
  return statusMap[status] || status;
}

// Тип транзакции на русском
export function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    charge: 'Списание',
    payment: 'Пополнение',
    correction: 'Корректировка',
    refund: 'Возврат',
    bonus: 'Бонус',
  };
  return typeMap[type] || type;
}

// Провайдер платежа на русском
export function formatPaymentProvider(provider: string): string {
  const providerMap: Record<string, string> = {
    yookassa: 'ЮКасса',
    cloudpayments: 'CloudPayments',
    sbp: 'СБП',
    cash: 'Наличные',
    bank_transfer: 'Банковский перевод',
    terminal: 'Терминал',
  };
  return providerMap[provider] || provider;
}
