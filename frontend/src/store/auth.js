import { defineStore } from 'pinia';
import api from '../api/axios';
import { login as loginApi, refreshToken as refreshApi, getProfile } from '../api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null
  }),
  actions: {
    async loginUser(email, password) {
      const res = await loginApi(email, password);
      this.accessToken = res.data.accessToken;
      this.refreshToken = res.data.refreshToken;
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      await this.fetchProfile();
    },
    async fetchProfile() {
      const res = await getProfile();
      this.user = res.data;
    },
    async refreshAccess() {
      const res = await refreshApi(this.refreshToken);
      this.accessToken = res.data.accessToken;
      this.refreshToken = res.data.refreshToken;
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      return { accessToken: this.accessToken, refreshToken: this.refreshToken };
    },
    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
});