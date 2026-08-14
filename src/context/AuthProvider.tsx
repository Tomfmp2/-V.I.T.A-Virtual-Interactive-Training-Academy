import React, { useCallback, useEffect, useState } from 'react';
import { setUnauthorizedHandler } from '../api/http';
import type { User } from '../types/auth';
import { AuthContext } from './authContext';

/** Datos de sesión en localStorage — sin foto ni teléfono (vienen del API). */
function toSessionUser(user: User): User {
  const { fotoUrl: _foto, telefono: _tel, codigoPais: _pais, ...session } = user;
  return session;
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [photoVersion, setPhotoVersion] = useState(0);

  const login = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(toSessionUser(nextUser)));
    setToken(nextToken);
    setUser(nextUser);
    setPhotoVersion(0);
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(toSessionUser(nextUser)));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPhotoVersion(0);
    setIsAuthenticated(false);
  }, []);

  // Invalida la caché del navegador cuando cambia la foto de perfil.
  useEffect(() => {
    setPhotoVersion((version) => version + 1);
  }, [user?.fotoUrl]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, photoVersion, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
