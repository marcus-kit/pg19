# ISP Billing System (BSS) - Web Interfaces

## Обзор проекта

Разработка двух веб-интерфейсов для биллинговой системы интернет-провайдера:
1. **Клиентский портал** — личный кабинет абонента
2. **Административная панель** — управление абонентами и биллингом

Оба интерфейса должны иметь **единый дизайн** и работать с **Directus API** как бэкендом.

---

## Технологический стек

```
Frontend:
├── Nuxt 3 (Vue 3 + Composition API)
├── TypeScript
├── Tailwind CSS
├── Headless UI (компоненты)
├── Pinia (state management)
├── VueUse (утилиты)
└── @directus/sdk (API клиент)

Структура монорепо:
├── apps/
│   ├── client-portal/     # Клиентский портал
│   └── admin-panel/       # Административная панель
├── packages/
│   ├── ui/                # Shared UI компоненты
│   ├── api/               # Directus API клиент
│   └── types/             # TypeScript типы
└── package.json
```

---

## Цветовая схема (из логотипа PG19)

```css
:root {
  /* Primary Colors */
  --color-primary: #264895;        /* Синий - основной */
  --color-primary-light: #3B5BA9;
  --color-primary-dark: #1A3670;
  
  /* Secondary Colors */
  --color-secondary: #0DA342;      /* Зелёный - успех/активный */
  --color-secondary-light: #10C94F;
  --color-secondary-dark: #0A7A32;
  
  /* Accent Colors */
  --color-accent-pink: #E61562;    /* Розовый - акцент */
  --color-accent-orange: #F29315;  /* Оранжевый - предупреждения */
  
  /* Neutral Colors */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;
  
  /* Semantic Colors */
  --color-success: #0DA342;
  --color-warning: #F29315;
  --color-error: #E61562;
  --color-info: #264895;
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#264895',  // main
          600: '#1A3670',
          700: '#153060',
          800: '#102550',
          900: '#0A1A40',
        },
        secondary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#0DA342',  // main
          600: '#0A7A32',
          700: '#085C26',
          800: '#064E20',
          900: '#03391A',
        },
        accent: {
          pink: '#E61562',
          orange: '#F29315',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

---

## Directus API

### Базовый URL
```
DIRECTUS_URL=https://visp.dokasteel.ru/
```

### Коллекции (схема данных)

```typescript
// packages/types/index.ts

interface Person {
  id: number;
  customer_number: string;        // AB-00001
  status: 'active' | 'suspended' | 'terminated';
  first_name: string;
  last_name: string;
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
  contracts: Contract[];
}

interface Contract {
  id: string;                     // UUID
  contract_number: string;        // 100001
  person_id: number;
  status: 'draft' | 'active' | 'terminated';
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
  accounts: Account[];
}

interface Account {
  id: string;                     // UUID
  account_number: string;         // ЛС-00000001
  contract_id: string;
  status: 'active' | 'blocked' | 'closed';
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
  coverage_id: number | null;
  date_created: string;
  date_updated: string;
  subscriptions: Subscription[];
  transactions: Transaction[];
  payments: Payment[];
  invoices: Invoice[];
}

