export interface User {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  activo?: boolean;
  fotoUrl?: string | null;
  telefono?: string | null;
  codigoPais?: string | null;
}

export interface UpdateProfileRequest {
  nombre: string;
  apellido: string;
  telefono?: string | null;
  codigoPais?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiraEn: number;
  usuario: User;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}