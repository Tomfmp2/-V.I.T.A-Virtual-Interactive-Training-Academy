import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import BrandLogo from './BrandLogo';
import { UserNavCluster } from './UserNavCluster';
import './Navbar.css';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="vita-navbar" aria-label="Navegación principal">
      <div className="vita-navbar-inner">
        <Link to="/" className="vita-navbar-brand" aria-label="VITA Learning Hub">
          <BrandLogo />
        </Link>

        {isAuthenticated ? (
          <UserNavCluster />
        ) : (
          <div className="vita-navbar-actions">
            <Link to="/login" className="vita-navbar-ghost">
              Iniciar sesión
            </Link>
            <Link to="/register" className="vita-navbar-cta">
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