interface Service {
  id: number;
  name: string;
  price_monthly: number;          // рубли
  price_connection: number | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Subscription {
  id: number;
  account_id: string;
  service_id: number;
  status: 'active' | 'paused' | 'cancelled';
  started_at: string;
  expires_at: string | null;
  custom_price: number | null;    // копейки
  date_created: string;
  date_updated: string;
  service?: Service;
}

interface Transaction {
  id: number;
  account_id: string;
  type: 'charge' | 'payment' | 'correction' | 'refund' | 'bonus';
  amount: number;                 // копейки (+ пополнение, - списание)
  balance_after: number;          // копейки
  description: string | null;
  subscription_id: number | null;
  payment_id: number | null;
  invoice_id: string | null;
  fiscal_receipt_id: string | null;
  fiscalized_at: string | null;
  date_created: string;
}

interface Payment {
  id: number;
  account_id: string;
  amount: number;                 // копейки
  provider: 'yookassa' | 'cloudpayments' | 'sbp' | 'cash' | 'bank_transfer' | 'terminal';
  external_id: string | null;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  metadata: Record<string, any>;
  fiscal_receipt_id: string | null;
  fiscalized_at: string | null;
  date_created: string;
  confirmed_at: string | null;
}

interface Invoice {
  id: string;                     // UUID
  invoice_number: string;         // СЧ-2024/00001
  account_id: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
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

interface Coverage {
  id: number;
  address: string;
  city: string | null;
  connection_type: 'ftth' | 'fttb' | 'ethernet' | 'wireless' | 'xdsl';
  building_type: 'mkd' | 'private' | 'business' | 'cottage';
  apartment_count: number | null;
  available_ports: number | null;
  is_active: boolean;
}
```

---

## Клиентский портал (apps/client-portal)

### Функционал

```
Авторизация:
├── Вход по номеру договора + ФИО
│   └── Форма: contract_number + last_name + first_name
└── Без пароля (упрощённая авторизация для MVP)

Главная (Dashboard):
├── Баланс (крупно)
├── Статус (активен/заблокирован)
├── Текущий тариф
├── Кнопка "Пополнить" (заглушка для MVP)
└── Следующее списание

История операций:
├── Список транзакций
├── Фильтр по типу (все/списания/пополнения)
├── Фильтр по периоду
└── Пагинация

Тарифы:
├── Текущий тариф (выделен)
├── Доступные тарифы
└── Кнопка "Сменить тариф" (заявка)

Счета:
├── Список счетов
├── Статусы (выставлен/оплачен/просрочен)
└── Скачать PDF (заглушка)

Профиль:
├── Данные договора
├── Адрес подключения
└── Контактные данные
```

### Структура страниц

```
pages/
├── index.vue                    # Редирект на /login или /dashboard
├── login.vue                    # Авторизация
├── dashboard.vue                # Главная
├── transactions.vue             # История операций
├── tariffs.vue                  # Тарифы
├── invoices.vue                 # Счета
└── profile.vue                  # Профиль
```

### Авторизация (упрощённая для MVP)

```typescript
// composables/useAuth.ts
// Поиск клиента по номеру договора и ФИО

async function login(contractNumber: string, lastName: string, firstName: string) {
  const { data } = await directus.items('contracts').readByQuery({
    filter: {
      contract_number: { _eq: contractNumber },
      status: { _eq: 'active' }
    },
    fields: ['*', 'person_id.*', 'accounts.*']
  });
  
  if (!data?.length) throw new Error('Договор не найден');
  
  const contract = data[0];
  const person = contract.person_id;
  
  // Проверка ФИО (регистронезависимо)
  if (
    person.last_name?.toLowerCase() !== lastName.toLowerCase() ||
    person.first_name?.toLowerCase() !== firstName.toLowerCase()
  ) {
    throw new Error('ФИО не совпадает');
  }
  
  // Сохраняем в session/localStorage
  return { contract, person, accounts: contract.accounts };
}
```

---

## Административная панель (apps/admin-panel)

### Функционал

```
Авторизация:
└── Directus Users (admin роль)

Dashboard:
├── Статистика
│   ├── Всего абонентов
│   ├── Активных
│   ├── Заблокированных
│   └── Баланс (сумма всех положительных)
├── Последние платежи
└── Последние регистрации

Абоненты (Persons):
├── Список с поиском
│   ├── Поиск по ФИО, телефону, email, номеру договора
│   └── Фильтры по статусу
├── Карточка абонента
│   ├── Персональные данные
│   ├── Договоры
│   ├── Лицевые счета
│   └── История операций
├── Создание абонента
└── Редактирование

Лицевые счета (Accounts):
├── Список
├── Карточка
│   ├── Баланс
│   ├── Подписки (тарифы)
│   ├── Транзакции
│   └── Платежи
├── Ручная корректировка баланса
└── Блокировка/разблокировка

Тарифы (Services):
├── Список
├── Создание
├── Редактирование
└── Активация/деактивация

Платежи (Payments):
├── Список всех платежей
├── Фильтры по статусу, провайдеру
├── Ручное создание платежа (наличные)
└── Просмотр деталей

Транзакции (Transactions):
├── Список всех транзакций
├── Фильтры по типу, периоду
└── Создание корректировки

Отчёты (базовые):
├── Сборы за период
├── Поступления за период
└── Должники
```

### Структура страниц

```
pages/
├── index.vue                    # Редирект
├── login.vue                    # Авторизация (Directus)
├── dashboard.vue                # Главная со статистикой
├── persons/
│   ├── index.vue                # Список абонентов
│   ├── [id].vue                 # Карточка абонента
│   └── create.vue               # Создание
├── accounts/
│   ├── index.vue                # Список ЛС
│   └── [id].vue                 # Карточка ЛС
├── services/
│   ├── index.vue                # Список тарифов
│   └── [id].vue                 # Редактирование
├── payments/
│   ├── index.vue                # Список платежей
│   └── create.vue               # Ручное создание
├── transactions/
│   └── index.vue                # Список транзакций
└── reports/
    └── index.vue                # Отчёты
```

---

## Shared UI Components (packages/ui)

### Компоненты для реализации

```
components/
├── AppHeader.vue                # Шапка с логотипом и навигацией
├── AppSidebar.vue               # Боковое меню (admin)
├── AppFooter.vue                # Подвал
├── 
├── BaseButton.vue               # Кнопка
├── BaseInput.vue                # Текстовое поле
├── BaseSelect.vue               # Выпадающий список
├── BaseCard.vue                 # Карточка
├── BaseModal.vue                # Модальное окно
├── BaseTable.vue                # Таблица
├── BasePagination.vue           # Пагинация
├── BaseBadge.vue                # Бейдж (статусы)
├── BaseAlert.vue                # Уведомление
├── BaseSpinner.vue              # Загрузка
├── 
├── BalanceDisplay.vue           # Отображение баланса (форматирование)
├── StatusBadge.vue              # Статус (active/blocked/etc)
├── TransactionRow.vue           # Строка транзакции
├── PaymentRow.vue               # Строка платежа
├── DateRangePicker.vue          # Выбор периода
└── SearchInput.vue              # Поиск с debounce
```

### BaseButton пример

```vue
<!-- packages/ui/components/BaseButton.vue -->
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses,
      variantClasses,
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
  >
    <BaseSpinner v-if="loading" class="mr-2 h-4 w-4" />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
});

