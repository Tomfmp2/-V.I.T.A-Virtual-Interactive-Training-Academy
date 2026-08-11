import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12 13 2 6"></polyline>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // Simulación de registro (frontend only) - para producción usar api.post('/auth/register')
      const user = {
        id: 'user_' + Date.now(),
        email: email,
        name: name,
        role: 'student'
      };
      
      const token = 'token_' + Date.now();

      // Guardar sesión en Context & localStorage
      login(token, user);

      // Redirigir a Home
      navigate('/');
    } catch (err: any) {
      setErrorMessage('Error al registrar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageContainer">
      {/* Columna Izquierda - Panel de Marca */}
      <div className="leftPanel">
        <div className="brandSection">
          <div className="logoContainer">
            <svg className="logoSvg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="#10B981"/>
              <path d="M16 14L34 24L16 34V14Z" fill="white"/>
            </svg>
            <div className="logoBrand">
              VITA<span className="logoDot">.</span> LEARNING HUB
            </div>
          </div>
          <h1 className="brandTitle">Impulsa tu aprendizaje con V.I.T.A.</h1>
          <p className="brandSubtitle">
            La plataforma interactiva donde estudiantes y tutores conectan en tiempo real para alcanzar el dominio técnico.
          </p>
        </div>

        <div className="metricsGrid">
          <div className="metricCard">
            <div className="metricIcon">
              <UsersIcon />
            </div>
            <div className="metricContent">
              <div className="metricValue">+1,000</div>
              <div className="metricLabel">Estudiantes impulsando su carrera profesional</div>
            </div>
          </div>
          <div className="metricCard">
            <div className="metricIcon">
              <VideoIcon />
            </div>
            <div className="metricContent">
              <div className="metricValue">+500</div>
              <div className="metricLabel">Tutorías en vivo y sesiones personalizadas completadas</div>
            </div>
          </div>
          <div className="metricCard">
            <div className="metricIcon">
              <StarIcon />
            </div>
            <div className="metricContent">
              <div className="metricValue">99.8%</div>
              <div className="metricLabel">Satisfacción y resolución efectiva de dudas</div>
            </div>
          </div>
          <div className="metricCard">
            <div className="metricIcon">
              <ClockIcon />
            </div>
            <div className="metricContent">
              <div className="metricValue">24/7</div>
              <div className="metricLabel">Acceso continuo a tu panel de aprendizaje y recursos</div>
            </div>
          </div>
        </div>

        <div className="footerText">
          © 2026 V.I.T.A. Academy. Precision Engineering for Mastery.
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="rightPanel">
        <div className="formCard">
          <h2 className="cardTitle">Join the Academy</h2>
          <p className="cardSub">Start your journey towards precision engineering and mastery.</p>

          {errorMessage && (
            <div className="errorBanner">
              {errorMessage}
            </div>
          )}

          {/* Google Button (Static UI Only) */}
          <button className="googleButton" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Registrarse con Google</span>
          </button>

          {/* Divider */}
          <div className="divider">
            <span className="dividerText">OR</span>
          </div>

          <form onSubmit={handleSubmit} className="registerForm">
            {/* Full Name field */}
            <div className="inputGroup">
              <label className="label">FULL NAME</label>
              <div className="inputWrapper">
                <span className="icon">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="input"
                />
              </div>
            </div>

            {/* Email Address field */}
            <div className="inputGroup">
              <label className="label">EMAIL ADDRESS</label>
              <div className="inputWrapper">
                <span className="icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="input"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="inputGroup">
              <label className="label">PASSWORD</label>
              <div className="inputWrapper">
                <span className="icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eyeToggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="inputGroup">
              <label className="label">CONFIRM PASSWORD</label>
              <div className="inputWrapper">
                <span className="icon">
                  <LockIcon />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="eyeToggle"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="button">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span className="buttonText">Creating Account...</span>
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <p className="footerText">
            Already have an account?{' '}
            <Link to="/login" className="signInLink">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};