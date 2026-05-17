// @ts-ignore
import React, { useState, useEffect } from 'react';
import { useStats } from './hooks/useStats';

function App() {
    // Вызываем отказоустойчивый хук
    const { servers, connected } = useStats();

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#1e2530', color: '#fff', minHeight: '100vh' }}>

            {/* Шапка монитора */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>System Pulse Monitor (Pre-build)</h2>

                {/* Индикатор подключения к бэкенду Rust */}
                <span style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    backgroundColor: connected ? '#2ecc71' : '#e74c3c',
                    transition: 'background-color 0.3s ease'
                }}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
            </div>

            {loading_placeholder(servers, connected)}

        </div>
    );
}

// Вспомогательная функция для отрисовки состояния загрузки или карточек серверов
function loading_placeholder(servers: any[], connected: boolean) {
    if (!connected) {
        return (
            <div style={{ textAlign: 'center', color: '#8a99ad', marginTop: '50px' }}>
                <p style={{ fontSize: '18px' }}>Соединение с бэкендом Rust устанавливается...</p>
                <p style={{ fontSize: '14px', color: '#56667a' }}>Проверьте логи контейнера бэкенда, если статус долго не меняется.</p>
            </div>
        );
    }

    if (servers.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#8a99ad', marginTop: '50px' }}>
                <p style={{ fontSize: '18px' }}>Подключено! Ожидание первых данных от бэкенда...</p>
                <p style={{ fontSize: '14px', color: '#56667a' }}>Метрики от агента Python пока не записались в базу данных.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {servers.map((server) => {
                // Берем последнюю точку из истории для вывода текущих показателей
                const currentPoint = server.points[server.points.length - 1] || { cpu: 0, ram: 0 };

                return (
                    <div key={server.id} style={{ backgroundColor: '#2a3241', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, color: '#ecf0f1' }}>{server.name} (ID: {server.id})</h3>
                        <p>Статус: <span style={{ fontWeight: 'bold', color: server.status === 'online' ? '#2ecc71' : '#e74c3c' }}>{server.status}</span></p>

                        <hr style={{ borderColor: '#3f4b5f', margin: '15px 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                            <span>CPU Usage:</span>
                            <strong style={{ color: '#3498db' }}>{currentPoint.cpu}%</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0' }}>
                            <span>RAM Usage:</span>
                            <strong style={{ color: '#2ecc71' }}>{currentPoint.ram}%</strong>
                        </div>

                        <div style={{ marginTop: '15px', fontSize: '12px', color: '#8a99ad', textAlign: 'right' }}>
                            Точек в кэше: {server.points.length} / 30
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default App;