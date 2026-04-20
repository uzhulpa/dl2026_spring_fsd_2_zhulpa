import apiClient from './client';

export const fetchInfiniteQuestion = async () => {
  const { data } = await apiClient.get('/game/infinite/question');
  return data;
};

export const submitInfiniteAnswer = async (payload) => {
  const { data } = await apiClient.post('/game/infinite/answer', payload);
  return data;
};

export const submitCollectionAnswer = async (payload) => {
  const { data } = await apiClient.post('/game/collection/answer', payload);
  return data;
};
