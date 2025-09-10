import api from './axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (email, password) =>
  api.post('/auth/register', { email, password });

export const refreshToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken });

export const getProfile = () =>
  api.get('/profile/me');

export const getUsers = () =>
  api.get('/users');  


export const updateProfile = (data) =>
  api.put('/profile/me', data);

export const uploadAvatarAndBio = (formData) =>
  api.post('/profile/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
