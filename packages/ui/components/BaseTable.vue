<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :class="[
              'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
              column.sortable ? 'cursor-pointer hover:bg-gray-100' : '',
              column.align === 'right' ? 'text-right' : '',
              column.align === 'center' ? 'text-center' : '',
            ]"
            @click="column.sortable && handleSort(column.key)"
          >
            <div class="flex items-center gap-1">
              {{ column.label }}
              <template v-if="column.sortable">
                <svg
                  v-if="sortKey === column.key"
                  class="h-4 w-4"
                  :class="{ 'rotate-180': sortOrder === 'desc' }"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4 text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </template>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <template v-if="loading">
          <tr v-for="i in skeletonRows" :key="i">
            <td v-for="column in columns" :key="column.key" class="px-4 py-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse" />
            </td>
          </tr>
        </template>
        <template v-else-if="data.length === 0">
          <tr>
            <td :colspan="columns.length" class="px-4 py-12 text-center text-gray-500">
              <slot name="empty">
                {{ emptyText }}
              </slot>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
            :class="[
              'hover:bg-gray-50 transition-colors',
              clickable ? 'cursor-pointer' : '',
            ]"
            @click="clickable && $emit('row-click', row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-4 py-4 text-sm text-gray-900',
                column.align === 'right' ? 'text-right' : '',
                column.align === 'center' ? 'text-center' : '',
              ]"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface Props {
  columns: Column[];
  data: any[];
  loading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
  rowKey?: string;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  skeletonRows: 5,
  emptyText: 'Нет данных',
  rowKey: 'id',
  clickable: false,
});

const emit = defineEmits<{
  'row-click': [row: any];
  sort: [key: string, order: 'asc' | 'desc'];
}>();

const sortKey = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

function handleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  emit('sort', sortKey.value, sortOrder.value);
}

function getRowKey(row: any, index: number): string | number {
  return (row[props.rowKey] as string | number) ?? index;
}
</script>
