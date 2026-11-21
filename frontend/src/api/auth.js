import apiClient from './client';

export const registerUser = async (payload) => {
  const response = await apiClient.post('/auth/registration', payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};
