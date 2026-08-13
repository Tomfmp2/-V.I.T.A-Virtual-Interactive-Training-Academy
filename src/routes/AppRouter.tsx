import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LandingPage } from '../pages/LandingPage';
import { HomePage } from '../pages/HomePage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { RoleGuard } from '../components/auth/RoleGuard';
import { RoleHomeRedirect } from '../components/auth/RoleHomeRedirect';
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

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
};
