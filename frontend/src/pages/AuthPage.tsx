import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            if (isLogin) {
                // Логика авторизации
                const data = await authService.login(username, password);
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('tier', data.tier);

                // Успешно вошли — перенаправляем на защищенный мониторинг
                navigate('/monitor');
            } else {
                // Логика регистрации
                const resMessage = await authService.register(username, password);
                setMessage(resMessage + ' Теперь вы можете войти в систему.');
                setIsLogin(true); // Переключаем на окно входа
                setPassword('');
            }
        } catch (err: any) {
            setError(err.message || 'Произошла непредвиденная ошибка');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>

                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#38bdf8', marginTop: 0 }}>
                    {isLogin ? 'System Pulse | Вход' : 'System Pulse | Регистрация'}
                </h2>

                {/* Вывод ошибок бэкенда */}
                {error && (
                    <div style={{ backgroundColor: '#ef444433', color: '#f87171', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #ef444455' }}>
                        {error}
                    </div>
                )}

                {/* Вывод успешных уведомлений */}
                {message && (
                    <div style={{ backgroundColor: '#22c55e33', color: '#4ade80', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #22c55e55' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>Имя пользователя</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>Пароль</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: 'none', backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem', fontSize: '1rem', transition: 'background 0.2s' }}
                    >
                        {isLogin ? 'Войти' : 'Создать аккаунт'}
                    </button>
                </form>

                {/* Переключалка режимов формы */}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 0 }}>
                    {isLogin ? 'Впервые у нас? ' : 'Уже есть аккаунт? '}
                    <span
                        onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
                        style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
                    >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </span>
                </p>

            </div>
        </div>
    );
};