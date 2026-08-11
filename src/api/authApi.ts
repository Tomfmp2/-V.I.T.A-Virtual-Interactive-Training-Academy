import api from './http';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData: RegisterRequest): Promise<any> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};