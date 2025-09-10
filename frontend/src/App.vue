<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <router-link to="/">Home</router-link>

      <template v-if="!auth.accessToken">
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>

      <template v-else>
        <router-link to="/profile">Profile</router-link>
        <button @click="logout">Logout</button>

        <template v-if="auth.user?.role === 'admin'">
          <router-link to="/admin/users">Manage Users</router-link>
        </template>
      </template>
    </nav>

    <!-- Main content -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '#/store/auth.js';

const auth = useAuthStore();

// โหลดข้อมูลโปรไฟล์ถ้ามี token
onMounted(async () => {
  if (auth.accessToken && !auth.user) {
    try {
      await auth.fetchProfile();
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }
});

const logout = () => {
  auth.logout();
};
</script>

<style>
.navbar {
  display: flex;
  gap: 1rem;
  background: #f5f5f5;
  padding: 0.5rem 1rem;
}
.navbar a {
  text-decoration: none;
}
button {
  cursor: pointer;
}
</style>