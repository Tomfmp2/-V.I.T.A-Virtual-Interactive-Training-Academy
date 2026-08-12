import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../api/authApi';

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

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'error' | 'success' | null; message?: string }>({ type: null });
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!email.trim()) {
      nextErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }

    if (!password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria.';
    }

    return nextErrors;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((t) => ({ ...t, [field]: true }));
    const next = validate();
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus({ type: null });
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const loginResponse = await loginApi({ email, password });
      const { token, usuario } = loginResponse;
      login(token, usuario);
      setFormStatus({ type: 'success', message: 'Inicio de sesión exitoso.' });
      navigate('/home');
    } catch (error: unknown) {
      const nextFormErrors: typeof errors = {};

      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          nextFormErrors.form = 'El correo o la contraseña son incorrectos.';
        } else if (status === 404) {
          nextFormErrors.form = 'Usuario inexistente.';
        } else if (status === 403) {
          nextFormErrors.form = 'Sesión rechazada. Verifica tu acceso.';
        } else if (status === 400) {
          nextFormErrors.form = 'Datos inválidos. Revisa los campos e intenta nuevamente.';
        } else if (status === 503) {
          nextFormErrors.form = 'No pudimos conectar con el servidor. Inténtalo nuevamente.';
        } else if (typeof status === 'number' && status >= 500) {
          nextFormErrors.form = 'No pudimos iniciar sesión en este momento. Inténtalo nuevamente.';
        } else {
          nextFormErrors.form = error.response?.data?.message || 'Ocurrió un error. Inténtalo nuevamente.';
        }
      } else {
        nextFormErrors.form = 'No pudimos conectar con el servidor. Inténtalo nuevamente.';
      }

      setErrors(nextFormErrors);
      setFormStatus({ type: 'error', message: nextFormErrors.form });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-panel">
      <div className="login-form-head">
        <div>
          <p className="login-form-label">INICIAR SESIÓN</p>
          <h2 className="login-form-title">Accede a tu aula virtual</h2>
          <p className="login-form-copy">Por favor ingresa tus datos para acceder a tu aula virtual.</p>
        </div>
      </div>

      <button type="button" className="social-button">
        <span className="social-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        </span>
        Continuar con Google
      </button>

      <div className="login-divider">
        <span>O CONTINÚA CON EMAIL</span>
      </div>

      <form onSubmit={handleSubmit} className="login-form-fields" noValidate>
        <div className="field-group">
          <div className="field-header">
            <label htmlFor="email" className="field-label">Email *</label>
          </div>
          <div className={`field-input-group ${errors.email ? 'error' : ''}`}>
            <span className="field-icon">
              <MailIcon />
            </span>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (touched.email) setErrors((prev) => ({ ...prev, email: validate().email }));
              }}
              onBlur={() => handleBlur('email')}
              className="field-input"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
        </div>

        <div className="field-group">
          <div className="field-header">
            <label htmlFor="password" className="field-label">Contraseña *</label>
          </div>
          <div className={`field-input-group ${errors.password ? 'error' : ''}`}>
            <span className="field-icon">
              <LockIcon />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (touched.password) setErrors((prev) => ({ ...prev, password: validate().password }));
              }}
              onBlur={() => handleBlur('password')}
              className="field-input"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="field-eye"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && <p className="field-error" id="password-error">{errors.password}</p>}

          <div className="form-footer-link">
            <Link to="/forgot-password" className="forgot-link">¿Olvidé mi contraseña?</Link>
          </div>
        </div>

        {formStatus.type === 'error' && <div className="form-error" role="alert">{formStatus.message}</div>}
        {formStatus.type === 'success' && <div className="form-success" role="status">{formStatus.message}</div>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <p className="register-caption">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="register-link">Regístrate</Link>
        </p>
      </form>
    </div>
  );
};
