<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <slot />
    </main>

    <AppFooter company-name="PG19" />
  </div>
</template>

<script setup lang="ts">
import { AppFooter } from '@pg19/ui';
</script>
