import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { logoutApi } from '../api/authApi';
import { getRoleHomePath } from '../utils/coursePermissions';
import { getProfilePhotoUrl } from '../utils/profilePhoto';
import './UserNavCluster.css';

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M18 9C18 5.69 15.76 3.5 12 3.5C8.24 3.5 6 5.69 6 9C6 14 4 15 4 16.5H20C20 15 18 14 18 9Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M10 20H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const UserNavCluster = () => {
  const { user, photoVersion, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = [user?.nombre?.trim(), user?.apellido?.trim()].filter(Boolean).join(' ') || 'Usuario';
  const displayEmail = user?.email?.trim() || 'Correo no disponible';
  const displayRole = user?.rol?.trim() || 'No especificado';
  const profilePhotoUrl = getProfilePhotoUrl(user?.fotoUrl, photoVersion);
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const homePath = getRoleHomePath(user?.rol);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Logout local aunque falle la red.
    }
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="user-nav-cluster">
      <button type="button" className="user-nav-bell" aria-label="Notificaciones">
        <BellIcon />
      </button>

      <div ref={menuRef} className="user-menu">
        <button
          type="button"
          className="user-menu-trigger"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-controls="user-menu-dropdown"
        >
          <span className="user-menu-name-desktop">{displayName}</span>
          <span className="user-menu-avatar" aria-hidden="true">
            {profilePhotoUrl ? (
              <img className="user-menu-avatar-image" src={profilePhotoUrl} alt="" />
            ) : (
              avatarInitial
            )}
          </span>
        </button>

        {isOpen && (
          <div
            id="user-menu-dropdown"
            className="user-menu-dropdown"
            role="region"
            aria-label="Información del usuario"
          >
            <p className="user-menu-name">{displayName}</p>
            <p className="user-menu-email">{displayEmail}</p>
            <div className="user-menu-divider" />
            <p className="user-menu-role-label">Rol</p>
            <span className="user-menu-role">{displayRole}</span>
            <div className="user-menu-divider" />
            {homePath && (
              <Link to={homePath} className="user-menu-action" onClick={() => setIsOpen(false)}>
                Mi panel
              </Link>
            )}
            <button type="button" className="user-menu-action user-menu-action-danger" onClick={() => void handleLogout()}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
