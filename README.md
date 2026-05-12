# SimbirStore — Стартовый каркас

Добро пожаловать! Этот репозиторий — твоя точка старта. Здесь уже настроен **фронтенд** (Vue 3) и **база данных** (PostgreSQL), запускаемые через Docker. Твоя задача — написать **бэкенд на Go**.

## Стек

| Слой | Технология |
|------|------------|
| Фронтенд | Vue 3 + Vite + Pinia |
| База данных | PostgreSQL 16 |
| Бэкенд (твоя задача) | Go + Gin |

---

## Быстрый старт

### 1. Клонируй репозиторий

```bash
git clone https://github.com/kv4nt/simbirstore-intern-starter.git
cd simbirstore-intern-starter
```

### 2. Скопируй env-файлы

```bash
# Переменные для Go-бэкенда
cp .env.example .env

# Переменные для фронтенда (адрес бэкенда)
cp front/.env.example front/.env
```

> ⚠️ Если ты хочешь использовать другой порт (не `8080`) — измени `HTTP_PORT` в `.env`  
> и `VITE_API_TARGET` в `front/.env` **на одинаковое значение**.

### 3. Запусти PostgreSQL и фронтенд через Docker

```bash
docker-compose up -d
```

После этого:
- 🌐 Фронт доступен на [http://localhost:5173](http://localhost:5173)
- 🐘 PostgreSQL доступен на `localhost:5432`

### 4. Запусти свой Go-бэкенд локально

```bash
go run ./cmd/app
```

Фронт автоматически проксирует все запросы `/api/*` на локальный бэкенд.

---

## Схема работы

```
Docker:  PostgreSQL  :5432  ←──────────────────┤
Docker:  Frontend    :5173                      │ DATABASE_URL
              │                                 │
              │ proxy /api/*                    │
              ▼                                 │
Local:   Go backend  :8080  ────────────────────┘
```

---

## Структура репозитория

```
simbirstore-intern-starter/
├── front/                  # Vue 3 фронтенд (не трогать)
│   ├── src/
│   │   ├── api/            # axios-клиенты для каждого домена
│   │   ├── stores/         # Pinia-сторы (auth, cart, products...)
│   │   ├── views/          # Страницы приложения
│   │   └── components/     # Переиспользуемые компоненты
│   ├── .env.example        # Шаблон env для фронта
│   └── Dockerfile
├── docs/
│   ├── swagger.yaml        # OpenAPI-спецификация
│   └── api-reference.md    # Документация по API (читать обязательно!)
├── docker-compose.yml      # PostgreSQL + Frontend
├── .env.example            # Шаблон env для Go-бэкенда
└── README.md
```

---

## Переменные окружения

### `.env` (корень — для Go-бэкенда)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `APP_ENV` | Окружение | `local` |
| `HTTP_PORT` | Порт Go-сервера | `8080` |
| `DATABASE_URL` | Строка подключения к PostgreSQL | `postgres://postgres:postgres@localhost:5432/simbirstore?sslmode=disable` |
| `JWT_SECRET` | Секрет для подписи JWT (мин. 32 символа) | `change-this-in-production-min-32-chars` |
| `NGINX_PORT` | Порт nginx в prod-режиме | `80` |

### `front/.env` (для фронтенда)

| Переменная | Описание | Пример |
|------------|----------|--------|
| `VITE_API_TARGET` | Адрес Go-бэкенда | `http://localhost:8080` |
| `VITE_PORT` | Порт Vite dev-сервера | `5173` |
| `NGINX_PORT` | Порт nginx в prod-режиме | `80` |

---

## Документация по API

Перед написанием бэкенда **обязательно прочитай** документацию:

📄 [docs/api-reference.md](./docs/api-reference.md)

Там описаны все эндпоинты, форматы запросов/ответов и коды ошибок.

---

## Задачи

Список задач с описанием и критериями приёмки — в GitHub Issues этого репозитория.

Порядок выполнения:
1. `POST /api/v1/auth/register` — регистрация
2. `POST /api/v1/auth/login` — авторизация
3. `POST /api/v1/auth/refresh` + `logout`
4. Middleware: JWT + проверка роли admin
5. Каталог: products, categories
6. Корзина
7. Заказы
8. Админ-панель

---

## Полезные команды

```bash
# Посмотреть логи фронта
docker-compose logs -f frontend

# Посмотреть логи postgres
docker-compose logs -f postgres

# Остановить все контейнеры
docker-compose down

# Сбросить базу данных (удалить volume)
docker-compose down -v
```

---

## Вопросы?

Задавай вопросы тимлиду или пиши в рабочий чат. Не застревай больше 30 минут — спрашивай!
