import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { PerfilPage } from './PerfilPage';
import { CategoriesPage } from './admin/CategoriesPage';
import { ExploreCoursesPage } from './domain/ExploreCoursesPage';
import { MyEnrollmentsPage } from './domain/MyEnrollmentsPage';
import { ManageCoursesPage } from './domain/ManageCoursesPage';
import { UsersPage } from './domain/UsersPage';
import { ReportsPage } from './domain/ReportsPage';
import { StudentDashboard } from './dashboard/StudentDashboard';
import { InstructorDashboard } from './dashboard/InstructorDashboard';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { logoutApi } from '../api/authApi';
import { normalizePlatformRole } from '../utils/coursePermissions';
import { getRoleAreaLabel, getRoleNavItems } from '../utils/roleNavigation';
import './HomePage.css';

type IconName =
  | 'dashboard'
  | 'courses'
  | 'explore'
  | 'users'
  | 'categories'
  | 'reports'
  | 'settings'
  | 'logout'
  | 'search'
  | 'bell'
  | 'book'
  | 'award'
  | 'clock'
  | 'arrow'
  | 'menu';

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

    case 'reports':
      return (
        <svg {...commonProps}>
          <path d="M4 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 19H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 15V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 15V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 15V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'menu':
      return (
        <svg {...commonProps}>
          <path d="M4 7H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'users':
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 20C3.5 16.9 6 14.5 9 14.5C12 14.5 14.5 16.9 14.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 5.5C17.7 5.5 19 6.8 19 8.5C19 10.2 17.7 11.5 16 11.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M17.5 14.8C19.6 15.5 21 17.5 21 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );

    case 'categories':
      return (
        <svg {...commonProps}>
          <path
            d="M4 6.5C4 5.67 4.67 5 5.5 5H10L12 7.5H18.5C19.33 7.5 20 8.17 20 9V17.5C20 18.33 19.33 19 18.5 19H5.5C4.67 19 4 18.33 4 17.5V6.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 12.5H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
  const platformRole = normalizePlatformRole(user?.rol);

  const [active, setActive] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openCreateCourse, setOpenCreateCourse] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userWithLastName = user as (typeof user & { apellido?: string }) | null;
  const displayName = [user?.nombre?.trim(), userWithLastName?.apellido?.trim()]
    .filter(Boolean)
    .join(' ') || 'Usuario';
  const displayEmail = user?.email?.trim() || 'Correo no disponible';
  const displayRole = user?.rol?.trim() || 'No especificado';
  const navItems = getRoleNavItems(user?.rol);
  const areaLabel = getRoleAreaLabel(user?.rol);

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
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', closeUserMenu);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeUserMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Logout stateless: limpiar sesión local aunque falle la red.
    }
    logout();
    navigate('/login');
  };

  const handleNavClick = (
    itemId: string,
    options?: { openCreateCourse?: boolean },
  ) => {
    setOpenCreateCourse(Boolean(options?.openCreateCourse));
    setActive(itemId);
    setIsSidebarOpen(false);
    if (itemId === 'dashboard' || itemId === 'my-courses') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderMainContent = () => {
    if (active === 'categories') return <CategoriesPage />;
    if (active === 'settings') return <PerfilPage />;
    if (active === 'explore') {
      return (
        <ExploreCoursesPage
          mode={platformRole === 'estudiante' ? 'enroll' : 'browse'}
        />
      );
    }
    if (active === 'users') return <UsersPage />;
    if (active === 'reports') return <ReportsPage />;
    if (active === 'my-courses') {
      if (platformRole === 'estudiante') return <MyEnrollmentsPage />;
      if (platformRole === 'instructor') {
        return (
          <ManageCoursesPage
            variant="instructor"
            initialOpenCreate={openCreateCourse}
          />
        );
      }
      if (platformRole === 'admin') {
        return (
          <ManageCoursesPage variant="admin" initialOpenCreate={openCreateCourse} />
        );
      }
    }

    if (platformRole === 'estudiante') {
      return <StudentDashboard onNavigate={handleNavClick} />;
    }
    if (platformRole === 'instructor') {
      return <InstructorDashboard onNavigate={handleNavClick} />;
    }
    if (platformRole === 'admin') {
      return <AdminDashboard onNavigate={handleNavClick} />;
    }

    return (
      <section className="greeting">
        <h1>¡Hola, {user?.nombre || 'Usuario'}!</h1>
        <p className="greeting-sub">{areaLabel}</p>
      </section>
    );
  };

  return (
    <div className={`home-container dashboard-root ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}
      >
        <div className="sidebar-top">
          <BrandLogo />
          <p className="sidebar-area" aria-label="Área asignada">
            {areaLabel}
          </p>
          <nav className="sidebar-nav" aria-label="Menú por rol">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${active === item.id ? 'active' : ''}`}
                aria-current={active === item.id ? 'page' : undefined}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon">
                  <Icon name={item.icon} size={17} />
                </span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item logout"
            onClick={() => void handleLogout()}
          >
            <span className="nav-icon">
              <Icon name="logout" size={17} />
            </span>
            <span className="nav-label">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="dashboard-header relative flex h-17.5 items-center justify-between gap-3 px-4 sm:px-8">
          <button
            type="button"
            className="sidebar-toggle"
            aria-label="Abrir menú"
            aria-expanded={isSidebarOpen}
            aria-controls="dashboard-sidebar"
            onClick={() => setIsSidebarOpen((open) => !open)}
          >
            <Icon name="menu" size={20} />
          </button>

          <div className="header-search grow max-w-xl">
            <input
              type="text"
              placeholder="Buscar cursos..."
              aria-label="Buscar cursos"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-cyan-400/20 bg-[#0B1220] py-2 pl-3 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400"
              aria-label="Notificaciones"
            >
              <Icon name="bell" size={17} />
            </button>

            <div ref={userMenuRef} className="user-menu">
              <button
                type="button"
                className="user-menu-trigger"
                onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-controls="user-menu-dropdown"
              >
                <div className="user-menu-name-desktop text-sm font-medium text-slate-200">
                  {displayName}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 font-semibold text-cyan-400">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </button>

              {isUserMenuOpen && (
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
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">{renderMainContent()}</main>
      </div>
    </div>
  );
};
