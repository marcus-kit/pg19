<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Клиенты</h1>
      <NuxtLink to="/users/create">
        <BaseButton variant="primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Добавить
        </BaseButton>
      </NuxtLink>
    </div>

    <!-- Filters -->
    <BaseCard class="mb-6" :padding="true">
      <div class="flex flex-col md:flex-row gap-4">
        <SearchInput
          v-model="search"
          placeholder="Поиск по ФИО, телефону, email..."
          class="flex-1"
          @search="handleSearch"
        />
        <BaseSelect
          v-model="statusFilter"
          :options="statusOptions"
          class="md:w-48"
          @change="loadUsers"
        />
      </div>
    </BaseCard>

    <!-- Table -->
    <BaseCard :padding="false">
      <BaseTable
        :columns="columns"
        :data="users"
        :loading="isLoading"
        row-key="id"
        clickable
        @row-click="handleRowClick"
        @sort="handleSort"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-600 text-sm font-medium">
                {{ getInitials(row) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ formatFullName(row) }}</p>
              <p class="text-xs text-gray-500">ID: {{ row.id }}</p>
            </div>
          </div>
        </template>

        <template #cell-phone="{ row }">
          {{ row.phone ? formatPhone(row.phone) : '—' }}
        </template>

        <template #cell-email="{ row }">
          {{ row.email || '—' }}
        </template>

        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" type="user" />
        </template>

        <template #cell-created_at="{ row }">
          {{ formatDate(row.created_at) }}
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <NuxtLink :to="`/users/${row.id}`">
              <BaseButton variant="ghost" size="sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </BaseButton>
            </NuxtLink>
          </div>
        </template>
      </BaseTable>

      <BasePagination
        v-if="total > perPage"
        v-model:current-page="currentPage"
        :total="total"
        :per-page="perPage"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import {
  BaseButton,
  BaseCard,
  BaseTable,
  BaseSelect,
  BasePagination,
  SearchInput,
  StatusBadge,
  formatFullName,
  formatPhone,
  formatDate,
} from '@pg19/ui';
import type { User } from '@pg19/types';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const api = useApi();

const users = ref<User[]>([]);
const isLoading = ref(true);
const search = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const total = ref(0);
const perPage = 20;
const sortKey = ref('');
const sortOrder = ref<'asc' | 'desc'>('asc');

const columns = [
  { key: 'name', label: 'Клиент', sortable: true },
  { key: 'phone', label: 'Телефон' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Статус' },
  { key: 'created_at', label: 'Дата регистрации', sortable: true },
  { key: 'actions', label: '', align: 'right' as const },
];

const statusOptions = [
  { value: '', label: 'Все статусы' },
  { value: 'active', label: 'Активные' },
  { value: 'suspended', label: 'Приостановленные' },
  { value: 'terminated', label: 'Расторгнутые' },
];

function getInitials(user: User): string {
  const first = user.first_name?.[0] || '';
  const last = user.last_name?.[0] || '';
  return (first + last).toUpperCase() || '?';
}

function handleRowClick(row: User) {
  router.push(`/users/${row.id}`);
}

function handleSearch() {
  currentPage.value = 1;
  loadUsers();
}

function handleSort(key: string, order: 'asc' | 'desc') {
  sortKey.value = key;
  sortOrder.value = order;
  loadUsers();
}

watch([currentPage, statusFilter], () => {
  loadUsers();
});

async function loadUsers() {
  isLoading.value = true;

  try {
    const sort = sortKey.value
      ? (sortOrder.value === 'desc' ? '-' : '') + (sortKey.value === 'name' ? 'last_name' : sortKey.value)
      : '-created_at';

    const result = await api.getUsers({
      search: search.value || undefined,
      sort,
      limit: perPage,
      offset: (currentPage.value - 1) * perPage,
    });

    users.value = result as User[];
    total.value = users.value.length < perPage
      ? (currentPage.value - 1) * perPage + users.value.length
      : currentPage.value * perPage + 1;
  } catch (e) {
    console.error('Failed to load users:', e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadUsers();
});
</script>
