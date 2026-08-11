import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export const HomePage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si no está autenticado, sacarlo al login o landing
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/'); // Forzar redirección a la landing page al cerrar sesión
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-brand">
          <h2>V.I.T.A. Learning Hub</h2>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar Sesión
        </button>
      </header>

      <main className="home-main">
        <div className="welcome-card">
          <div className="user-avatar">
            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1>¡Bienvenido de nuevo, {user?.nombre || 'Usuario'}! 👋</h1>
          <p className="user-email">Estás conectado como: <strong>{user?.email || 'correo@ejemplo.com'}</strong></p>
          
          <div className="user-badges">
            <span className="badge">Rol: {user?.rol || 'Estudiante'}</span>
            <span className="badge active">Estado: Activo</span>
          </div>
        </div>

        <section className="modules-section">
          <h3>Módulos Activos</h3>
          <div className="modules-grid">
            <div className="module-card">
              <h4>V.I.T.A. Plataforma</h4>
              <p>Accede a tus cursos y capacitaciones interactivas.</p>
            </div>
            <div className="module-card">
              <h4>Mi Progreso</h4>
              <p>Revisa tus estadísticas y calificaciones actuales.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};