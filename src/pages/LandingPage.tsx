import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Navbar } from '../components/Navbar';
import BrandLogo from '../components/BrandLogo';
import { LandingFooter } from '../components/LandingFooter';
import { getRoleHomePath } from '../utils/coursePermissions';
import './LandingPage.css';

const tracks = [
  {
    name: 'Programación',
    detail: 'Python, JavaScript, .NET, React y bases de datos con práctica guiada.',
  },
  {
    name: 'Diseño',
    detail: 'UI, branding y accesibilidad aplicados a productos educativos reales.',
  },
  {
    name: 'Marketing Digital',
    detail: 'SEO, growth y métricas para academias y productos digitales.',
  },
];

const roles = [
  {
    title: 'Estudiante',
    body: 'Explora el catálogo, inscríbete y sigue tus cursos desde el panel.',
  },
  {
    title: 'Instructor',
    body: 'Crea cursos, publica lecciones y revisa inscritos en tus clases.',
  },
  {
    title: 'Admin',
    body: 'Gestiona usuarios, categorías y reportes de la plataforma.',
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getRoleHomePath(user?.rol) ?? '/estudiante', { replace: true });
    }
  }, [isAuthenticated, navigate, user?.rol]);

  return (
    <>
      <header className="navigationBar">
        <Navbar />
      </header>

      <div className="landingPage landingPage--v2">
        <section className="landing-hero" id="inicio" aria-labelledby="landing-hero-title">
          <div className="landing-hero-copy">
            <div className="landing-brand-lockup" aria-hidden={false}>
              <BrandLogo />
            </div>
            <p className="landing-kicker">Virtual Interactive Training Academy</p>
            <h1 id="landing-hero-title">
              Entrena ingeniería de software con estándares de industria
            </h1>
            <p className="landing-lead">
              VITA conecta estudiantes, instructores y administración en una sola academia:
              cursos publicados, lecciones por módulo e inscripciones reales.
            </p>
            <div className="ctaGroup">
              <button
                type="button"
                className="primaryButton"
                onClick={() => navigate('/register')}
              >
                Crear cuenta
              </button>
              <button
                type="button"
                className="secondaryButton"
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </button>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <div className="landing-hero-panel">
              <span className="landing-hero-panel-label">Panel VITA</span>
              <strong>Cursos · Lecciones · Reportes</strong>
              <p>Dark academy con flujos claros por rol, sin plantillas genéricas.</p>
              <ul>
                <li>Catálogo publicado para estudiantes</li>
                <li>Gestor de lecciones para instructores</li>
                <li>Reportes M8 para administración</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="landing-section" id="programas" aria-labelledby="tracks-title">
          <div className="landing-section-head">
            <h2 id="tracks-title">Áreas de formación</h2>
            <p>Las mismas categorías que vive el catálogo dentro de la plataforma.</p>
          </div>
          <div className="landing-tracks">
            {tracks.map((track) => (
              <article key={track.name} className="landing-track">
                <h3>{track.name}</h3>
                <p>{track.detail}</p>
              </article>
            ))}
          </div>
          <div className="landing-section-cta">
            <button
              type="button"
              className="primaryButton"
              onClick={() => navigate('/register')}
            >
              Entrar al catálogo
            </button>
          </div>
        </section>

        <section className="landing-section landing-section--alt" id="como-funciona">
          <div className="landing-section-head">
            <h2>Cómo funciona</h2>
            <p>Una plataforma, tres roles, un flujo completo de academia.</p>
          </div>
          <div className="landing-roles">
            {roles.map((role) => (
              <article key={role.title} className="landing-role">
                <h3>{role.title}</h3>
                <p>{role.body}</p>
              </article>
            ))}
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
};
