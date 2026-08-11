import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de navegación superior */}
      <Navbar />

      {/* Contenido principal de la Home */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner de bienvenida */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              ¡Bienvenido de nuevo, {user?.nombre}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Estás conectado como <span className="text-emerald-400 font-semibold">{user?.rol}</span>.
            </p>
          </div>
        </section>

        {/* Tarjetas informativas del dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Módulos Activos
            </h3>
            <p className="text-3xl font-extrabold text-white mt-2">V.I.T.A.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Mi Rol
            </h3>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">
              {user?.rol}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Sesión
            </h3>
            <p className="text-sm font-medium text-slate-300 mt-2 truncate">
              {user?.email}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};