import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('token');

    // Если токен отсутствует — перенаправляем на страницу авторизации
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Если токен есть — рендерим вложенный компонент (MonitorPage)
    return <>{children}</>;
};