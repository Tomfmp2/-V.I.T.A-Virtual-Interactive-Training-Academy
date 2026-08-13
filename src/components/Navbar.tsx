import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleHomePath, normalizePlatformRole } from "../utils/coursePermissions";
import BrandLogo from "./BrandLogo";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  instructor: "Instructor",
  estudiante: "Estudiante",
};

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const role = normalizePlatformRole(user?.rol);
  const homePath = getRoleHomePath(user?.rol);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between relative">
      <div className="flex items-center gap-2">
        <BrandLogo />
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {role ? roleLabels[role] : "Sin rol"}
            </span>

            {homePath && (
              <Link
                to={homePath}
                className="rounded-lg border border-cyan-400/30 px-3 py-1.5 text-sm text-cyan-300 transition hover:bg-cyan-400/10"
              >
                Mi panel
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Crear cuenta
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
