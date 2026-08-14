import api from './http';
import type {
  User,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileRequest,
} from '../types/auth';

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
 * Actualiza el perfil del usuario autenticado (/api/auth/me)
 */
export const updateProfileApi = async (payload: UpdateProfileRequest): Promise<User> => {
  const response = await api.put<User>('/auth/me', payload);
  return response.data;
};

/**
 * Sube la foto de perfil del usuario autenticado (/api/auth/me/photo)
 */
export const uploadProfilePhotoApi = async (file: File): Promise<{ fotoUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ fotoUrl: string }>('/auth/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Cambia la contraseña del usuario autenticado (/api/auth/change-password)
 */
export const changePasswordApi = async (
  payload: ChangePasswordRequest,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/change-password', payload);
  return response.data;
};

/**
 * Notifica el cierre de sesión al servidor (/api/auth/logout)
 */
export const logoutApi = async (): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/auth/logout');
  return response.data;
};