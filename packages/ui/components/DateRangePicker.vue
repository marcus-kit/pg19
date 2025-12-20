<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <input
        type="date"
        :value="startDate"
        :max="endDate || undefined"
        class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500/20 focus:outline-none focus:ring-2"
        @input="updateStartDate"
      />
    </div>
    <span class="text-gray-400">—</span>
    <div class="relative">
      <input
        type="date"
        :value="endDate"
        :min="startDate || undefined"
        class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500/20 focus:outline-none focus:ring-2"
        @input="updateEndDate"
      />
    </div>
    <div v-if="showPresets" class="flex gap-1 ml-2">
      <button
        v-for="preset in presets"
        :key="preset.label"
        type="button"
        class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface Props {
  startDate: string | null;
  endDate: string | null;
  showPresets?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showPresets: true,
});

const emit = defineEmits<{
  'update:startDate': [date: string | null];
  'update:endDate': [date: string | null];
  change: [range: DateRange];
}>();

interface Preset {
  label: string;
  days: number;
}

const presets: Preset[] = [
  { label: '7 дней', days: 7 },
  { label: '30 дней', days: 30 },
  { label: '90 дней', days: 90 },
];

function updateStartDate(event: Event) {
  const value = (event.target as HTMLInputElement).value || null;
  emit('update:startDate', value);
  emit('change', { startDate: value, endDate: props.endDate });
}

function updateEndDate(event: Event) {
  const value = (event.target as HTMLInputElement).value || null;
  emit('update:endDate', value);
  emit('change', { startDate: props.startDate, endDate: value });
}

function applyPreset(preset: Preset) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - preset.days);

  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  emit('update:startDate', startDate);
  emit('update:endDate', endDate);
  emit('change', { startDate, endDate });
}
</script>
