import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';
import './LoginPage.css';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AxiosError } from 'axios';
import { registerApi, loginApi } from '../api/authApi';

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

// Decorative icons removed because they are not used in this file.

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string; form?: string }>({});
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'error' | 'success' | null; message?: string }>({ type: null });

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'El nombre es obligatorio.';
    if (!lastName.trim()) next.lastName = 'El apellido es obligatorio.';
    if (!email.trim()) next.email = 'El correo electrónico es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Ingresa un correo electrónico válido.';
    if (!password) next.password = 'La contraseña es obligatoria.';
    else if (password.length < 8) next.password = 'La contraseña debe tener al menos 8 caracteres.';
    if (!confirmPassword) next.confirmPassword = 'Confirma tu contraseña.';
    else if (password && confirmPassword && password !== confirmPassword) next.confirmPassword = 'Las contraseñas no coinciden.';
    return next;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const next = validate();
    setErrors((prev) => ({ ...prev, [field]: next[field as keyof typeof next] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ type: null });
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      setTouched({ name: true, lastName: true, email: true, password: true, confirmPassword: true });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await registerApi({ nombre: name, apellido: lastName, email, password });
      setFormStatus({ type: 'success', message: 'Cuenta creada correctamente.' });

      // login automático (mantener comportamiento actual)
      try {
        const loginResponse = await loginApi({ email, password });
        const { token, usuario } = loginResponse;
        login(token, usuario);
        setTimeout(() => navigate('/home'), 700);
      } catch (loginErr) {
        // Si el login automático falla, redirigir a /login mostrando mensaje
        console.error('Auto login falló tras registro:', loginErr);
        setFormStatus({ type: 'success', message: 'Cuenta creada correctamente.' });
        setTimeout(() => navigate('/login'), 900);
      }
    } catch (err: unknown) {
      const nextErrors: typeof errors = {};
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        if (status === 409) {
          nextErrors.form = 'Este correo electrónico ya está registrado.';
        } else if (status === 400 || status === 422) {
          nextErrors.form = 'Los datos enviados son inválidos. Revisa los campos.';
        } else if (typeof status === 'number' && status >= 500) {
          nextErrors.form = 'No pudimos crear tu cuenta en este momento. Inténtalo nuevamente.';
        } else {
          nextErrors.form = err.response?.data?.message || 'Ocurrió un error. Intenta nuevamente.';
        }
      } else {
        nextErrors.form = 'No pudimos conectar con el servidor. Inténtalo nuevamente.';
      }

      setErrors(nextErrors);
      setFormStatus({ type: 'error', message: nextErrors.form });
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="register">
      <div className="login-form-panel">
        <div className="login-form-head">
          <div>
            <p className="login-form-label">CREAR CUENTA</p>
            <h2 className="login-form-title">Comienza tu viaje</h2>
            <p className="login-form-copy">Regístrate gratis y forma parte de la comunidad de aprendizaje.</p>
          </div>
        </div>

        {formStatus.type === 'error' && (
          <div className="form-error" role="alert">{formStatus.message}</div>
        )}
        {formStatus.type === 'success' && (
          <div className="form-success" role="status">{formStatus.message}</div>
        )}

        <button type="button" className="social-button">
          <span className="social-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </span>
          Registrarse con Google
        </button>

        <div className="login-divider">
          <span>O CONTINÚA CON EMAIL</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form-fields">
          <div className="two-col-row">
            <div className="field-group">
              <div className="field-header">
                <label className="field-label">Nombre *</label>
              </div>
              <div className={`field-input-group ${errors.name ? 'error' : ''}`}>
                <span className="field-icon"><UserIcon /></span>
                <input
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched.name) setErrors((prev) => ({ ...prev, name: validate().name }));
                  }}
                  onBlur={() => handleBlur('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className="field-input"
                />
              </div>
              {errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
            </div>

            <div className="field-group">
              <div className="field-header">
                <label className="field-label">Apellido *</label>
              </div>
              <div className={`field-input-group ${errors.lastName ? 'error' : ''}`}>
                <span className="field-icon"><UserIcon /></span>
                <input
                  type="text"
                  placeholder="Ingresa tu apellido"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (touched.lastName) setErrors((prev) => ({ ...prev, lastName: validate().lastName }));
                  }}
                  onBlur={() => handleBlur('lastName')}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  className="field-input"
                />
              </div>
              {errors.lastName && <p className="field-error" id="lastName-error">{errors.lastName}</p>}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <label className="field-label">Email *</label>
            </div>
            <div className={`field-input-group ${errors.email ? 'error' : ''}`}>
              <span className="field-icon"><MailIcon /></span>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) setErrors((prev) => ({ ...prev, email: validate().email }));
                }}
                onBlur={() => handleBlur('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="field-input"
              />
            </div>
            {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
          </div>

          <div className="field-group">
            <div className="field-header">
              <label className="field-label">Contraseña *</label>
            </div>
            <div className={`field-input-group ${errors.password ? 'error' : ''}`}>
              <span className="field-icon"><LockIcon /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) setErrors((prev) => ({ ...prev, password: validate().password }));
                }}
                onBlur={() => handleBlur('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="field-input"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="field-eye" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <p className="field-error" id="password-error">{errors.password}</p>}
          </div>

          <div className="field-group">
            <div className="field-header">
              <label className="field-label">Confirmar contraseña *</label>
            </div>
            <div className={`field-input-group ${errors.confirmPassword ? 'error' : ''}`}>
              <span className="field-icon"><LockIcon /></span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: validate().confirmPassword }));
                }}
                onBlur={() => handleBlur('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                className="field-input"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="field-eye" aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && <p className="field-error" id="confirmPassword-error">{errors.confirmPassword}</p>}
          </div>

          {formStatus.type === 'error' && <div className="form-error" role="alert">{formStatus.message}</div>}
          {formStatus.type === 'success' && <div className="form-success" role="status">{formStatus.message}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          <p className="register-caption">¿Ya tienes una cuenta? <Link to="/login" className="register-link">Inicia Sesión</Link></p>
        </form>
      </div>
    </AuthLayout>
  );
};