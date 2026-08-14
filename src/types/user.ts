/** Espejo de Vita.Api Dtos/Users */
export interface AdminUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface CreateUserRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
}

export interface UpdateUserRequest {
  nombre: string;
  apellido: string;
  email: string;
}

export interface UpdateUserStatusRequest {
  activo: boolean;
}

export interface UpdateUserRoleRequest {
  rol: string;
}
