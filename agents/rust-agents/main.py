import os
import asyncio
from datetime import datetime
import psutil
import httpx
from random import randint
from fastapi import FastAPI

app = FastAPI()

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8080")
DESTINATION_URL = f"{BACKEND_URL}/api/metrics"

SERVER_ID = 1

def write_log(message: str):
    """Безопасное логирование в файл"""
    try:
        os.makedirs("logs", exist_ok=True)
        with open("logs/agent_logs.json", "a", encoding="utf-8") as log_file:
            log_file.write(f'{datetime.now().strftime("%Y-%m-%d %H:%M:%S")} - {message}\n')
    except Exception as e:
        print(f"Ошибка записи лога: {e}")

@app.get('/metrics')
def get_metric_endpoint():
    """Эндпоинт FastAPI (если фронт захочет дергать агент напрямую)"""
    mem = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=None)
    disk = psutil.disk_usage('/')

    return {
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'server_id': SERVER_ID,
        'cpu_usage': cpu,
        'memory_usage': {
            'total': mem.total,
            'used': mem.used,
            'free': mem.free,
        },
        'disk_usage': {
            'total': disk.total,
            'used': disk.used,
            'free': disk.free,
        }
    }

async def send_to_server(client: httpx.AsyncClient, payload: dict):
    """Общая функция отправки данных на Rust-бэкенд"""
    try:
        response = await client.post(DESTINATION_URL, json=payload, timeout=5)
        log_msg = f"Отправка на {DESTINATION_URL}. Статус: {response.status_code}"
        print(log_msg)
        write_log(log_msg)
    except httpx.ConnectError:
        print(f"Ошибка подключения к бэкенду {DESTINATION_URL}")
        write_log("Ошибка подключения: Сервер недоступен")
    except httpx.TimeoutException:
        print("Таймаут при отправке метрик")

async def agent_run_loop(client: httpx.AsyncClient):
    """Асинхронный цикл сбора системных метрик"""
    print("Запущен сбор системных метрик...")
    batch = []

    while True:
        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=None)
        disk = psutil.disk_usage('/')

        metric = {
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'server_id': SERVER_ID,
            'cpu_usage': cpu,
            'memory_used': mem.used,
            'memory_total': mem.total,
            'disk_used': disk.used,
            'disk_total': disk.total
        }

        batch.append(metric)

        if len(batch) >= 10:
            print(f'Батч системных метрик заполнен ({len(batch)}). Отправка...')
            payload = {
                'server_id': SERVER_ID,
                'metrics': batch
            }
            await send_to_server(client, payload)
            batch = []

        await asyncio.sleep(1)

async def critical_processes_loop(client: httpx.AsyncClient):
    """Асинхронный цикл сбора топ-процессов по CPU"""
    print("Запущен мониторинг топ-процессов...")

    while True:
        process_list = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                if proc.info['cpu_percent'] > 0.0:
                    process_list.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cpu_percent': proc.info['cpu_percent'],
                        'memory_percent': proc.info['memory_percent']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        sorted_processes = sorted(process_list, key=lambda x: x['cpu_percent'], reverse=True)[:5]

        if sorted_processes:
            payload = {
                'server_id': SERVER_ID,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'top_processes': sorted_processes
            }
            await send_to_server(client, payload)
        await asyncio.sleep(5)

async def main():
    async with httpx.AsyncClient() as client:
        await asyncio.gather(
            agent_run_loop(client),
            critical_processes_loop(client)
        )

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('Агент остановлен пользователем')