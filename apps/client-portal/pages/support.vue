<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Поддержка</h1>

    <!-- Quick Contact Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <a
        href="tel:+78001234567"
        class="block"
      >
        <BaseCard hover class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <PhoneIcon class="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">Позвонить</p>
              <p class="text-sm text-primary-600">8 (800) 123-45-67</p>
            </div>
          </div>
        </BaseCard>
      </a>

      <a
        href="https://t.me/pg19support"
        target="_blank"
        class="block"
      >
        <BaseCard hover class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TelegramIcon class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">Telegram</p>
              <p class="text-sm text-blue-600">@pg19support</p>
            </div>
          </div>
        </BaseCard>
      </a>

      <button
        class="block w-full text-left"
        @click="showChatModal = true"
      >
        <BaseCard hover class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
              <ChatIcon class="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">Онлайн-чат</p>
              <p class="text-sm text-secondary-600">Ответим за 5 минут</p>
            </div>
          </div>
        </BaseCard>
      </button>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.id
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span
            v-if="tab.count"
            class="ml-2 px-2 py-0.5 text-xs rounded-full"
            :class="activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'tickets'">
      <!-- Create Ticket Button -->
      <div class="mb-6">
        <BaseButton variant="primary" @click="showCreateModal = true">
          <PlusIcon class="w-5 h-5 mr-2" />
          Создать заявку
        </BaseButton>
      </div>

      <!-- Tickets List -->
      <BaseCard v-if="tickets.length > 0" :padding="false">
        <div class="divide-y divide-gray-100">
          <div
            v-for="ticket in tickets"
            :key="ticket.id"
            class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="openTicket(ticket)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900">{{ ticket.subject }}</span>
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="getTicketStatusClass(ticket.status)"
                  >
                    {{ getTicketStatusLabel(ticket.status) }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 line-clamp-1">{{ ticket.lastMessage }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  #{{ ticket.id }} · {{ formatDate(ticket.updatedAt) }}
                </p>
              </div>
              <ChevronRightIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </div>
      </BaseCard>

      <div v-else class="text-center py-16">
        <TicketIcon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500 text-lg">Нет активных заявок</p>
        <p class="text-gray-400 text-sm mt-1">Создайте заявку, если вам нужна помощь</p>
      </div>
    </div>

    <div v-else-if="activeTab === 'faq'">
      <!-- Search -->
      <div class="mb-6">
        <div class="relative">
          <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="faqSearch"
            type="text"
            placeholder="Поиск по вопросам..."
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <!-- FAQ Categories -->
      <div class="space-y-4">
        <BaseCard
          v-for="category in filteredFaqCategories"
          :key="category.id"
          :padding="false"
        >
          <button
            class="w-full p-4 flex items-center justify-between text-left"
            @click="toggleCategory(category.id)"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="category.bgClass"
              >
                <component :is="category.icon" class="w-5 h-5" :class="category.iconClass" />
              </div>
              <span class="font-medium text-gray-900">{{ category.title }}</span>
            </div>
            <ChevronDownIcon
              class="w-5 h-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': expandedCategory === category.id }"
            />
          </button>

          <div
            v-if="expandedCategory === category.id"
            class="px-4 pb-4 space-y-2"
          >
            <div
              v-for="(item, index) in category.items"
              :key="index"
              class="border border-gray-100 rounded-lg"
            >
              <button
                class="w-full p-3 flex items-center justify-between text-left text-sm"
                @click="toggleFaq(category.id + '-' + index)"
              >
                <span class="font-medium text-gray-700">{{ item.question }}</span>
                <ChevronDownIcon
                  class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2"
                  :class="{ 'rotate-180': expandedFaq === category.id + '-' + index }"
                />
              </button>
              <div
                v-if="expandedFaq === category.id + '-' + index"
                class="px-3 pb-3 text-sm text-gray-600"
              >
                {{ item.answer }}
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <BaseModal v-model:isOpen="showCreateModal" title="Новая заявка">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Тип проблемы</label>
          <BaseSelect
            v-model="newTicket.type"
            :options="ticketTypeOptions"
            placeholder="Выберите тип"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Тема</label>
          <input
            v-model="newTicket.subject"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Кратко опишите проблему"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea
            v-model="newTicket.message"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Опишите проблему подробно..."
          />
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="ghost" @click="showCreateModal = false">
            Отмена
          </BaseButton>
          <BaseButton
            variant="primary"
            :disabled="!canSubmitTicket"
            @click="submitTicket"
          >
            Отправить
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Chat Modal -->
    <BaseModal v-model:isOpen="showChatModal" title="Онлайн-чат">
      <div class="h-96 flex flex-col">
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
          <div class="flex gap-3">
            <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <BotIcon class="w-4 h-4 text-white" />
            </div>
            <div class="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
              <p class="text-sm text-gray-700">
                Здравствуйте! Я виртуальный помощник PG19. Чем могу помочь?
              </p>
            </div>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Введите сообщение..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <BaseButton variant="primary">
            <SendIcon class="w-5 h-5" />
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { BaseCard, BaseButton, BaseModal, BaseSelect, formatDate } from '@pg19/ui';

// Icons
import PhoneIcon from '~/components/icons/PhoneIcon.vue';
import TelegramIcon from '~/components/icons/TelegramIcon.vue';
import ChatIcon from '~/components/icons/ChatIcon.vue';
import PlusIcon from '~/components/icons/PlusIcon.vue';
import ChevronRightIcon from '~/components/icons/ChevronRightIcon.vue';
import ChevronDownIcon from '~/components/icons/ChevronDownIcon.vue';
import TicketIcon from '~/components/icons/TicketIcon.vue';
import SearchIcon from '~/components/icons/SearchIcon.vue';
import WalletIcon from '~/components/icons/WalletIcon.vue';
import WifiIcon from '~/components/icons/WifiIcon.vue';
import DocumentIcon from '~/components/icons/DocumentIcon.vue';
import SettingsIcon from '~/components/icons/SettingsIcon.vue';
import BotIcon from '~/components/icons/BotIcon.vue';
import SendIcon from '~/components/icons/SendIcon.vue';

definePageMeta({
  middleware: 'auth',
});

// State
const activeTab = ref<'tickets' | 'faq'>('tickets');
const showCreateModal = ref(false);
const showChatModal = ref(false);
const faqSearch = ref('');
const expandedCategory = ref<string | null>(null);
const expandedFaq = ref<string | null>(null);

// Mock tickets data
const tickets = ref([
  {
    id: '12345',
    subject: 'Низкая скорость интернета',
    status: 'in_progress',
    lastMessage: 'Мастер выехал на адрес, ожидайте звонка',
    updatedAt: '2025-01-15T10:30:00',
  },
  {
    id: '12340',
    subject: 'Вопрос по оплате',
    status: 'closed',
    lastMessage: 'Ваш вопрос решён. Спасибо за обращение!',
    updatedAt: '2025-01-10T15:45:00',
  },
]);

const tabs = computed(() => [
  { id: 'tickets' as const, label: 'Мои заявки', count: tickets.value.filter(t => t.status !== 'closed').length || undefined },
  { id: 'faq' as const, label: 'Частые вопросы' },
]);

const newTicket = reactive({
  type: '',
  subject: '',
  message: '',
});

const ticketTypeOptions = [
  { value: 'no_internet', label: 'Нет интернета' },
  { value: 'slow_speed', label: 'Низкая скорость' },
  { value: 'payment', label: 'Вопрос по оплате' },
  { value: 'tariff', label: 'Смена тарифа' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'other', label: 'Другое' },
];

const faqCategories = [
  {
    id: 'payment',
    title: 'Оплата и баланс',
    icon: WalletIcon,
    bgClass: 'bg-orange-100',
    iconClass: 'text-orange-600',
    items: [
      { question: 'Как пополнить баланс?', answer: 'Вы можете пополнить баланс банковской картой, через СБП или в терминалах оплаты. Перейдите в раздел "Оплата" в личном кабинете.' },
      { question: 'Как настроить автоплатёж?', answer: 'В разделе "Оплата" отметьте галочку "Подключить автоплатёж" при пополнении баланса. Деньги будут списываться автоматически при низком балансе.' },
      { question: 'Почему списали больше обычного?', answer: 'Возможно, вы подключили дополнительные услуги или изменился тариф. Проверьте историю операций для детальной информации.' },
    ],
  },
  {
    id: 'internet',
    title: 'Интернет',
    icon: WifiIcon,
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
    items: [
      { question: 'Что делать, если нет интернета?', answer: 'Проверьте баланс лицевого счёта, перезагрузите роутер. Если проблема не решена, создайте заявку в поддержку.' },
      { question: 'Как проверить скорость?', answer: 'Используйте встроенный тест скорости в разделе "Главная" или сторонние сервисы (speedtest.net).' },
      { question: 'Почему скорость ниже заявленной?', answer: 'На скорость влияют многие факторы: качество Wi-Fi, загруженность сети, устройство. Попробуйте подключиться по кабелю для точного теста.' },
    ],
  },
  {
    id: 'tariffs',
    title: 'Тарифы и услуги',
    icon: DocumentIcon,
    bgClass: 'bg-green-100',
    iconClass: 'text-green-600',
    items: [
      { question: 'Как сменить тариф?', answer: 'Перейдите в раздел "Сервисы", выберите нужный тариф и нажмите "Подключить". Изменения применятся с начала следующего периода или сразу с перерасчётом.' },
      { question: 'Можно ли приостановить услуги?', answer: 'Да, вы можете приостановить услуги на время отпуска (от 7 до 90 дней). Перейдите в "Сервисы" → "Приостановка услуг".' },
    ],
  },
  {
    id: 'account',
    title: 'Профиль и настройки',
    icon: SettingsIcon,
    bgClass: 'bg-purple-100',
    iconClass: 'text-purple-600',
    items: [
      { question: 'Как изменить контактные данные?', answer: 'Перейдите в раздел "Профиль" и нажмите кнопку редактирования рядом с контактными данными.' },
      { question: 'Как настроить уведомления?', answer: 'В разделе "Профиль" → "Уведомления" вы можете выбрать, какие уведомления получать и каким способом.' },
    ],
  },
];

const filteredFaqCategories = computed(() => {
  if (!faqSearch.value) return faqCategories;

  const search = faqSearch.value.toLowerCase();
  return faqCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.question.toLowerCase().includes(search) ||
        item.answer.toLowerCase().includes(search)
    ),
  })).filter(cat => cat.items.length > 0);
});

const canSubmitTicket = computed(() => {
  return newTicket.type && newTicket.subject && newTicket.message;
});

function getTicketStatusClass(status: string): string {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-yellow-100 text-yellow-700';
    case 'closed': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getTicketStatusLabel(status: string): string {
  switch (status) {
    case 'open': return 'Открыта';
    case 'in_progress': return 'В работе';
    case 'closed': return 'Закрыта';
    default: return status;
  }
}

function toggleCategory(id: string) {
  expandedCategory.value = expandedCategory.value === id ? null : id;
}

function toggleFaq(id: string) {
  expandedFaq.value = expandedFaq.value === id ? null : id;
}

function openTicket(ticket: any) {
  // TODO: Open ticket detail modal or page
  alert(`Заявка #${ticket.id}: ${ticket.subject}`);
}

function submitTicket() {
  // TODO: Submit ticket to API
  alert('Заявка создана! Мы свяжемся с вами в ближайшее время.');
  showCreateModal.value = false;
  newTicket.type = '';
  newTicket.subject = '';
  newTicket.message = '';
}
</script>
