import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem', borderBottom: '1px solid #1e293b' }}>
                <h1 style={{ color: '#38bdf8', fontSize: '1.75rem' }}>⚡ System Pulse</h1>
                <button onClick={() => navigate('/login')} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #38bdf8', backgroundColor: 'transparent', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}>
                    Личный кабинет
                </button>
            </header>

            <main style={{ maxWidth: '1200px', margin: '4rem auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 'extrabold', marginBottom: '1rem' }}>Мониторинг сетевой инфраструктуры нового поколения</h2>
                <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                    Высокопроизводительный движок на Rust Axum, мгновенный стриминг метрик через WebSockets и глубокий анализ пакетов.
                </p>

                {/* Тарифная сетка для монетизации */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                    {/* Free Tier */}
                    <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', width: '300px', textAlign: 'left', border: '1px solid #334155' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Базовый (Free)</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', minHeight: '40px' }}>Для личного использования и ознакомления.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1.5rem 0' }}>0 руб <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ навсегда</span></div>
                        <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.8' }}>
                            <li>Мониторинг 1 сервера</li>
                            <li>Обновление данных раз в 5 секунд</li>
                            <li>Базовые системные метрики</li>
                        </ul>
                    </div>

                    {/* Premium Tier */}
                    <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '12px', width: '300px', textAlign: 'left', border: '2px solid #38bdf8', position: 'relative' }}>
                        <span style={{ backgroundColor: '#38bdf8', color: '#0f172a', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '4px', position: 'absolute', top: '-12px', left: '20px' }}>POPULAR</span>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#38bdf8' }}>Профессиональный</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', minHeight: '40px' }}>Для распределенных нод и коммерческих сетей.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1.5rem 0' }}>499 руб <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ мес</span></div>
                        <ul style={{ paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.8' }}>
                            <li>Безлимитное количество серверов</li>
                            <li style={{ color: '#38bdf8', fontWeight: 'bold' }}>Real-time обновление (1 секунда)</li>
                            <li>Доступ к снифферу трафика</li>
                            <li>Админ-панель управления</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};