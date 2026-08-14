import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LandingPage } from '../pages/LandingPage';
import { HomePage } from '../pages/HomePage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { RoleGuard } from '../components/auth/RoleGuard';
import { RoleHomeRedirect } from '../components/auth/RoleHomeRedirect';
import { GuestGuard } from '../components/auth/GuestGuard';
import { roleRouteAccess } from '../utils/roleNavigation';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<RoleHomeRedirect />} />

                {Object.entries(roleRouteAccess).map(([routeBase, allowedRoles]) => (
                    <Route
                        key={routeBase}
                        path={`${routeBase}/*`}
                        element={
                            <RoleGuard allowedRoles={allowedRoles}>
                                <HomePage />
                            </RoleGuard>
                        }
                    />
                ))}

                <Route
                    path="/login"
                    element={
                        <GuestGuard>
                            <LoginPage />
                        </GuestGuard>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <GuestGuard>
                            <RegisterPage />
                        </GuestGuard>
                    }
                />
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
