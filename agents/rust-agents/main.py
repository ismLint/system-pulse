from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import psutil
import uvicorn
import maturin



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000/metrics"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



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

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
