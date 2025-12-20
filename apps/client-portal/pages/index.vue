<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();

if (authStore.isAuthenticated) {
  navigateTo('/dashboard');
} else {
  navigateTo('/login');
}
</script>
