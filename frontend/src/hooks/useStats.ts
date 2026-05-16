// @ts-ignore
import { useState, useEffect } from "react";

export type ServerInfo = {
  server_id: number;
  server_name: string;
  status: string;
  cpu_usage?: number;
  ram_usage?: number;
  cpu_temperature?: number;
};

export function useStats() {
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || 'debug_token_2026';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // 1. Обязательно сначала ОБЪЯВЛЯЕМ wsUrl через const
    const wsUrl = `${wsProtocol}//localhost:8080/api/ws?token=${encodeURIComponent(token)}`;

    // 2. Только ПОСЛЕ этого логируем и используем
    console.log("Попытка сокет-соединения с:", wsUrl);

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket успешно подключен к Axum!");
      setConnected(true);
      setLoading(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setServer(data);
      } catch (error) {
        console.error("Ошибка парсинга JSON:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Ошибка WebSocket:", error);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket закрыт. Код: ${event.code}`);
      setConnected(false);
      setLoading(true);
    };

    return () => {
      socket.close();
    };
  }, []);

  // Адаптируем под интерфейс App.tsx: возвращаем массив серверов, если данные пришли
  const servers = server ? [{
    id: server.server_id,
    name: server.server_name,
    status: server.status,
    points: [{ cpu: server.cpu_usage || 0, ram: server.ram_usage || 0 }]
  }] : [];

  return { servers, connected, loading };
}