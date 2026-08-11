import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Obtener iniciales para el avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between relative">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-emerald-500 text-slate-950 font-black p-1.5 rounded-lg text-sm">
          VITA
        </div>
        <span className="font-bold text-lg tracking-wide hidden sm:inline">
          Learning Hub
        </span>
      </div>

      {/* Perfil & Acciones */}
      <div className="relative">
        {/* Botón de Perfil */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            {getInitials(user?.nombre)}
          </div>
        </button>

        {/* Dropdown del Perfil */}
        {isMenuOpen && (
          <>
            {/* Overlay transparente para cerrar al hacer clic afuera */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="absolute right-0 mt-3 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-20 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Encabezado con datos del Usuario */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  {getInitials(user?.nombre)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-white truncate text-sm">
                    {user?.nombre || "Usuario"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Información detallada */}
              <div className="py-3 space-y-2 border-b border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rol asignado:</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-semibold rounded border border-emerald-500/20 uppercase text-[10px]">
                    {user?.rol || "Sin Rol"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Estado de cuenta:</span>
                  <span className="text-emerald-400 font-medium">Activa</span>
                </div>
              </div>

              {/* Botón de Logout */}
              <div className="pt-3">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-colors border border-red-500/20"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
