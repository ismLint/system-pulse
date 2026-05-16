import React, { useState } from 'react';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        loading(true);

        try {
            // Запрос к будущему эндпоинту авторизации на Axum
            const response = await fetch('http://127.0.0.1:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Неверный логин или пароль');
            }

            // Сохраняем полученный JWT-токен
            localStorage.setItem('token', data.token);
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message || 'Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
        <div style={styles.card}>
        <div style={styles.header}>
        <div style={styles.iconWrapper}>
        <span style={styles.icon}>⚡</span>
    </div>
    <h2 style={styles.title}>System Pulse</h2>
    <p style={styles.subtitle}>Вход в панель мониторинга инфраструктуры</p>
    </div>

    <form onSubmit={handleSubmit} style={styles.form}>
    {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
    <label style={styles.label}>Имя пользователя</label>
    <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    style={styles.input}
    placeholder="admin"
    required
    />
    </div>

    <div style={styles.inputGroup}>
    <label style={styles.label}>Пароль</label>
        <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={styles.input}
    placeholder="••••••••"
    required
    />
    </div>

    <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Проверка...' : 'Авторизоваться'}
        </button>
        </form>
        </div>
        </div>
);
};

    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#0b0f19', // Очень глубокий ночной синий
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        card: {
            backgroundColor: '#131c2e', // Глубокий темно-синий для карточки
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '36px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        },
        header: {
            textAlign: 'center',
            marginBottom: '28px',
        },
        iconWrapper: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            backgroundColor: '#1e293b',
            borderRadius: '50%',
            marginBottom: '12px',
            border: '1px solid #334155',
        },
        icon: {
            fontSize: '1.4rem',
            color: '#38bdf8', // Голубой акцент
        },
        title: {
            margin: '0 0 6px 0',
            color: '#f8fafc',
            fontSize: '1.35rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
        },
        subtitle: {
            margin: 0,
            color: '#64748b',
            fontSize: '0.85rem',
            lineHeight: '1.25rem',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
        },
        label: {
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: 500,
        },
        input: {
            backgroundColor: '#0b0f19',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '10px 14px',
            color: '#f8fafc',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.15s ease',
        },
        button: {
            backgroundColor: '#0284c7', // Насыщенный синий
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '11px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            marginTop: '8px',
        },
        error: {
            backgroundColor: '#451a03',
            color: '#fca5a5',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            border: '1px solid #7c2d12',
            textAlign: 'center',
        }
    };

    export default Login;