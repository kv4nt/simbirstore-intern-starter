# SimbirStore — API Reference

> **Base URL:** `http://localhost:{HTTP_PORT}/api/v1`  
> **Формат данных:** JSON (`Content-Type: application/json`)  
> **Авторизация:** Bearer JWT в заголовке `Authorization`

---

## Содержание

1. [Архитектура](#архитектура)
2. [Роли пользователей](#роли-пользователей)
3. [Формат ошибок](#формат-ошибок)
4. [Авторизация](#авторизация)
5. [Каталог](#каталог)
6. [Профиль](#профиль)
7. [Корзина](#корзина)
8. [Заказы](#заказы)
9. [Админ: заказы](#админ-заказы)
10. [Админ: товары](#админ-товары)
11. [Админ: категории](#админ-категории)
12. [Админ: пользователи](#админ-пользователи)
13. [Таблица ошибок](#таблица-ошибок)

---

## Архитектура

```
Browser
  │
  │  http://localhost:5173
  ▼
Vite Dev Server (Docker)
  │
  │  proxy: /api/* → http://localhost:{HTTP_PORT}
  ▼
Go Backend (локально)
  │
  │  DATABASE_URL
  ▼
PostgreSQL (Docker) :5432
```

Все запросы фронтенда идут на `/api/v1/...`. Vite-прокси прозрачно перенаправляет их на твой локальный Go-сервер.

---

## Роли пользователей

В системе существует **две роли**:

| Роль | Значение в БД | Кто |
|------|--------------|-----|
| Сотрудник | `employee` | **По умолчанию** при регистрации. Может покупать товары. |
| Администратор | `admin` | Назначается вручную в БД. Имеет доступ к `/admin/*` эндпоинтам. |

> ⚠️ Фронт в `stores/auth.js` проверяет роль через `user.role === 'admin'`. Любое другое значение (в том числе `employee`) считается обычным пользователем.

---

## Формат ошибок

Все ошибки возвращаются в едином формате:

```json
{
  "error": "код_ошибки",
  "details": "Человекочитаемое описание"
}
```

| HTTP-код | `error` | Когда |
|----------|---------|-------|
| `400` | `bad_request` | Невалидное тело запроса или параметры |
| `401` | `unauthorized` | Нет токена или токен недействителен |
| `402` | `insufficient_balance` | Не хватает монет |
| `403` | `forbidden` | Нет нужной роли |
| `404` | `not_found` | Ресурс не найден |
| `409` | `conflict` | Нарушение уникальности (дубликат email, code и т.д.) |
| `500` | `internal_error` | Внутренняя ошибка сервера |

---

## Авторизация

### POST /auth/register

Регистрация нового пользователя.

**Не требует токена.**

**Тело запроса:**
```json
{
  "email": "ivan@simbirsoft.com",
  "password": "secret123",
  "full_name": "Иван Иванов",
  "office": "Казань"
}
```

| Поле | Обязательное | Ограничения |
|------|:---:|-----------|
| `email` | ✅ | валидный формат |
| `password` | ✅ | минимум 6 символов |
| `full_name` | ✅ | минимум 2 символа |
| `office` | ❌ | — |

**Ответ `201`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": 5,
    "full_name": "Иван Иванов",
    "email": "ivan@simbirsoft.com",
    "role": "employee",
    "coin_balance": 0,
    "office": "Казань"
  }
}
```

**Ошибки:**
- `409 conflict` — email уже занят (`error: "email_taken"`)
- `400 bad_request` — невалидные поля

---

### POST /auth/login

Вход по email и паролю.

**Не требует токена.**

**Тело запроса:**
```json
{
  "email": "admin@simbirsoft.com",
  "password": "admin123"
}
```

**Ответ `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": 1,
    "full_name": "Алексей Тимлид",
    "email": "admin@simbirsoft.com",
    "role": "admin",
    "coin_balance": 0,
    "office": "Ульяновск"
  }
}
```

**Ошибки:**
- `401 unauthorized` — неверный email или пароль

---

### POST /auth/refresh

Обновление пары токенов.

**Не требует токена.**

**Тело запроса:**
```json
{ "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..." }
```

**Ответ `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "bmV3IHJlZnJlc2ggdG9rZW4..."
}
```

> Старый `refresh_token` становится недействительным (ротация).

**Ошибки:**
- `401 unauthorized` — токен просрочен или не найден в БД

---

### POST /auth/logout

Выход из системы.

**Требует:** `Authorization: Bearer <access_token>`

**Ответ `200`:**
```json
{ "ok": true }
```

---

## Каталог

### GET /categories

Список всех категорий товаров.

**Не требует токена.**

**Ответ `200`:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Одежда",
      "code": "clothes",
      "icon": "👕",
      "description": "Футболки, худи, кепки"
    }
  ]
}
```

> При пустой таблице возвращает `{ "items": [] }`, никогда не `null`.

---

### GET /products

Список товаров с фильтрацией и пагинацией.

**Не требует токена.**

**Query-параметры:**

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|:---:|---------|
| `category` | string | — | Фильтр по `code` категории (например `clothes`) |
| `search` | string | — | Поиск по названию (без учёта регистра) |
| `limit` | integer | `20` | Размер страницы (макс. 100) |
| `offset` | integer | `0` | Сдвиг для пагинации |

**Ответ `200`:**
```json
{
  "items": [
    {
      "id": 7,
      "name": "Футболка SimbirSoft",
      "description": "100% хлопок",
      "category_id": 1,
      "category_name": "Одежда",
      "category_code": "clothes",
      "price_coins": 300,
      "has_variants": true,
      "image_url": "https://example.com/tshirt.jpg",
      "variants": [
        {
          "id": 1,
          "size": "S",
          "color": "белый",
          "sku": "TSHIRT-S-WHT",
          "price_coins": null,
          "in_stock": true
        }
      ]
    }
  ]
}
```

> `price_coins` у варианта может быть `null` — тогда используется базовая цена товара.
> Неактивные товары (`is_active = false`) **не попадают** в выдачу.

---

### GET /products/{id}

Один товар по ID.

**Не требует токена.**

**Ответ `200`:** тот же объект что в списке, с полем `variants`.

**Ошибки:**
- `404 not_found` — товар не найден или неактивен

---

## Профиль

> Все эндпоинты профиля требуют `Authorization: Bearer <access_token>`.

### GET /me

Данные текущего пользователя.

**Ответ `200`:**
```json
{
  "id": 5,
  "full_name": "Иван Иванов",
  "email": "ivan@simbirsoft.com",
  "role": "employee",
  "coin_balance": 1500,
  "office": "Казань"
}
```

---

### GET /me/coins

История монетных транзакций текущего пользователя.

**Ответ `200`:**
```json
{
  "items": [
    {
      "id": 1,
      "type": "manual",
      "amount": 500,
      "balance": 500,
      "comment": "Начальный бонус",
      "admin_name": "Алексей Тимлид",
      "order_id": null,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "type": "order",
      "amount": -300,
      "balance": 200,
      "comment": null,
      "admin_name": null,
      "order_id": 42,
      "created_at": "2024-01-16T14:00:00Z"
    }
  ]
}
```

| Тип транзакции | `amount` | Описание |
|---------------|----------|----------|
| `manual` | положительный | Начисление от администратора |
| `order` | отрицательный | Списание при оформлении заказа |

---

### GET /me/stats

Агрегированная статистика профиля.

**Ответ `200`:**
```json
{
  "orders_count": 5,
  "coins_spent": 2500,
  "coins_earned": 3000
}
```

> Все поля — числа, никогда не `null`. При отсутствии данных — `0`.

---

## Корзина

> Все эндпоинты корзины требуют `Authorization: Bearer <access_token>`.

Корзина создаётся **автоматически** при первом обращении — явного создания нет.

### GET /cart

Текущая корзина пользователя.

**Ответ `200`:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 7,
      "product_name": "Футболка SimbirSoft",
      "variant_id": 2,
      "variant_label": "M / белый",
      "price_coins": 300,
      "quantity": 2
    }
  ],
  "total_coins": 600
}
```

> Пустая корзина: `{ "items": [], "total_coins": 0 }`

---

### POST /cart/items

Добавить товар в корзину.

**Тело запроса:**
```json
{
  "product_id": 7,
  "variant_id": 2,
  "quantity": 1
}
```

> Если товар с таким `product_id` + `variant_id` уже есть в корзине — `quantity` увеличивается, дубликат **не создаётся**.
> Если `has_variants = true` и `variant_id` не передан — `400`.

**Ответ `200`:** обновлённая корзина (как `GET /cart`)

---

### PATCH /cart/items/{itemId}

Изменить количество позиции.

**Тело запроса:**
```json
{ "quantity": 3 }
```

**Ответ `200`:** обновлённая корзина

**Ошибки:**
- `404 not_found` — позиция не найдена или принадлежит другому пользователю

---

### DELETE /cart/items/{itemId}

Удалить позицию из корзины.

**Ответ `200`:** обновлённая корзина

---

## Заказы

> Все эндпоинты заказов требуют `Authorization: Bearer <access_token>`.

### POST /orders/checkout

Оформить заказ из текущей корзины.

**Тело запроса:** пустое `{}`

**Ответ `201`:**
```json
{
  "id": 42,
  "status": "new",
  "total_coins": 600,
  "created_at": "2024-01-16T14:00:00Z",
  "items": [
    {
      "product_id": 7,
      "product_name": "Футболка SimbirSoft",
      "quantity": 2,
      "price_coins": 300
    }
  ]
}
```

**Ошибки:**
- `400 bad_request` — корзина пуста
- `402 insufficient_balance` — не хватает монет

> После успешного оформления: корзина **очищается**, баланс **списывается**, запись в `coin_transactions` **создаётся**.

---

### GET /orders

История заказов текущего пользователя.

**Ответ `200`:**
```json
{
  "items": [
    {
      "id": 42,
      "status": "completed",
      "total_coins": 600,
      "created_at": "2024-01-16T14:00:00Z"
    }
  ]
}
```

---

### GET /orders/{id}

Заказ с позициями.

**Ответ `200`:** полный объект заказа с полем `items`.

**Ошибки:**
- `404 not_found` — заказ не найден или принадлежит другому пользователю

---

## Админ: заказы

> Требуют токен с ролью `admin`. Пользователь с ролью `employee` получает `403`.

### GET /admin/orders

Все заказы всех пользователей.

**Query-параметры:**

| Параметр | Допустимые значения |
|----------|-------------------|
| `status` | `new`, `pending`, `confirmed`, `ready`, `done`, `completed`, `cancelled` |

**Ответ `200`:**
```json
{
  "items": [
    {
      "id": 42,
      "status": "new",
      "total_coins": 600,
      "created_at": "2024-01-16T14:00:00Z",
      "user_id": 5,
      "user_name": "Иван Иванов"
    }
  ]
}
```

---

### GET /admin/orders/{id}/items

Состав заказа.

**Ответ `200`:**
```json
{
  "order_id": 42,
  "total_coins": 600,
  "items": [
    {
      "item_id": 1,
      "product_id": 7,
      "product_name": "Футболка SimbirSoft",
      "image_url": "https://example.com/tshirt.jpg",
      "color": "белый",
      "size": "M",
      "quantity": 2,
      "price_coins": 300
    }
  ]
}
```

> `color` и `size` — всегда строка. Если варианта нет — пустая строка `""`, не `null`.

---

### PATCH /admin/orders/{id}/status

Изменить статус заказа.

**Тело запроса:**
```json
{ "status": "confirmed" }
```

**Ответ `200`:**
```json
{ "order_id": 42, "new_status": "confirmed" }
```

**Ошибки:**
- `400 bad_request` — недопустимое значение статуса
- `404 not_found` — заказ не найден

---

## Админ: товары

### POST /admin/products

Создать товар.

**Тело запроса:**
```json
{
  "name": "Худи SimbirSoft",
  "category_id": 1,
  "price_coins": 800,
  "description": "Тёплое худи",
  "has_variants": false,
  "is_active": true,
  "image_url": null
}
```

**Ответ `201`:** `{ "id": 10 }`

---

### PUT /admin/products/{id}

Обновить товар.

**Ответ `200`:** `{ "id": 10 }`

---

### DELETE /admin/products/{id}

Удалить товар (soft-delete: `is_active = false`).

**Ответ `200`:** `{ "deleted": 10 }`

> Товар **не удаляется из БД** — устанавливается флаг `is_active = false`. Он исчезает из каталога.

---

### POST /admin/products/{id}/variants

Добавить вариант к товару.

**Тело запроса:**
```json
{
  "size": "XL",
  "color": "чёрный",
  "sku": "HOOD-XL-BLK",
  "price_coins": null,
  "in_stock": true
}
```

**Ответ `201`:** `{ "id": 5 }`

> Добавление первого варианта автоматически ставит `has_variants = true` на товаре.

---

### PUT /admin/products/{id}/variants/{variantId}

Обновить вариант.

**Ответ `200`:** `{ "ok": true }`

---

### DELETE /admin/products/{id}/variants/{variantId}

Удалить вариант.

**Ответ `200`:** `{ "ok": true }`

> Удаление последнего варианта автоматически сбрасывает `has_variants = false`.

---

## Админ: категории

### POST /admin/categories

**Тело запроса:**
```json
{
  "code": "books",
  "name": "Книги",
  "icon": "📚",
  "description": "Корпоративная литература"
}
```

> `code` — только `[a-z0-9-]`, уникальный.

**Ответ `201`:** объект категории

**Ошибки:**
- `409 conflict` — `code` уже занят

---

### PUT /admin/categories/{id}

**Ответ `200`:** `{ "ok": true }`

---

### DELETE /admin/categories/{id}

**Ответ `200`:** `{ "ok": true }`

**Ошибки:**
- `409 conflict` — к категории привязаны товары

---

## Админ: пользователи

### GET /admin/users

Список всех пользователей.

**Ответ `200`:**
```json
{
  "items": [
    {
      "id": 5,
      "full_name": "Иван Иванов",
      "email": "ivan@simbirsoft.com",
      "role": "employee",
      "coin_balance": 1500,
      "office": "Казань"
    }
  ]
}
```

---

### POST /admin/users/coins

Начислить или списать монеты пользователю.

**Тело запроса:**
```json
{
  "user_id": 5,
  "amount": 500,
  "reason": "Премия за квартал"
}
```

> `amount` может быть отрицательным (списание). Баланс не может уйти в минус.

**Ответ `200`:**
```json
{
  "user_id": 5,
  "amount": 500,
  "new_balance": 2000,
  "reason": "Премия за квартал"
}
```

**Ошибки:**
- `404 not_found` — пользователь не найден
- `400 bad_request` — баланс уйдёт в минус

---

### GET /admin/users/{id}/transactions

История монет пользователя.

**Ответ `200`:** та же структура что и `GET /me/coins`.

**Ошибки:**
- `404 not_found` — пользователь не найден

---

## Таблица ошибок

| Симптом на фронте | HTTP-код | `error` | Причина |
|-------------------|----------|---------|--------|
| Форма логина не пускает | `401` | `unauthorized` | Неверный пароль или email |
| После логина — пустая страница | `401` | `unauthorized` | Просроченный access_token |
| Корзина не загружается | `401` | `unauthorized` | Нет заголовка Authorization |
| Кнопка «Оформить» неактивна | `402` | `insufficient_balance` | Мало монет |
| Админ-панель выдаёт 403 | `403` | `forbidden` | Токен employee, а не admin |
| Товар не отображается | `404` | `not_found` | `is_active = false` |
| Повторная регистрация | `409` | `conflict` / `email_taken` | Email уже в БД |
| Всё сломалось | `500` | `internal_error` | Смотри логи Go-сервера |
