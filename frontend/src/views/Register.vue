<template>
  <div class="register-page">
    <h2>Register</h2>
    <form @submit.prevent="submit">
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Password</label>
        <input v-model="password" type="password" required minlength="6" />
      </div>
      <div>
        <label>Confirm Password</label>
        <input v-model="confirmPassword" type="password" required minlength="6" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '#/store/auth.js';
import { register as registerApi } from '#/api/auth.js';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const router = useRouter();
const auth = useAuthStore();

const submit = async () => {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  try {
    loading.value = true;
    // สมัครผู้ใช้ใหม่
    await registerApi(email.value, password.value);

    // สมัครเสร็จ → login อัตโนมัติ
    await auth.loginUser(email.value, password.value);

    // ไปหน้าโปรไฟล์
    router.push('/profile');
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>