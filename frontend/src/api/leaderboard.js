import apiClient from './client';

const normalizeLeaders = (payload) => {
  if (!payload?.status || !Array.isArray(payload.data)) {
    throw new Error('Некорректный ответ сервера');
  }
  return payload.data;
};

export const fetchInfiniteLeaderboard = async (params = {}) => {
  const { data } = await apiClient.get('/leaderboard/infinite', { params });
  return normalizeLeaders(data);
};

export const fetchCollectionLeaderboard = async (collectionId, params = {}) => {
  const { data } = await apiClient.get(`/leaderboard/collection/${collectionId}`, { params });
  return normalizeLeaders(data);
};
