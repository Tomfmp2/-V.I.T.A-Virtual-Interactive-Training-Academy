import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import './LoginBrandPanel.css';

type LoginBrandPanelProps = {
  mode?: 'login' | 'register';
};

export const LoginBrandPanel = ({ mode = 'login' }: LoginBrandPanelProps) => {
  const isRegister = mode === 'register';

  return (
    <aside className={`login-left-panel ${isRegister ? 'is-register' : 'is-login'}`}>
      <div className="login-left-media" aria-hidden="true" />
      <div className="login-left-shade" aria-hidden="true" />

      <div className="login-left-content">
        <div className="login-left-top">
          <Link to="/" className="login-brand-mark" aria-label="Ir a la página de inicio de VITA">
            <BrandLogo />
          </Link>
          <p className="login-left-kicker">Virtual Interactive Training Academy</p>
        </div>

        <div className="login-left-welcome">
          <h1 className="brand-heading">
            {isRegister ? 'Empieza tu ruta en VITA' : 'Continúa en VITA'}
          </h1>
          <p className="brand-copy">
            {isRegister
              ? 'Crea tu cuenta y entra al catálogo de cursos, lecciones e inscripciones de la academia.'
              : 'Accede a tu panel para seguir cursos, gestionar clases o administrar la plataforma.'}
          </p>

          <ul className="login-left-points">
            <li>Estudiante · explorar e inscribirse</li>
            <li>Instructor · cursos y lecciones</li>
            <li>Admin · usuarios y reportes</li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default LoginBrandPanel;
