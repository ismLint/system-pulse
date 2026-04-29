import { useState, useEffect } from "react";

type ServerInfo = {
  server_id: number;
  server_name: string;
  status: string;
};

export function useStats() {
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setServer({ server_id: 0, server_name: "Мой сервер", status: "online" });
      setLoading(false);
    }, 300);
  }, []);

  return { server, loading };
}