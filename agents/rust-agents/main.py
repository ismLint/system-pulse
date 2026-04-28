from fastapi import FastAPI
from datetime import datetime, time
import time
import psutil
import uvicorn
import httpx
from random import randint, random

app = FastAPI()
destination_url = 'http://127.0.0.1:8080'

@app.get('/metrics')
def get_metric():
    mem = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=1)
    disk = psutil.disk_usage('/')
    session_id = randint(1, 256)


    return {
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'cpu_usage': cpu,
        'id': session_id,
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

def agent_run():
    print("Starting agent")
    batch = []

    while True:
        current_metric = get_metric()
        batch.append(current_metric)

        if len(batch) == 10:
            print(f'reached {len(batch)} metrics. sending metrics to server')

            try:
                with httpx.Client() as client:
                    response = client.post(destination_url, json={'id: ': id(256), 'metrics: ':batch}, timeout=5)
                    if response.status_code == 200:
                        print('metrics sent to server')
                        batch = []
                    elif response.status_code == 404:
                        print('error sending to server')
                    elif response.status_code == 500:
                        print('server-side error')
                    elif response.status_code == 505:
                        print('server not found')


            except (httpx.ConnectTimeout, httpx.ConnectTimeout):
                print('connection error')

            time.sleep(1)

if __name__ == '__main__':
    try:
        agent_run()
    except KeyboardInterrupt:
        print('stopped by user')
        exit(0)



