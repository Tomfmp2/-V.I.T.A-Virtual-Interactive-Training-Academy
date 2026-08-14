import api from './http';
import type { Role } from '../types/role';

export const getRolesApi = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>('/roles');
  return response.data;
};
