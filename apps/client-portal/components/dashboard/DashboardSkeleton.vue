<template>
  <div class="space-y-6 animate-pulse">
    <!-- Account Summary Header Skeleton -->
    <div class="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-primary-200 dark:bg-slate-600" />
          <div class="space-y-2">
            <div class="h-3 w-20 bg-primary-200 dark:bg-slate-600 rounded" />
            <div class="h-8 w-32 bg-primary-200 dark:bg-slate-600 rounded" />
            <div class="flex gap-2">
              <div class="h-5 w-16 bg-primary-200 dark:bg-slate-600 rounded-full" />
              <div class="h-4 w-24 bg-primary-200 dark:bg-slate-600 rounded" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right space-y-1">
            <div class="h-8 w-12 bg-primary-200 dark:bg-slate-600 rounded" />
            <div class="h-3 w-16 bg-primary-200 dark:bg-slate-600 rounded" />
          </div>
          <div class="h-10 w-28 bg-primary-300 dark:bg-slate-500 rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Connection Status Skeleton -->
    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border-l-4 border-gray-300 dark:border-gray-600">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-600" />
        <div class="flex-1 flex justify-between items-center">
          <div class="h-5 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
          <div class="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
      </div>
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div class="h-4 w-40 bg-gray-200 dark:bg-slate-600 rounded" />
          <div class="h-4 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
        <div class="flex justify-between pt-2">
          <div class="h-4 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
          <div class="h-5 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
      </div>
    </div>

    <!-- Quick Actions Skeleton -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div v-for="i in 4" :key="i" class="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-600" />
          <div class="h-4 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
      </div>
    </div>

    <!-- Two Column Skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Promo Skeleton -->
      <div class="rounded-2xl bg-gradient-to-br from-violet-300 to-indigo-300 dark:from-violet-900 dark:to-indigo-900 p-6 h-64">
        <div class="space-y-4">
          <div class="h-6 w-40 bg-white/30 rounded-full" />
          <div class="h-8 w-32 bg-white/30 rounded" />
          <div class="h-4 w-48 bg-white/30 rounded" />
          <div class="h-4 w-64 bg-white/30 rounded" />
          <div class="h-10 w-40 bg-white/40 rounded-lg mt-6" />
        </div>
      </div>

      <!-- Invoices Skeleton -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <div class="h-5 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
          <div class="h-4 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
        <div class="space-y-4">
          <div v-for="i in 2" :key="i" class="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div class="space-y-2">
              <div class="h-4 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-3 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
            <div class="flex items-center gap-3">
              <div class="h-5 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-8 w-20 bg-primary-200 dark:bg-primary-900 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- News Skeleton -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-5 h-5 bg-gray-200 dark:bg-slate-600 rounded" />
        <div class="h-5 w-40 bg-gray-200 dark:bg-slate-600 rounded" />
      </div>
      <div class="space-y-3">
        <div v-for="i in 2" :key="i" class="p-3 rounded-lg bg-gray-50 dark:bg-slate-700">
          <div class="flex items-center gap-2 mb-2">
            <div class="h-4 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
            <div class="h-3 w-12 bg-gray-200 dark:bg-slate-600 rounded" />
          </div>
          <div class="h-4 w-3/4 bg-gray-200 dark:bg-slate-600 rounded mb-2" />
          <div class="h-3 w-1/2 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed - this is a static skeleton
</script>
