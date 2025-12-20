<template>
  <div />
</template>

<script setup lang="ts">
import { useAdminAuthStore } from '~/stores/adminAuth';

definePageMeta({
  middleware: 'auth',
});

const adminAuthStore = useAdminAuthStore();

if (adminAuthStore.isAuthenticated) {
  navigateTo('/dashboard');
} else {
  navigateTo('/login');
}
</script>
