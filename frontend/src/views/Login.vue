<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="submit">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button>Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '#/store/auth.js';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const submit = async () => {
  try {
    await auth.loginUser(email.value, password.value);
    router.push('/profile');
  } catch (err) {
    alert(err.response?.data?.error || 'Login failed');
  }
};
</script>