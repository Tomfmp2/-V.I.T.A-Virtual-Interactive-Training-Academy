import api from './http';
import type { Level, LevelRequest } from '../types/level';

export const getLevelsApi = async (): Promise<Level[]> => {
  const response = await api.get<Level[]>('/levels');
  return response.data;
};

export const createLevelApi = async (payload: LevelRequest): Promise<Level> => {
  const response = await api.post<Level>('/levels', payload);
  return response.data;
};

export const updateLevelApi = async (id: number, payload: LevelRequest): Promise<Level> => {
  const response = await api.put<Level>(`/levels/${id}`, payload);
  return response.data;
};

export const deleteLevelApi = async (id: number): Promise<void> => {
  await api.delete(`/levels/${id}`);
};
