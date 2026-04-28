# ⚡ System Pulse

<p align="center">
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

**System Pulse** — это легковесный и мощный инструмент для мониторинга ресурсов вашего ПК или сервера в реальном времени. Система позволяет отслеживать критические показатели через удобное десктоп или веб-приложение.



## 🚀 Основные возможности
- 📊 **Мониторинг CPU:** Отслеживание процента загрузки процессора в реальном времени.
- 💾 **Память (RAM):** Визуализация использования оперативной памяти.
- 💽 **Дисковое пространство:** Контроль заполнения накопителей.
- 🌐 **Web-интерфейс:** Доступ к метрикам из любой точки через браузер.

---

## 🛠️ Технологический стек

Проект разделен на три ключевых слоя для обеспечения максимальной эффективности:

1.  **Collector (Python):** Низкоуровневый агент, который собирает данные о системе с минимальными накладными расходами на ресурсы.
2.  **Backend (Rust):** Обрабатывает входящие данные от агента, управляет API и обеспечивает логику передачи метрик.
3.  **Frontend (React):** Динамический дашборд с графиками и индикаторами для визуализации состояния системы.

---

## 🏗️ Архитектура



* **Python Agent** → Отправляет системные вызовы и собирает метрики.
* **Rust Tokio Framework** → Принимает данные и транслирует их через WebSocket/REST.
* **React Dashboard** → Получает данные и мгновенно обновляет графики.

---

## 🔧 Установка и запуск

### 1. Сборка Rust агента
```bash
cd system-pulse
docker compose up --build
