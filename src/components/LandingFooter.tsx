import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import './LandingFooter.css';

const year = new Date().getFullYear();

export const LandingFooter = () => {
  return (
    <footer className="vita-footer" aria-labelledby="vita-footer-heading">
      <div className="vita-footer-glow" aria-hidden="true" />

      <div className="vita-footer-inner">
        <div className="vita-footer-brand">
          <h2 id="vita-footer-heading" className="vita-footer-sr-only">
            Pie de página VITA
          </h2>
          <Link to="/" className="vita-footer-logo" aria-label="VITA Learning Hub">
            <BrandLogo />
          </Link>
          <p className="vita-footer-tagline">
            Academia interactiva para formar en ingeniería de software con flujos reales de
            estudiante, instructor y administración.
          </p>
          <Link to="/register" className="vita-footer-cta">
            Empezar ahora
          </Link>
        </div>

        <nav className="vita-footer-col" aria-label="Navegación del sitio">
          <h3>Sitio</h3>
          <ul>
            <li>
              <a href="#inicio">Inicio</a>
            </li>
            <li>
              <a href="#programas">Áreas de formación</a>
            </li>
            <li>
              <a href="#como-funciona">Cómo funciona</a>
            </li>
          </ul>
        </nav>

        <nav className="vita-footer-col" aria-label="Acceso a la plataforma">
          <h3>Plataforma</h3>
          <ul>
            <li>
              <Link to="/login">Iniciar sesión</Link>
            </li>
            <li>
              <Link to="/register">Crear cuenta</Link>
            </li>
            <li>
              <Link to="/login">Acceso alumnos</Link>
            </li>
          </ul>
        </nav>

        <div className="vita-footer-col">
          <h3>Roles</h3>
          <ul className="vita-footer-roles">
            <li>
              <span className="vita-footer-role-dot" aria-hidden="true" />
              Estudiante · catálogo e inscripciones
            </li>
            <li>
              <span className="vita-footer-role-dot" aria-hidden="true" />
              Instructor · cursos y lecciones
            </li>
            <li>
              <span className="vita-footer-role-dot" aria-hidden="true" />
              Admin · usuarios y reportes
            </li>
          </ul>
        </div>
      </div>

      <div className="vita-footer-bottom">
        <div className="vita-footer-bottom-inner">
          <p>© {year} VITA Learning Hub. Formación técnica interactiva.</p>
          <p className="vita-footer-bottom-note">Proyecto académico · Campuslands</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
