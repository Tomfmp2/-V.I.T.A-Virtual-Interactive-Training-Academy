import api from './http';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData: RegisterRequest): Promise<any> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Obtiene la información del usuario autenticado actual (/api/auth/me)
 */
export const getMeApi = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

/**
 * Notifica el cierre de sesión al servidor (/api/auth/logout)
 */
export const logoutApi = async (): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/logout');
  return response.data;
};