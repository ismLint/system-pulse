from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, time
import time
import psutil
import uvicorn
import maturin
import httpx



app = FastAPI()
destination_url = 'http://127.0.0.1:8080'


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:8000/metrics"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )



@app.get('/metrics')
def get_metric():
    mem = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=1)
    disk = psutil.disk_usage('/')

    return {
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
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


def agent_run():
    print("Starting agent")

    while True:
        payload = get_metric()

        try:
            with httpx.Client() as client:
                response = client.post(destination_url, json=payload, timeout=1)

                if response.status_code != 200:
                    print('agent succeed')

                else:
                    print(f'agent failed: {response.status_code}')

        except (httpx.ConnectError, httpx.ConnectTimeout):
            print('server unavailable')

        time.sleep(1)


if __name__ == '__main__':
    try:
        agent_run()
    except KeyboardInterrupt:
        print('stopped by user')
        exit(0)


# if __name__ == '__main__':
#     uvicorn.run(app, host='0.0.0.0', port=8000)
