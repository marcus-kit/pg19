<template>
  <div class="space-y-6 animate-pulse">
    <!-- Profile Header Skeleton -->
    <div
      class="flex flex-col sm:flex-row sm:items-center gap-4 p-6
             bg-gradient-to-r from-primary-50 to-primary-100
             dark:from-slate-800 dark:to-slate-700 rounded-2xl"
    >
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-200 dark:bg-slate-600" />
      <div class="flex-1 space-y-2">
        <div class="h-7 w-48 bg-primary-200 dark:bg-slate-600 rounded" />
        <div class="flex items-center gap-3">
          <div class="h-4 w-24 bg-primary-200 dark:bg-slate-600 rounded" />
          <div class="h-5 w-16 bg-primary-200 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
      <div class="h-9 w-32 bg-primary-300 dark:bg-slate-500 rounded-lg" />
    </div>

    <!-- Tabs Skeleton -->
    <div class="flex border-b border-gray-200 dark:border-gray-700">
      <div class="h-10 w-28 bg-gray-200 dark:bg-slate-600 rounded mr-4" />
      <div class="h-10 w-28 bg-gray-200 dark:bg-slate-600 rounded" />
    </div>

    <!-- Cards Grid Skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Data Card Skeleton -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <div class="h-5 w-40 bg-gray-200 dark:bg-slate-600 rounded" />
          <div class="h-4 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="space-y-2">
              <div class="h-3 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- Contract Card Skeleton -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="h-5 w-24 bg-gray-200 dark:bg-slate-600 rounded mb-6" />
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div class="space-y-2">
              <div class="h-3 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-5 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
            <div class="h-5 w-16 bg-gray-200 dark:bg-slate-600 rounded-full" />
          </div>
          <div class="space-y-2">
            <div class="h-3 w-28 bg-gray-200 dark:bg-slate-600 rounded" />
            <div class="h-4 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
          </div>
          <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
            <div class="h-4 w-36 bg-gray-200 dark:bg-slate-600 rounded" />
          </div>
        </div>
      </div>

      <!-- Address Card Skeleton -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="h-5 w-36 bg-gray-200 dark:bg-slate-600 rounded mb-6" />
        <div class="flex items-start gap-3">
          <div class="w-5 h-5 bg-gray-200 dark:bg-slate-600 rounded" />
          <div class="space-y-2 flex-1">
            <div class="h-4 w-full bg-gray-200 dark:bg-slate-600 rounded" />
            <div class="flex gap-4">
              <div class="h-3 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-3 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- Account Card Skeleton -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div class="h-5 w-28 bg-gray-200 dark:bg-slate-600 rounded mb-6" />
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div class="space-y-2">
              <div class="h-3 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-5 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
            <div class="h-8 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="h-3 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-5 w-20 bg-gray-200 dark:bg-slate-600 rounded-full" />
            </div>
            <div class="space-y-2">
              <div class="h-3 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
              <div class="h-4 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed - this is a static skeleton
</script>
