# Kanban Board Project

Веб-приложение для управления задачами в стиле Kanban, поддерживающее совместную работу, создание нескольких досок и детальное управление карточками задач.
## Описание проекта
Проект представляет собой современный инструмент для организации рабочих процессов. Пользователи могут создавать собственные доски, настраивать колонки, добавлять задачи с приоритетами, сроками и подзадачами, а также делиться досками с другими людьми.

## Технологический стек
### Backend (API)
* Язык: Python
* Фреймворк: FastAPI
* База данных: PostgreSQL
* ORM: SQLModel
* Аутентификация: OAuth2 с использованием JWT-токенов и хеширования паролей через bcrypt
* Почта: FastAPI-Mail для отправки уведомлений и подтверждения регистрации

### Frontend
* Язык: JavaScript (React)
* Сборщик: Vite
* Иконки: Lucide React
* Стилизация: CSS

### Инфраструктура
* Контейнеризация: Docker и Docker Compose для оркестрации всех сервисов (API, Frontend, DB)
* Управление секретами: Использование локальных файлов для безопасного хранения паролей БД.

## Основные функции
+ **Управление пользователями:** Регистрация, авторизация и верификация через электронную почту.
+ **Доски:** Создание личных досок и управление доступом для коллег.
+ **Колонки и Задачи:** Гибкое создание колонок, перемещение задач (Drag & Drop).
+ **Детализация задач:** Поддержка приоритетов (Low, Medium, High), сроков выполнения (due date), подзадач и комментариев.
+ **Темы оформления:** Возможность кастомизации интерфейса при помощи цветовых тем.
+ **Общий доступ:** Возможность открытия доски с доступом по ссылке

## Инструкция по запуску
### Предварительные требования
* Docker и Docker Compose
* Node.js 20+ (для локальной разработки frontend)
* Python 3.14+ (для локальной разработки backend)

1. Склонируйте репозиторий
```bash
git clone https://github.com/lenemter/kanban-board-pp
cd kanban-board
```

2. Cоздайте файлы с секретами на основе примеров:
```bash
# Создайте папку для секретов (если она не создана)
mkdir secrets

# Скопируйте примеры секретов
cp secrets_example/POSTGRES_USER secrets/POSTGRES_USER
cp secrets_example/POSTGRES_PASSWORD secrets/POSTGRES_PASSWORD
```
3. Отредактируйте файл `api/.env.example`, переименовав его в `.env`, и укажите необходимые настройки (DB_NAME, MAIL_SERVER и др.).
```
cp api/.env.example api/.env
```

4. Запуск через Docker Compose

Выполните команду в корневой директории проекта:
```bash
docker-compose up --build
```
5. Доступ к приложению
* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:8000`
* Документация Swagger: `http://localhost:8000/docs`

### Запуск для разработки
Backend (вручную)
```
cd api
python -m venv venv
source venv/bin/activate  # Для Windows: venv\Scripts\activate
pip install -r requirements.txt
fastapi dev main.py --host 0.0.0.0 --port 8000
```

Frontend (вручную)
```
cd frontend
npm install
npm run dev
```

## Структура проекта
```
kanban-board/
├── api/                  # Backend FastAPI приложение
│   ├── api/
│   │   ├── db/           # Модели и утилиты базы данных
│   │   ├── routers/      # Маршруты API
│   │   ├── schemas/      # Pydantic схемы
│   │   └── utils.py      # Вспомогательные функции
│   ├── main.py           # Точка входа FastAPI
│   ├── requirements.txt  # Зависимости Python
│   └── Dockerfile        # Docker образ для API
├── frontend/              # Frontend React приложение
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы приложения
│   │   ├── api.js        # Клиент для API
│   │   └── styles.css    # Глобальные стили
│   ├── package.json      # Зависимости Node.js
│   └── Dockerfile        # Docker образ для frontend
├── docker-compose.yml    # Конфигурация Docker Compose
├── .gitignore           # Игнорируемые файлы Git
└── README.md            # Эта документация
```
