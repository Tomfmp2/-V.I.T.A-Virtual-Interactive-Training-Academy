import { LoginForm } from '../components/LoginForm';
import { AuthLayout } from '../components/auth/AuthLayout';
import './LoginPage.css';

export const LoginPage = () => {
  return (
    <AuthLayout mode="login">
      <LoginForm />
    </AuthLayout>
  );
};
