import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Описываем интерфейс входящих метрик, соответствующий бэкенду на Rust
interface ServerInfo {
    server_id: number;
    server_name: string;
    status: string;
    cpu_usage: number;
    ram_usage: number;
    cpu_temperature: number;
}

export const MonitorPage = () => {
    const [metrics, setMetrics] = useState<ServerInfo | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [cacheCount, setCacheCount] = useState<number>(0);
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || 'Пользователь';
    const tier = localStorage.getItem('tier') || 'free';

    useEffect(() => {
        // Извлекаем реальный JWT-токен из хранилища браузера
        const token = localStorage.getItem('token') || '';

        // Формируем URL и безопасно кодируем токен для query-параметра
        const wsUrl = `ws://localhost:8080/api/ws?token=${encodeURIComponent(token)}`;

        console.log("Попытка сокет-соединения с:", wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket успешно подключен к Axum!");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const data: ServerInfo = JSON.parse(event.data);
                setMetrics(data);
                // Симулируем накопление точек в кэше (как на скриншоте, максимум 30)
                setCacheCount((prev) => (prev < 30 ? prev + 1 : 1));
            } catch (e) {
                console.error("Ошибка парсинга JSON с метриками:", e);
            }
        };

        socket.onerror = (error) => {
            console.error("Ошибка WebSocket:", error);
            setIsConnected(false);
        };

        socket.onclose = () => {
            console.log("WebSocket соединение закрыто.");
            setIsConnected(false);
        };

        // При размонтировании компонента обязательно закрываем соединение
        return () => {
            socket.close();
        };
    }, []);

    // Функция для выхода из аккаунта
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '2rem' }}>

            {/* Шапка дашборда */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', paddingBottom: '1.5rem', borderBottom: '1px solid #1e293b' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        System Pulse Monitor <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal' }}>(Pre-build)</span>
                    </h1>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                        Аккаунт: <strong style={{ color: '#fff' }}>{username}</strong> | Тариф: <span style={{ color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>{tier}</span>
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Индикатор статуса соединения */}
                    <span style={{
                        backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                        color: '#fff',
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        boxShadow: isConnected ? '0 0 10px rgba(34,197,94,0.3)' : 'none'
                    }}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>

                    <button
                        onClick={handleLogout}
                        style={{ padding: '0.4rem 0.8rem', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        Выйти
                    </button>
                </div>
            </header>

            {/* Основной контент */}
            <main style={{ maxWidth: '1200px', margin: '2rem auto' }}>
                {metrics ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>

                        {/* Карточка сервера */}
                        <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#fff' }}>
                                {metrics.server_name} <span style={{ color: '#64748b', fontSize: '0.9rem' }}>(ID: {metrics.server_id})</span>
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #334155', fontSize: '0.95rem' }}>
                                <span style={{ color: '#94a3b8' }}>Статус:</span>
                                <span style={{ color: metrics.status === 'online' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{metrics.status}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #334155', fontSize: '0.95rem' }}>
                                <span style={{ color: '#94a3b8' }}>CPU Usage:</span>
                                <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{metrics.cpu_usage}%</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #334155', fontSize: '0.95rem' }}>
                                <span style={{ color: '#94a3b8' }}>RAM Usage:</span>
                                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{metrics.ram_usage}%</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.95rem' }}>
                                <span style={{ color: '#94a3b8' }}>Температура CPU:</span>
                                <span style={{ color: metrics.cpu_temperature > 75 ? '#f87171' : '#f59e0b', fontWeight: 'bold' }}>{metrics.cpu_temperature}°C</span>
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                                Точек в кэше: {cacheCount} / 30
                            </div>
                        </div>

                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <p style={{ fontSize: '1.1rem' }}>Ожидание потока метрик от бэкенда...</p>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Убедитесь, что сервер Axum запущен и токен валиден.</span>
                    </div>
                )}
            </main>

        </div>
    );
};