const sizeClasses = computed(() => ({
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}[props.size]));

const variantClasses = computed(() => ({
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
  danger: 'bg-accent-pink text-white hover:bg-pink-700 focus:ring-accent-pink',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
}[props.variant]));
</script>
```

### BalanceDisplay пример

```vue
<!-- packages/ui/components/BalanceDisplay.vue -->
<template>
  <div :class="['font-semibold', colorClass]">
    {{ formattedBalance }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  amount: number;        // в копейках
  currency?: string;
  showSign?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'RUB',
  showSign: false,
});

const formattedBalance = computed(() => {
  const rubles = props.amount / 100;
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: props.currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(rubles));
  
  if (props.showSign && props.amount > 0) return '+' + formatted;
  if (props.amount < 0) return '-' + formatted;
  return formatted;
});

const colorClass = computed(() => {
  if (props.amount > 0) return 'text-secondary-500';
  if (props.amount < 0) return 'text-accent-pink';
  return 'text-gray-700';
});
</script>
```

---

## API Client (packages/api)

```typescript
// packages/api/index.ts
import { createDirectus, rest, authentication } from '@directus/sdk';
import type { Schema } from '../types';

export function createApiClient(url: string) {
  return createDirectus<Schema>(url)
    .with(rest())
    .with(authentication());
}

