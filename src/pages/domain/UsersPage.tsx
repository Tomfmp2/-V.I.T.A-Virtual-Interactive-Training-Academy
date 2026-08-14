import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRolesApi } from '../../api/rolesApi';
import {
  createUserApi,
  getUsersApi,
  updateUserRoleApi,
  updateUserStatusApi,
} from '../../api/usersApi';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { isAdminRole } from '../../utils/coursePermissions';
import type { Role } from '../../types/role';
import type { AdminUser, CreateUserRequest } from '../../types/user';
import './DomainShared.css';

const emptyCreateForm: CreateUserRequest = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: '',
};

export const UsersPage = () => {
  const { user } = useAuth();
  const canManageUsers = isAdminRole(user?.rol);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserRequest>(emptyCreateForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!canManageUsers) return;

    setIsLoading(true);
    setLoadError('');

    try {
      const [usersData, rolesData] = await Promise.all([getUsersApi(), getRolesApi()]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch {
      setLoadError('No se pudieron cargar los usuarios. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [canManageUsers]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!canManageUsers) {
    return (
      <section className="domain-page" aria-labelledby="users-title">
        <h1 id="users-title">Usuarios</h1>
        <div className="domain-alert domain-alert-error" role="alert">
          <strong>Acceso no permitido</strong>
          <span>No tienes permisos para realizar esta acción.</span>
        </div>
      </section>
    );
  }

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError('');

    try {
      await createUserApi(createForm);
      setFeedback(`Usuario "${createForm.nombre} ${createForm.apellido}" creado.`);
      setCreateForm(emptyCreateForm);
      setIsFormOpen(false);
      await loadData();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'No se pudo crear el usuario. Intenta de nuevo.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (target: AdminUser) => {
    setUpdatingUserId(target.id);
    setFeedback('');

    try {
      await updateUserStatusApi(target.id, { activo: !target.activo });
      setFeedback(
        `Usuario "${target.nombre} ${target.apellido}" ${target.activo ? 'desactivado' : 'activado'}.`,
      );
      await loadData();
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'No se pudo actualizar el estado del usuario.'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async (target: AdminUser, rol: string) => {
    if (rol === target.rol) return;

    setUpdatingUserId(target.id);
    setFeedback('');

    try {
      await updateUserRoleApi(target.id, { rol });
      setFeedback(`Rol de "${target.nombre} ${target.apellido}" actualizado.`);
      await loadData();
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'No se pudo actualizar el rol del usuario.'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <section className="domain-page" aria-labelledby="users-title">
      <header className="domain-heading">
        <div>
          <h1 id="users-title">Usuarios</h1>
          <p>Administra cuentas, roles y estado activo de los usuarios.</p>
        </div>
        <button
          type="button"
          className="domain-btn-primary"
          onClick={() => {
            setIsFormOpen((open) => !open);
            setSaveError('');
          }}
        >
          {isFormOpen ? 'Cerrar formulario' : 'Nuevo usuario'}
        </button>
      </header>

      {feedback && (
        <p className="domain-alert domain-alert-success" role="status">
          {feedback}
        </p>
      )}

      {isFormOpen && (
        <form className="domain-form" onSubmit={(event) => void handleCreateSubmit(event)}>
          <h2>Crear usuario</h2>

          <div className="domain-form-grid">
            <label className="domain-field">
              <span>Nombre</span>
              <input
                type="text"
                required
                value={createForm.nombre}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, nombre: event.target.value }))
                }
              />
            </label>

            <label className="domain-field">
              <span>Apellido</span>
              <input
                type="text"
                required
                value={createForm.apellido}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, apellido: event.target.value }))
                }
              />
            </label>

            <label className="domain-field">
              <span>Correo electrónico</span>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>

            <label className="domain-field">
              <span>Contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </label>

            <label className="domain-field">
              <span>Rol</span>
              <select
                required
                value={createForm.rol}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, rol: event.target.value }))
                }
              >
                <option value="">Selecciona un rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {saveError && (
            <p className="domain-inline-error" role="alert">
              {saveError}
            </p>
          )}

          <div className="domain-form-actions">
            <button
              type="button"
              className="domain-btn-ghost"
              onClick={() => {
                setIsFormOpen(false);
                setSaveError('');
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="domain-btn-primary" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="domain-state" role="status">
          Cargando usuarios…
        </p>
      ) : loadError ? (
        <div className="domain-alert domain-alert-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="domain-btn-ghost" onClick={() => void loadData()}>
            Reintentar
          </button>
        </div>
      ) : users.length === 0 ? (
        <p className="domain-state">Todavía no hay usuarios registrados.</p>
      ) : (
        <>
          <div className="domain-table-wrapper">
            <table className="domain-table">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Activo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.nombre} {item.apellido}
                    </td>
                    <td>{item.email}</td>
                    <td>
                      <select
                        value={item.rol}
                        disabled={updatingUserId === item.id}
                        onChange={(event) => void handleRoleChange(item, event.target.value)}
                        aria-label={`Rol de ${item.nombre}`}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={item.activo ? 'domain-btn-ghost' : 'domain-btn-primary'}
                        disabled={updatingUserId === item.id}
                        onClick={() => void handleToggleActive(item)}
                      >
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="domain-card-grid">
            {users.map((item) => (
              <article key={`card-${item.id}`} className="domain-card">
                <h2 className="domain-card-title">
                  {item.nombre} {item.apellido}
                </h2>
                <p className="domain-card-meta">{item.email}</p>
                <label className="domain-field">
                  <span>Rol</span>
                  <select
                    value={item.rol}
                    disabled={updatingUserId === item.id}
                    onChange={(event) => void handleRoleChange(item, event.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="domain-card-actions">
                  <button
                    type="button"
                    className={item.activo ? 'domain-btn-ghost' : 'domain-btn-primary'}
                    disabled={updatingUserId === item.id}
                    onClick={() => void handleToggleActive(item)}
                  >
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
