import React from 'react';
import './AuthLayout.css';
import { LoginBrandPanel } from '../LoginBrandPanel';

type Props = {
  mode: 'login' | 'register';
  children: React.ReactNode;
};

export const AuthLayout = ({ mode, children }: Props) => {
  return (
    <main className="auth-shell">
      <div className={`auth-container ${mode === 'register' ? 'mode-register' : 'mode-login'}`}>
        <LoginBrandPanel />

        <div className="login-right-panel auth-form-panel">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
