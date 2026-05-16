// @ts-ignore
import { useState, useEffect } from "react";

export type ServerInfo = {
  server_id: number;
  server_name: string;
  status: string;
  cpu_usage?: number;
  ram_usage?: number;
  cpu_temperature?: number;
  // Добавляем массив точек, если захочешь накапливать историю для графиков
  points?: Array<{ time: string; cpu: number; ram: number }>;
};

export function useStats() {
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Вытаскиваем токен. Если его нет — заменяем на тестовый 'test_admin',
    // чтобы бэкенд Axum не закрывал соединение из-за пустого параметра.
    const token = localStorage.getItem('token') || 'test_admin';

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Стучимся строго по IP 127.0.0.1, чтобы избежать проблем с резолвом localhost в Docker
    const wsUrl = `${wsProtocol}//127.0.0.1:8080/api/ws?token=${encodeURIComponent(token)}`;

    console.log("Попытка сокет-соединения с:", wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket успешно подключен!");
      setConnected(true);
      setLoading(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Получены метрики от бэкенда:", data);

        // Маппим данные под стейт. Если бэкенд присылает массив, берём первый сервер
        if (Array.isArray(data)) {
          setServer(data[0]);
        } else {
          setServer(data);
        }
      } catch (error) {
        console.error("Ошибка парсинга JSON от сокета:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Ошибка WebSocket:", error);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket закрыт. Код: ${event.code}, Причина: ${event.reason}`);
      setConnected(false);
      setLoading(true);
    };

    return () => {
      socket.close();
    };
  }, []);

  // Возвращаем connected, чтобы карточки в App.tsx знали, менять ли цвет плашки
  return { server, servers: server ? [server] : [], connected, loading };
}