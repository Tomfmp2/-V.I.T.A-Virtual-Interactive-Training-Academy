import { LoginBrandPanel } from '../components/LoginBrandPanel';
import { LoginForm } from '../components/LoginForm';
import './LoginPage.css';

export const LoginPage = () => {
  return (
    <main className="login-page-shell">
      <div className="login-page-grid">
        <LoginBrandPanel />
        <div className="login-right-panel">
          <LoginForm />
        </div>
      </div>
    </main>
  );
};
