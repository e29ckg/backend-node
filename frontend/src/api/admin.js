import api from './axios';

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
