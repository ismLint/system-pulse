FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt* ./
#RUN pip install --no-cache-dir httpx psutil requests
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; else pip install --no-cache-dir httpx requests psutil fastapi uvicorn; fi

COPY . .

CMD ["python", "main.py"]