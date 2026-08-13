import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { PerfilPage } from './PerfilPage';
import { getCoursePermissions, normalizePlatformRole } from '../utils/coursePermissions';
import './HomePage.css';

type IconName =
  | 'dashboard'
  | 'courses'
  | 'explore'
  | 'certificate'
  | 'settings'
  | 'logout'
  | 'search'
  | 'bell'
  | 'book'
  | 'award'
  | 'clock'
  | 'arrow';

interface IconProps {
  name: IconName;
  size?: number;
}

const Icon = ({ name, size = 18 }: IconProps) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case 'courses':
      return (
        <svg {...commonProps}>
          <path
            d="M4 5.5C4 4.67 4.67 4 5.5 4H20V18H5.5C4.67 18 4 18.67 4 19.5V5.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M4 19.5C4 18.67 4.67 18 5.5 18H20V20H5.5C4.67 20 4 19.33 4 18.5V19.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 8H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 12H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'explore':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8.5 13.5L10 10L13.5 8.5L12 12L8.5 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case 'certificate':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M9.5 14L8.5 21L12 19L15.5 21L14.5 14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9.5 9L11 10.5L14.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'settings':
      return (
        <svg {...commonProps}>
          <path
            d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 0 0 12 8.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19.4 15A1.7 1.7 0 0 0 19.74 16.87L19.8 16.93L17.93 18.8L17.87 18.74A1.7 1.7 0 0 0 16 18.4A1.7 1.7 0 0 0 15 19.9V20H9V19.9A1.7 1.7 0 0 0 8 18.4A1.7 1.7 0 0 0 6.13 18.74L6.07 18.8L4.2 16.93L4.26 16.87A1.7 1.7 0 0 0 4.6 15A1.7 1.7 0 0 0 3.1 14H3V10H3.1A1.7 1.7 0 0 0 4.6 9A1.7 1.7 0 0 0 4.26 7.13L4.2 7.07L6.07 5.2L6.13 5.26A1.7 1.7 0 0 0 8 5.6A1.7 1.7 0 0 0 9 4.1V4H15V4.1A1.7 1.7 0 0 0 16 5.6A1.7 1.7 0 0 0 17.87 5.26L17.93 5.2L19.8 7.07L19.74 7.13A1.7 1.7 0 0 0 19.4 9A1.7 1.7 0 0 0 20.9 10H21V14H20.9A1.7 1.7 0 0 0 19.4 15Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'logout':
      return (
        <svg {...commonProps}>
          <path
            d="M10 4H6.5C5.67 4 5 4.67 5 5.5V18.5C5 19.33 5.67 20 6.5 20H10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M13 8L17 12L13 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="10.8" cy="10.8" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...commonProps}>
          <path
            d="M18 9C18 5.69 15.76 3.5 12 3.5C8.24 3.5 6 5.69 6 9C6 14 4 15 4 16.5H20C20 15 18 14 18 9Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M10 20H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'book':
      return (
        <svg {...commonProps}>
          <path d="M5 4H19V20H5C4.45 20 4 19.55 4 19V5C4 4.45 4.45 4 5 4Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 8H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M8 12H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'award':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 14L8 21L12 18.8L16 21L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 6.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9.5 9H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...commonProps}>
          <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14 7L19 12L14 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    default:
      return null;
  }
};

export const HomePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [courseAccessMessage, setCourseAccessMessage] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userWithLastName = user as (typeof user & { apellido?: string }) | null;
  const displayName = [user?.nombre?.trim(), userWithLastName?.apellido?.trim()]
    .filter(Boolean)
    .join(' ') || 'Usuario';
  const displayEmail = user?.email?.trim() || 'Correo no disponible';
  const displayRole = user?.rol?.trim() || 'No especificado';
  const coursePermissions = getCoursePermissions(user?.rol);
  const userRole = normalizePlatformRole(user?.rol);
  const isStaff = userRole === 'admin' || userRole === 'instructor';

  // Protege el Dashboard.
  // Si no existe una sesión activa, vuelve a Login.
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const closeUserMenu = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeUserMenu);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeUserMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = {
    inProgress: 3,
    certificates: 2,
    hours: 47,
  };

  const courses = [
    {
      id: 'c1',
      category: 'DESARROLLO',
      title: 'Desarrollo Web Fullstack',
      teacher: 'Carlos Rodríguez',
      progress: 75,
      image: '/src/assets/imagen-fondo-1.jpg',
    },
    {
      id: 'c2',
      category: 'DESARROLLO',
      title: 'Diseño de Interfaces UX/UI',
      teacher: 'Sofía Martínez',
      progress: 40,
      image: '/src/assets/imagen-fondo-1.jpg',
    },
    {
      id: 'c3',
      category: 'DESARROLLO',
      title: 'Introducción a Data Science',
      teacher: 'Luis Ramírez',
      progress: 15,
      image: '/src/assets/imagen-fondo-1.jpg',
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      course.title.toLowerCase().includes(search) ||
      course.category.toLowerCase().includes(search) ||
      course.teacher.toLowerCase().includes(search)
    );
  });

  const handleContinue = (courseId: string) => {
    if (!coursePermissions.enterCourse) {
      setCourseAccessMessage('No tienes permisos para realizar esta acción.');
      return;
    }

    setCourseAccessMessage('');
    console.log('Continuar curso:', courseId);

    // Mantiene la ruta actual existente.
    // Cuando exista una ruta específica de curso,
    // puede sustituirse por esa ruta.
    navigate('/home');
  };

  const scrollToTop = () => {
    setActive('dashboard');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToCourses = () => {
    setActive('my-courses');

    document
      .getElementById('continuar-aprendiendo')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  return (
    <div className="home-container dashboard-root">

      {/* =========================================
          SIDEBAR
      ========================================== */}
      <aside className="sidebar">

        <div className="sidebar-top">
          <BrandLogo />
        

        <nav className="sidebar-nav">

          <button
            type="button"
            className={`nav-item ${
              active === 'dashboard' ? 'active' : ''
            }`}
            onClick={scrollToTop}
          >
            <span className="nav-icon">
              <Icon name="dashboard" size={17} />
            </span>

            <span className="nav-label">
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              active === 'my-courses' ? 'active' : ''
            }`}
            onClick={scrollToCourses}
          >
            <span className="nav-icon">
              <Icon name="courses" size={17} />
            </span>

            <span className="nav-label">
              Mis Cursos
            </span>
          </button>

          {isStaff && <button
            type="button"
            className={`nav-item ${
              active === 'explore' ? 'active' : ''
            }`}
            onClick={() => setActive('explore')}
          >
            <span className="nav-icon">
              <Icon name="explore" size={17} />
            </span>

            <span className="nav-label">
              Explorar
            </span>
          </button>}

          {isStaff && <button
            type="button"
            className={`nav-item ${
              active === 'certs' ? 'active' : ''
            }`}
            onClick={() => setActive('certs')}
          >
            <span className="nav-icon">
              <Icon name="certificate" size={17} />
            </span>

            <span className="nav-label">
              Certificados
            </span>
          </button>}

          <button
            type="button"
            className={`nav-item ${
              active === 'settings' ? 'active' : ''
            }`}
            onClick={() => setActive('settings')}
          >
            <span className="nav-icon">
              <Icon name="settings" size={17} />
            </span>

            <span className="nav-label">
              Configuración
            </span>
          </button>

        </nav>
        </div>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span className="nav-icon">
              <Icon name="logout" size={17} />
            </span>

            <span className="nav-label">
              Cerrar Sesión
            </span>
          </button>

        </div>
      </aside>


      {/* =========================================
          MAIN AREA
      ========================================== */}
      <div className="main-area">

        {/* =========================================
            TOP HEADER
        ========================================== */}
<header className="dashboard-header relative flex h-17.5 items-center justify-between px-8">
  
  {/* 1. BUSCADOR CENTRADO (Hijo directo del header con absolute) */}
  <div className="absolute left-1/2 w-300.5 -translate-x-1/2">
    <div className="relative">
      


      <input
        type="text"
        placeholder="Buscar cursos..."
        aria-label="Buscar cursos"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="w-full rounded-lg border border-cyan-400/20 bg-[#0B1220] py-2 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
      />

    </div>
  </div>

  {/* 2. ESPACIADOR VACÍO A LA IZQUIERDA (Para equilibrar el flexbox) */}
  <div></div>

  {/* 3. PERFIL Y NOTIFICACIONES (A la derecha gracias a justify-between) */}
  <div className="flex items-center gap-4 ml-auto !important "> 
    
    {/* NOTIFICATIONS */}
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400"
      aria-label="Notificaciones"
    >
      <Icon name="bell" size={17} />
    </button>

    {/* PROFILE */}
    <div ref={userMenuRef} className="user-menu">
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
        aria-expanded={isUserMenuOpen}
        aria-haspopup="true"
        aria-controls="user-menu-dropdown"
      >
      <div className="text-sm font-medium text-slate-200">
        {displayName}
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 font-semibold text-cyan-400">
        {displayName.charAt(0).toUpperCase()}
      </div>
      </button>

      {isUserMenuOpen && (
        <div id="user-menu-dropdown" className="user-menu-dropdown" role="region" aria-label="Información del usuario">
          <p className="user-menu-name">{displayName}</p>
          <p className="user-menu-email">{displayEmail}</p>
          <div className="user-menu-divider" />
          <p className="user-menu-role-label">Rol</p>
          <span className="user-menu-role">{displayRole}</span>
        </div>
      )}
    </div>

    <div>
    </div>

  </div>

</header>


        {/* =========================================
            CONTENT
        ========================================== */}
        <main className="content">

          {active === 'settings' ? (
            <PerfilPage />
          ) : (
            <>

          {/* GREETING */}
          <section className="greeting">

            <h1>
              ¡Hola, {user?.nombre || 'Estudiante'}!
            </h1>

            <p className="greeting-sub">
              Tienes un excelente avance esta semana.
              Sigue así y completa tus metas.
            </p>

          </section>


          {/* =========================================
              STATISTICS
          ========================================== */}
          <section className="stats-row">

            <div className="stat-card">

              <div className="stat-icon">
                <Icon name="book" size={18} />
              </div>

              <div className="stat-content">

                <div className="stat-meta">
                  Cursos en Progreso
                </div>

                <div className="stat-value">
                  {stats.inProgress}
                </div>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                <Icon name="award" size={18} />
              </div>

              <div className="stat-content">

                <div className="stat-meta">
                  Certificados Obtenidos
                </div>

                <div className="stat-value">
                  {stats.certificates}
                </div>

              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                <Icon name="clock" size={18} />
              </div>

              <div className="stat-content">

                <div className="stat-meta">
                  Horas de Estudio
                </div>

                <div className="stat-value">
                  {stats.hours} hrs
                </div>

              </div>

            </div>

          </section>


          {/* =========================================
              CONTINUAR APRENDIENDO
          ========================================== */}
          <section
            id="continuar-aprendiendo"
            className="continue-section"
          >

            <div className="section-heading">

              <h3>
                Continuar Aprendiendo
              </h3>

            </div>


            <div className="courses-grid">

              {coursePermissions.viewCourse && filteredCourses.length > 0 ? (

                filteredCourses.map((course) => (

                  <article
                    key={course.id}
                    className="course-card"
                  >

                    {/* COURSE IMAGE */}
                    <div className="course-image-wrapper">

                      <img
                        src={course.image}
                        alt={course.title}
                        className="course-image"
                      />

                    </div>


                    {/* COURSE CONTENT */}
                    <div className="course-body">

                      <div className="course-category">
                        {course.category}
                      </div>

                      <h4 className="course-title">
                        {course.title}
                      </h4>

                      <div className="course-teacher">
                        Por {course.teacher}
                      </div>


                      {/* PROGRESS */}
                      <div className="progress-row">

                        <div className="progress-container">

                          <div className="progress-label">
                            Progreso
                          </div>

                          <div className="progress-bar">

                            <div
                              className="progress-fill"
                              style={{
                                width: `${course.progress}%`,
                              }}
                            />

                          </div>

                        </div>

                        <div className="progress-percent">
                          {course.progress}%
                        </div>

                      </div>


                      {/* CONTINUE */}
                      <button
                        type="button"
                        className="continue-btn"
                        onClick={() =>
                          handleContinue(course.id)
                        }
                      >
                        <span>
                          Continuar
                        </span>

                        <Icon
                          name="arrow"
                          size={15}
                        />
                      </button>

                    </div>

                  </article>

                ))

              ) : coursePermissions.viewCourse ? (

                <div className="no-courses">
                  No se encontraron cursos.
                </div>

              ) : (

                <div className="no-courses" role="alert">
                  <strong>Acceso no permitido</strong>
                  <span>No tienes permisos para realizar esta acción.</span>
                </div>

              )}

              {courseAccessMessage && (
                <p className="course-access-message" role="alert">{courseAccessMessage}</p>
              )}

            </div>

          </section>

            </>
          )}

        </main>

      </div>

    </div>
  );
};
