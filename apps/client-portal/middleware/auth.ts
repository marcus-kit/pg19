import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Гидрация состояния из localStorage (всегда на клиенте, т.к. SSR не имеет доступа к localStorage)
  if (import.meta.client) {
    authStore.hydrate();
  }

  // Публичные роуты
  const publicRoutes = ['/login', '/'];

  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard');
  }
});