// packages/api/composables/useDirectus.ts
export function useDirectus() {
  const config = useRuntimeConfig();
  const client = createApiClient(config.public.directusUrl);
  
  return {
    client,
    
    // Persons
    async getPersons(params?: QueryParams) {
      return client.request(readItems('Persons', params));
    },
    
    async getPerson(id: number) {
      return client.request(readItem('Persons', id, {
        fields: ['*', 'contracts.*', 'contracts.accounts.*']
      }));
    },
    
    // Accounts
    async getAccounts(params?: QueryParams) {
      return client.request(readItems('accounts', params));
    },
    
    async getAccount(id: string) {
      return client.request(readItem('accounts', id, {
        fields: [
          '*',
          'contract_id.*',
          'contract_id.person_id.*',
          'subscriptions.*',
          'subscriptions.service_id.*',
          'transactions.*',
          'payments.*',
          'invoices.*'
        ]
      }));
    },
    
    // Transactions
    async createTransaction(data: Partial<Transaction>) {
      return client.request(createItem('transactions', data));
    },
    
    // Payments
    async createPayment(data: Partial<Payment>) {
      return client.request(createItem('payments', data));
    },
    
    // ... остальные методы
  };
}
```

---

## Дизайн-система

### Layout - Клиентский портал

```
┌─────────────────────────────────────────────────────┐
│  [Logo PG19]              Иванов И.И.    [Выход]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Баланс                                      │   │
│  │  ₽ 1 234,56                      [Пополнить] │   │
│  │  Следующее списание: 01.02.2025              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ История  │ │ Тарифы   │ │ Счета    │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  Последние операции                                │
│  ─────────────────────────────────────────────     │
│  📥 +500.00  Пополнение       15.01.2025          │
│  📤 -700.00  Абонплата        01.01.2025          │
│  📥 +1000.00 Пополнение       20.12.2024          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Layout - Административная панель

```
┌────────────┬────────────────────────────────────────┐
│            │  [Logo]  ISP Billing    Admin  [Выход] │
│  Главная   ├────────────────────────────────────────┤
│            │                                        │
│  Абоненты  │  Dashboard                             │
│            │                                        │
│  Счета     │  ┌────────┐ ┌────────┐ ┌────────┐     │
│            │  │  1234  │ │  1100  │ │   45   │     │
│  Тарифы    │  │ Всего  │ │Активных│ │Заблок. │     │
│            │  └────────┘ └────────┘ └────────┘     │
│  Платежи   │                                        │
│            │  Последние платежи                     │
│  Операции  │  ┌────────────────────────────────┐   │
│            │  │ ЛС-001 │ 500₽  │ ЮКасса │ ✓   │   │
│  Отчёты    │  │ ЛС-042 │ 700₽  │ СБП    │ ✓   │   │
│            │  └────────────────────────────────┘   │
└────────────┴────────────────────────────────────────┘
```

---

## Требования к реализации

### Общие

1. **TypeScript** — строгая типизация везде
2. **Composition API** — только `<script setup>`
3. **Tailwind CSS** — никаких кастомных CSS файлов
4. **Адаптивность** — mobile-first
5. **Доступность** — aria-атрибуты, фокус-состояния

### Форматирование данных

```typescript
// utils/format.ts

// Деньги (копейки → рубли)
export function formatMoney(kopecks: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
  }).format(kopecks / 100);
}

// Дата
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

// Дата и время
export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// ФИО
export function formatFullName(person: { first_name?: string; last_name?: string }): string {
  return [person.last_name, person.first_name].filter(Boolean).join(' ');
}
```

### Состояния компонентов

Каждый компонент должен обрабатывать:
- **Loading** — скелетон или спиннер
- **Error** — сообщение об ошибке
- **Empty** — пустое состояние
- **Success** — данные

### Валидация форм

Использовать `vee-validate` + `zod`:

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  contractNumber: z.string()
    .min(1, 'Введите номер договора')
    .regex(/^\d{6}$/, 'Номер договора должен содержать 6 цифр'),
  fullName: z.string().min(1, 'Введите ФИО'),
});
```

---

## Переменные окружения

```env
# apps/client-portal/.env
NUXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NUXT_PUBLIC_APP_NAME=Личный кабинет PG19

