# === Этап 1: Сборка приложения ===
FROM node:20-alpine AS builder
WORKDIR /app

# Сначала копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем ВООБЩЕ ВСЕ файлы из папки ./frontend внутрь контейнера
# (Сюда автоматически попадут src, public, tsconfig.json, vite.config.ts и т.д.)
COPY . .

# Запускаем сборку
RUN npm run build

# === Этап 2: Раздача статики через Nginx ===
FROM nginx:stable-alpine

# Копируем собранный фронтенд (папку dist) в Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]