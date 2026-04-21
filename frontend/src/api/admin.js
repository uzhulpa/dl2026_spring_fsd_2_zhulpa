import apiClient from './client';

export const fetchAdminQuestions = async (params = {}) => {
  const { data } = await apiClient.get('/admin/questions', { params });
  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};

export const fetchAdminQuestionById = async (questionId) => {
  const { data } = await apiClient.get(`/admin/questions/${questionId}`);
  if (!data?.success || !data.data) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};

export const updateAdminQuestionById = async (questionId, payload) => {
  const { data } = await apiClient.put(`/admin/questions/${questionId}`, payload);
  if (!data?.success || !data.data) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};

export const createAdminQuestion = async (payload) => {
  const { data } = await apiClient.post('/admin/questions', payload);
  if (!data?.success || !data.data) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};

export const fetchAdminCollections = async (params = {}) => {
  const { data } = await apiClient.get('/admin/collections', { params });
  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};

export const fetchAdminCollectionById = async (collectionId) => {
  const { data } = await apiClient.get(`/admin/collections/${collectionId}`);
  if (!data?.success || !data.data) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};