# apps/admin-panel/.env
NUXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NUXT_PUBLIC_APP_NAME=PG19 Billing Admin
```

---

## Порядок разработки

### Этап 1: Инфраструктура
1. Инициализация монорепо (pnpm workspaces)
2. Настройка Tailwind с цветовой схемой
3. Базовые UI компоненты (Button, Input, Card)
4. API клиент для Directus

### Этап 2: Клиентский портал
1. Страница авторизации
2. Dashboard с балансом
3. История операций
4. Страница тарифов
5. Профиль

### Этап 3: Административная панель
1. Авторизация через Directus
2. Dashboard со статистикой
3. CRUD абонентов
4. CRUD лицевых счетов
5. Просмотр платежей и транзакций
6. Базовые отчёты

---

## Примечания

- **Баланс** хранится в копейках, отображать в рублях
- **Даты** приходят в ISO формате, отображать в ru-RU
- **Статусы** отображать с цветными бейджами
- **Пагинация** — по 20 записей на странице
- **Поиск** — с debounce 300ms

---

## Деплой (Production)

### Задеплоенные сервисы

| Сервис | URL | Vercel Project |
|--------|-----|----------------|
| Клиентский портал | https://pg19-client.vercel.app | pg19-client |
| Административная панель | https://pg19-admin.vercel.app | pg19-admin |
| Telegram бот | https://pg19-telegram-bot.vercel.app | pg19-telegram-bot |

### Telegram бот

- **Username:** @PG19CONNECTBOT
- **Webhook URL:** https://pg19-telegram-bot.vercel.app/api/telegram
- **Режим:** Serverless (Vercel Functions), не polling

---

## Выполненные работы (19.12.2024)

### 1. Исправлена авторизация по договору

**Проблема:** Directus API возвращал пустой результат при поиске договора.

**Причина:** `$fetch` с объектом `params` неправильно сериализовал фильтры Directus.

**Решение:** Использовать `URLSearchParams` с bracket notation:
```typescript
// ❌ НЕ РАБОТАЕТ
const response = await $fetch(`${url}/items/contracts`, {
  params: {
    filter: JSON.stringify({ contract_number: { _eq: value } })
  }
});

// ✅ РАБОТАЕТ
const params = new URLSearchParams();
params.append('filter[contract_number][_eq]', contractNumber);
params.append('filter[status][_eq]', 'active');

