import { Link } from 'react-router-dom';
import './LandingFooter.css';

const year = new Date().getFullYear();

export const LandingFooter = () => {
  return (
    <footer className="vita-footer" aria-labelledby="vita-footer-heading">
      <div className="vita-footer-inner">
        <div className="vita-footer-brand">
          <Link to="/" className="vita-footer-mark" aria-label="VITA Learning Hub">
            <span className="vita-footer-mark-name" id="vita-footer-heading">
              VITA
            </span>
            <span className="vita-footer-mark-sub">Learning Hub</span>
          </Link>
          <p className="vita-footer-tagline">
            Formación técnica interactiva para estudiantes, instructores y administración.
          </p>
        </div>

        <nav className="vita-footer-col" aria-label="Navegación del sitio">
          <h3>Sitio</h3>
          <ul>
            <li>
              <a href="#inicio">Inicio</a>
            </li>
            <li>
              <a href="#programas">Áreas</a>
            </li>
            <li>
              <a href="#como-funciona">Cómo funciona</a>
            </li>
          </ul>
        </nav>

        <nav className="vita-footer-col" aria-label="Acceso">
          <h3>Acceso</h3>
          <ul>
            <li>
              <Link to="/login">Iniciar sesión</Link>
            </li>
            <li>
              <Link to="/register">Crear cuenta</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="vita-footer-bottom">
        <div className="vita-footer-bottom-inner">
          <p>© {year} VITA Learning Hub</p>
          <p>Proyecto académico · Campuslands</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
