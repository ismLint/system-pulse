import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { MonitorPage } from './pages/MonitorPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Главная страница — Лендинг с тарифами */}
                <Route path="/" element={<LandingPage />} />

                {/* Страница входа и регистрации */}
                <Route path="/login" element={<AuthPage />} />

                {/* Защищенный роут мониторинга (доступен только после ввода логина/пароля) */}
                <Route
                    path="/monitor"
                    element={
                        <ProtectedRoute>
                            <MonitorPage />
                        </ProtectedRoute>
                    }
                />

                {/* Если пользователь ввел любой другой URL — редиректим на лендинг */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;