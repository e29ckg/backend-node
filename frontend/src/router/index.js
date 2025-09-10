import { createRouter, createWebHistory } from 'vue-router';
import Login from '#/views/Login.vue';
import Register from '#/views/Register.vue';
import Profile from '#/views/Profile.vue';
import AdminUsers from '#/views/AdminUsers.vue';
import { useAuthStore } from '#/store/auth.js';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/admin/users', component: AdminUsers, meta: { requiresAuth: true, requiresRole: 'admin' } }


];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.accessToken) {
    return next('/login');
  }
  if (to.meta.requiresRole && auth.user?.role !== to.meta.requiresRole) {
    return next('/profile');
  }
  next();
});

export default router;