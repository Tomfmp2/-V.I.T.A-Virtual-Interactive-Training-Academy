export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;i
  expiraEn: number;
  usuario: User;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}