const response = await $fetch(`${url}/items/contracts?${params.toString()}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 2. Реализована Telegram авторизация через Deep Link

**Проблема:** Стандартный Telegram Login Widget открывает браузер, а не приложение.

**Решение:** Deep link авторизация через бота:
1. Фронтенд запрашивает `POST /api/auth/telegram/init` → получает `sessionId` + `deepLink`
2. Открывается `https://t.me/PG19CONNECTBOT?start=auth_SESSION_ID`
3. Бот получает команду, отправляет webhook на `/api/auth/telegram/webhook`
4. Фронтенд делает polling на `/api/auth/telegram/check`

**Файлы:**
```
apps/client-portal/
├── components/auth/TelegramAuthForm.vue    # Компонент с deep link + polling
├── server/api/auth/telegram/
│   ├── init.post.ts      # Создаёт сессию, возвращает deepLink
│   ├── check.post.ts     # Polling статуса сессии
│   └── webhook.post.ts   # Webhook от бота (HMAC подпись)
└── server/utils/authSessions.ts            # In-memory сессии

telegram-bot/
├── api/telegram.py       # Vercel serverless function
├── bot.py                # Локальная версия (polling)
├── vercel.json
└── requirements.txt
```

### 3. Исправлена работа на iOS

**Проблема:** `window.open()` блокируется на iOS.

**Решение:**
1. Использовать `window.location.href` вместо `window.open()`
2. Сохранять сессию в `localStorage` перед переходом в Telegram
3. При возврате на страницу — восстанавливать сессию и продолжать polling

```typescript
// Сохраняем перед переходом
localStorage.setItem('tg_auth_session', JSON.stringify({
  sessionId: response.sessionId,
  expiresIn: response.expiresIn,
  startedAt: Date.now(),
}));

// При загрузке страницы — проверяем и восстанавливаем
onMounted(() => {
  const saved = localStorage.getItem('tg_auth_session');
  if (saved) {
    // Восстанавливаем polling
  }
});
```

### 4. Задеплоен Telegram бот на Vercel

**Проблема:** Vercel не поддерживает long-running процессы (polling).

**Решение:** Использовать Telegram Webhooks вместо polling:
1. Бот как serverless function (`api/telegram.py`)
2. Telegram отправляет POST на webhook при каждом сообщении
3. Настроить webhook: `https://api.telegram.org/bot{TOKEN}/setWebhook?url=...`

---

## Важные уроки и подводные камни

### Directus API

1. **Фильтры требуют bracket notation:**
   ```
   ✅ filter[field][_eq]=value
   ❌ filter={"field":{"_eq":"value"}}
   ```

2. **Для авторизации нужен активный договор:**
   - `getPersonAuthData()` возвращает `null` если у Person нет активного Contract
   - Проверять наличие договора перед авторизацией

3. **telegram_id хранится как string**, не number

### Vercel

1. **Деплой монорепо зависает** при стандартном `vercel --prod`

   **Решение:** Собирать локально и деплоить prebuilt:
   ```bash
   cd apps/admin-panel
   vercel pull --yes --environment=production
   NUXT_PUBLIC_DIRECTUS_URL="https://visp.dokasteel.ru" vercel build --prod
   vercel deploy --prebuilt --prod --yes
   ```

2. **Environment variables** — при добавлении через CLI избегать trailing newline:
   ```bash
   # ✅ Правильно
   echo -n "value" | vercel env add VAR_NAME production

   # ❌ Может добавить \n в конец
   vercel env add VAR_NAME production <<< "value"
   ```

3. **После изменения env** нужен редеплой для применения

### Telegram Bot

1. **Webhook secret должен совпадать** на боте и сервере
   - При ошибке "Недействительная подпись" — пересоздать секрет на обеих сторонах

2. **Настройка webhook:**
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://your-bot.vercel.app/api/telegram"
   ```

3. **Проверка webhook:**
   ```bash
   curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
   ```

### iOS Safari

1. **`window.open()` блокируется** — использовать `window.location.href`
2. **Состояние теряется** при переходе в другое приложение — сохранять в `localStorage`

---

## Переменные окружения (Production)

### pg19-client (Vercel)
```
NUXT_PUBLIC_DIRECTUS_URL=https://visp.dokasteel.ru
NUXT_DIRECTUS_API_TOKEN=I39b1LsyGrhnkcCdTXMf8DeLnXuPWIHS
TELEGRAM_BOT_USERNAME=PG19CONNECTBOT
TELEGRAM_WEBHOOK_SECRET=3e5bde77a806460eeda27d392ab561ca5c58197e59af52fac53e84cee25b13ba
```

### pg19-admin (Vercel)
```
NUXT_PUBLIC_DIRECTUS_URL=https://visp.dokasteel.ru
```

### pg19-telegram-bot (Vercel)
```
TELEGRAM_BOT_TOKEN=8239443842:AAGNXne9Z8oASGk56AZRB0LxdxbJCXn6XDI
TELEGRAM_WEBHOOK_SECRET=3e5bde77a806460eeda27d392ab561ca5c58197e59af52fac53e84cee25b13ba
WEBHOOK_URL=https://pg19-client.vercel.app/api/auth/telegram/webhook
```

---

## Полезные команды

### Деплой клиентского портала
```bash
cd /Users/valentin/pg19v2
vercel --prod --yes
```

### Деплой админки (prebuilt)
```bash
cd /Users/valentin/pg19v2/apps/admin-panel
vercel pull --yes --environment=production
NUXT_PUBLIC_DIRECTUS_URL="https://visp.dokasteel.ru" vercel build --prod
vercel deploy --prebuilt --prod --yes
```

### Деплой Telegram бота
```bash
cd /Users/valentin/pg19v2/telegram-bot
vercel --prod --yes
```

### Настроить Telegram webhook
```bash
curl "https://api.telegram.org/bot8239443842:AAGNXne9Z8oASGk56AZRB0LxdxbJCXn6XDI/setWebhook?url=https://pg19-telegram-bot.vercel.app/api/telegram"
```

### Проверить Telegram webhook
```bash
curl "https://api.telegram.org/bot8239443842:AAGNXne9Z8oASGk56AZRB0LxdxbJCXn6XDI/getWebhookInfo"
```

### Локальный запуск бота (для отладки)
```bash
cd /Users/valentin/pg19v2/telegram-bot
source venv/bin/activate
# Сначала удалить webhook:
curl "https://api.telegram.org/bot{TOKEN}/deleteWebhook"
# Запустить polling:
python bot.py
```
