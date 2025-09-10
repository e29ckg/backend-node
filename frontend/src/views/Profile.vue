<template>
  <div>
    <h2>My Profile</h2>
    <div v-if="auth.user">
      <img :src="fullAvatarUrl" alt="avatar" width="100" />
      <p>{{ auth.user.email }}</p>
      <p>{{ auth.user.bio }}</p>
    </div>

    <form @submit.prevent="update">
      <input v-model="bio" placeholder="Bio" />
      <input type="file" @change="onFileChange" />
      <button>Update</button>
    </form>
    {{ auth.user }}
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '#/store/auth.js';
import { uploadAvatarAndBio } from '#/api/auth.js';

const fullAvatarUrl = computed(() => {
  return auth.user?.avatar_url
    ? `${import.meta.env.VITE_API_BASE}${auth.user.avatar_url}`
    : '/default-avatar.png';
});


const auth = useAuthStore();
const bio = ref(auth.user?.bio || '');
const file = ref(null);

const onFileChange = (e) => {
  file.value = e.target.files[0];
};

const update = async () => {
  const formData = new FormData();
  if (file.value) formData.append('avatar', file.value);
  formData.append('bio', bio.value);
  await uploadAvatarAndBio(formData);
  await auth.fetchProfile();
};
</script>