import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './RegisterPage.css';

const PasswordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
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
      // Simulación de registro (frontend only)
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

  const handleGoogleLogin = async (credentialResponse: any) => {
    setErrorMessage(null);
    setLoading(true);

    try {
      // Decodificar el token de Google (solo frontend)
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const googleUser = JSON.parse(jsonPayload);
      
      // Crear usuario y token simulado (frontend only)
      const user = {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        role: 'student'
      };
      
      const token = credentialResponse.credential;

      // Guardar sesión en Context & localStorage
      login(token, user);

      // Redirigir a Home
      navigate('/');
    } catch (err: any) {
      setErrorMessage('Error al procesar la autenticación con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerContainer">
      {/* Header V.I.T.A. Academy */}
      <header className="registerHeader">
        <h1 className="brandTitle">V.I.T.A. </h1>
        <p className="brandSub">Precision Engineering for Mastery.</p>
      </header>

      {/* Card Principal */}
      <main className="registerCard">
        <h2 className="cardTitle">Join the Academy</h2>
        <p className="cardSub">Start your journey towards precision engineering and mastery.</p>

        {errorMessage && (
          <div className="errorBanner">
            {errorMessage}
          </div>
        )}

        {/* Google Login Button */}
        <div className="googleLoginContainer">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setErrorMessage('Error al autenticar con Google');
            }}
            useOneTap
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
          />
        </div>

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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
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
                <PasswordIcon />
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
                <PasswordIcon />
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
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p className="footerText">
          Already have an account?{' '}
          <Link to="/login" className="signInLink">
            Sign in
          </Link>
        </p>
      </main>

      {/* Footer inferior */}
      <footer className="footer">
        <span>© 2024 V.I.T.A. Academy. Precision Engineering for Mastery.</span>
        <div className="footerLinks">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="footerAnchor">Privacy Policy</a>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="footerAnchor">Terms of Service</a>
          <a href="#security" onClick={(e) => e.preventDefault()} className="footerAnchor">Security Standards</a>
          <a href="#support" onClick={(e) => e.preventDefault()} className="footerAnchor">Support</a>
        </div>
      </footer>
    </div>
  );
};