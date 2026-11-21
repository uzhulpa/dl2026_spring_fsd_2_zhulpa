import apiClient from './client';

export const fetchCollections = async () => {
  const { data } = await apiClient.get('/collections');
  if (!data?.success || !Array.isArray(data.data)) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};

export const startCollectionSession = async (collectionId) => {
  const { data } = await apiClient.get(`/collections/${collectionId}/start`);
  if (!data?.success || !data.data) {
    throw new Error('Некорректный ответ сервера');
  }
  return data.data;
};
