import os
import time
import requests
from ssh_manager import SSHManager

# URL бэкенда берем строго из окружения (без дублирования путей)
BACKEND_BASE_URL = os.getenv("BACKEND_URL", "http://system_pulse_backend:8080/api")

# Эндпоинты
SERVERS_ENDPOINT = f"{BACKEND_BASE_URL}/servers"
METRICS_ENDPOINT = f"{BACKEND_BASE_URL}/metrics"

def get_monitored_servers():
    """Запрашивает у бэкенда список серверов для мониторинга"""
    try:
        response = requests.get(SERVERS_ENDPOINT, timeout=5)
        if response.status_code == 200:
            return response.json()  # Ожидаем массив [{id, host, username, password}, ...]
        else:
            print(f"[Agent] Не удалось получить список серверов. Статус: {response.status_code}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"[Agent] Ошибка сети при запросе списка серверов: {e}")
        return []

def send_metrics(metrics_data):
    """Отправляет собранные метрики конкретного сервера на бэкенд"""
    try:
        response = requests.post(METRICS_ENDPOINT, json=metrics_data, timeout=5)
        if response.status_code == 200:
            print(f"[Agent] Метрики для сервера ID {metrics_data['server_id']} успешно отправлены.")
        else:
            print(f"[Agent] Бэкенд не принял метрики (Статус: {response.status_code})")
    except requests.exceptions.RequestException as e:
        print(f"[Agent] Ошибка отправки метрик: {e}")

def main():
    print("[Agent] Универсальный агент мониторинга запущен...")

    # Хранилище активных SSH-сессий, чтобы не переподключаться каждую секунду
    active_connections = {}

    while True:
        # Каждый цикл запрашиваем свежий список из базы (на случай, если пользователь добавил/удалил сервер)
        servers = get_monitored_servers()

        if not servers:
            print("[Agent] Список серверов пуст. Ожидание 10 секунд...")
            time.sleep(10)
            continue

        for server in servers:
            srv_id = server.get("id")
            host = server.get("host")
            user = server.get("username")
            password = server.get("password")

            # Если сессии еще нет, создаем её
            if srv_id not in active_connections:
                active_connections[srv_id] = SSHManager(hostname=host, username=user, password=password)

            try:
                print(f"[Agent] Опрос сервера {host} (ID: {srv_id})...")
                ssh_client = active_connections[srv_id]

                # Собираем реальные данные с Ubuntu через SSH
                metrics = ssh_client.get_real_metrics()
                metrics["server_id"] = srv_id  # Привязываем ID из базы данных

                # Пушим на бэкенд
                send_metrics(metrics)

            except Exception as e:
                print(f"[Agent] Ошибка опроса сервера {host}: {e}")
                # Если упал коннект, закрываем и удаляем из активных, чтобы переподключиться в следующем цикле
                active_connections[srv_id].close()
                del active_connections[srv_id]

        # Интервал между полными кругами опроса всех серверов
        time.sleep(5)

if __name__ == "__main__":
    main()