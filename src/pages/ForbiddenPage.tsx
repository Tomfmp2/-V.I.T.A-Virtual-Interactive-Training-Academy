import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from '../utils/coursePermissions';
import './ForbiddenPage.css';

export const ForbiddenPage = () => {
  const { user } = useAuth();
  const homePath = getRoleHomePath(user?.rol);

  return (
    <main className="forbidden-page">
      <section className="forbidden-card" aria-labelledby="forbidden-title">
        <p className="forbidden-code">403</p>
        <h1 id="forbidden-title">Acceso no permitido</h1>
        <p>No tienes permisos para acceder a esta sección.</p>
        <Link to={homePath ?? '/'}>Volver a mi inicio</Link>
      </section>
    </main>
  );
};
