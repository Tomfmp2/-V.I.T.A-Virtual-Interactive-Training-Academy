import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath, normalizePlatformRole } from '../utils/coursePermissions';
import BrandLogo from './BrandLogo';
import './Navbar.css';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  instructor: 'Instructor',
  estudiante: 'Estudiante',
};

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const role = normalizePlatformRole(user?.rol);
  const homePath = getRoleHomePath(user?.rol);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="vita-navbar" aria-label="Navegación principal">
      <div className="vita-navbar-inner">
        <Link to="/" className="vita-navbar-brand" aria-label="VITA Learning Hub">
          <BrandLogo />
        </Link>

        <div className="vita-navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="vita-navbar-role">
                {role ? roleLabels[role] : 'Sin rol'}
              </span>

              {homePath && (
                <Link to={homePath} className="vita-navbar-link">
                  Mi panel
                </Link>
              )}

              <button type="button" onClick={handleLogout} className="vita-navbar-ghost">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="vita-navbar-ghost">
                Iniciar sesión
              </Link>

              <Link to="/register" className="vita-navbar-cta">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
