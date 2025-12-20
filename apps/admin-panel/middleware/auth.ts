import { useAdminAuthStore } from '~/stores/adminAuth';

export default defineNuxtRouteMiddleware((to, from) => {
  const adminAuthStore = useAdminAuthStore();

  // Гидрация состояния из localStorage
  if (import.meta.client && !adminAuthStore.isAuthenticated) {
    adminAuthStore.hydrate();
  }

  // Публичные роуты
  const publicRoutes = ['/login', '/'];

  if (!adminAuthStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  if (adminAuthStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard');
  }
});
