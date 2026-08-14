import api from './http';
import type {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
} from '../types/user';

export const getUsersApi = async (): Promise<AdminUser[]> => {
  const response = await api.get<AdminUser[]>('/users');
  return response.data;
};

export const getUserByIdApi = async (id: string): Promise<AdminUser> => {
  const response = await api.get<AdminUser>(`/users/${id}`);
  return response.data;
};

export const createUserApi = async (payload: CreateUserRequest): Promise<AdminUser> => {
  const response = await api.post<AdminUser>('/users', payload);
  return response.data;
};

export const updateUserApi = async (id: string, payload: UpdateUserRequest): Promise<AdminUser> => {
  const response = await api.put<AdminUser>(`/users/${id}`, payload);
  return response.data;
};

export const updateUserStatusApi = async (
  id: string,
  payload: UpdateUserStatusRequest,
): Promise<AdminUser> => {
  const response = await api.patch<AdminUser>(`/users/${id}/status`, payload);
  return response.data;
};

export const updateUserRoleApi = async (
  id: string,
  payload: UpdateUserRoleRequest,
): Promise<AdminUser> => {
  const response = await api.patch<AdminUser>(`/users/${id}/role`, payload);
  return response.data;
};
