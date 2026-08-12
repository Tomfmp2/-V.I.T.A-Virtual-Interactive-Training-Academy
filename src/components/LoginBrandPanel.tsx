import { BrandLogo } from './BrandLogo';

export const LoginBrandPanel = () => {
  return (
    <aside className="login-left-panel">
      <div className="login-left-overlay" />

      <div className="login-left-content">
        <div className="brand-logo">
          <BrandLogo />
        </div>

        <div className="login-left-welcome">
          <h1 className="brand-heading">Bienvenido de vuelta</h1>
          <p className="brand-copy">
            Continúa tu ruta de aprendizaje interactivo y consolida tus habilidades para liderar el cambio tecnológico.
          </p>
        </div>
      </div>
    </aside>
  );
};
