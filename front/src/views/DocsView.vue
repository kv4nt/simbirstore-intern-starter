<template>
  <div class="docs-page">
    <div class="docs-header">
      <div class="docs-header-inner">
        <div class="docs-logo" @click="router.push('/')">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="5" fill="#0057B8"/>
            <path d="M6 6.5C6 5.12 7.12 4 8.5 4H14a1 1 0 010 2H8.5A.5.5 0 008 6.5v2a.5.5 0 00.5.5h5A3.5 3.5 0 0117 12.5v3a2.5 2.5 0 01-2.5 2.5H8a1 1 0 010-2h6.5a.5.5 0 00.5-.5v-3a1.5 1.5 0 00-1.5-1.5h-5A2.5 2.5 0 016 9V6.5z" fill="white"/>
          </svg>
          <span class="docs-logo-text">Simbir<span style="color:#F5A623">Store</span></span>
          <span class="docs-divider">/</span>
          <span class="docs-title-badge">API Docs</span>
        </div>
        <div class="docs-header-actions">
          <button class="docs-back-btn" @click="router.push('/')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            На сайт
          </button>
        </div>
      </div>
    </div>

    <div class="docs-body">
      <!-- Сайдбар с навигацией по тегам -->
      <aside class="docs-sidebar">
        <div class="docs-sidebar-section">
          <div class="docs-sidebar-title">Разделы</div>
          <a
            v-for="tag in tags" :key="tag.name"
            class="docs-sidebar-link"
            :class="{ active: activeTag === tag.name }"
            @click="scrollToTag(tag.name)"
          >
            <span class="docs-sidebar-icon">{{ tag.icon }}</span>
            {{ tag.name }}
          </a>
        </div>

        <div class="docs-sidebar-section">
          <div class="docs-sidebar-title">Быстрый старт</div>
          <div class="docs-quickstart">
            <div class="docs-qs-step">
              <span class="docs-qs-num">1</span>
              <span>Получи токен через <code>POST /auth/login</code></span>
            </div>
            <div class="docs-qs-step">
              <span class="docs-qs-num">2</span>
              <span>Добавь заголовок <code>Authorization: Bearer &lt;token&gt;</code></span>
            </div>
            <div class="docs-qs-step">
              <span class="docs-qs-num">3</span>
              <span>Вызывай нужные эндпоинты</span>
            </div>
          </div>
        </div>

        <div class="docs-sidebar-section">
          <div class="docs-sidebar-title">Базовый URL</div>
          <code class="docs-base-url">http://localhost:5173/api</code>
        </div>
      </aside>

      <!-- Основной контент -->
      <main class="docs-main">

        <!-- Intro -->
        <div class="docs-intro-card">
          <div class="docs-intro-left">
            <div class="docs-version-badge">v1.0.0</div>
            <h1 class="docs-intro-title">SimbirStore API</h1>
            <p class="docs-intro-desc">
              REST API для корпоративного магазина SimbirSoft.
              Используй JWT-токен для авторизации. Роль <code>admin</code> открывает управление
              пользователями, товарами и начислением монет.
            </p>
          </div>
          <div class="docs-auth-block">
            <div class="docs-auth-title">🔑 Аутентификация</div>
            <div class="docs-auth-code">
              <span class="docs-code-comment"># Получить токен</span><br>
              <span class="docs-code-method post">POST</span> /auth/login<br><br>
              <span class="docs-code-comment"># Использовать в запросах</span><br>
              Authorization: Bearer &lt;token&gt;
            </div>
          </div>
        </div>

        <!-- Ошибки -->
        <div class="docs-errors-card">
          <div class="docs-errors-title">⚠️ Коды ошибок</div>
          <div class="docs-errors-grid">
            <div v-for="e in errorCodes" :key="e.code" class="docs-error-row">
              <code class="docs-error-code">{{ e.code }}</code>
              <span class="docs-error-desc">{{ e.desc }}</span>
              <span class="docs-error-http">HTTP {{ e.http }}</span>
            </div>
          </div>
        </div>

        <!-- Эндпоинты по тегам -->
        <div
          v-for="tag in tags"
          :key="tag.name"
          :id="'tag-' + slugify(tag.name)"
          class="docs-tag-section"
        >
          <div class="docs-tag-header">
            <span class="docs-tag-icon">{{ tag.icon }}</span>
            <h2 class="docs-tag-name">{{ tag.name }}</h2>
            <span v-if="tag.auth" class="docs-tag-auth">🔒 Требует токен</span>
            <span v-if="tag.adminOnly" class="docs-tag-admin">⚙️ Только admin</span>
          </div>

          <div class="docs-endpoints">
            <div
              v-for="ep in tag.endpoints"
              :key="ep.method + ep.path"
              class="docs-endpoint"
              :class="{ open: ep._open }"
            >
              <div class="docs-endpoint-header" @click="ep._open = !ep._open">
                <span class="docs-method" :class="'method-' + ep.method.toLowerCase()">{{ ep.method }}</span>
                <code class="docs-path">{{ ep.path }}</code>
                <span class="docs-summary">{{ ep.summary }}</span>
                <svg class="docs-chevron" :class="{ rotated: ep._open }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              <div v-if="ep._open" class="docs-endpoint-body">
                <p v-if="ep.description" class="docs-ep-desc">{{ ep.description }}</p>

                <template v-if="ep.params && ep.params.length">
                  <div class="docs-ep-section-title">Параметры</div>
                  <table class="docs-params-table">
                    <thead><tr><th>Имя</th><th>Где</th><th>Тип</th><th>Обязательный</th><th>Описание</th></tr></thead>
                    <tbody>
                      <tr v-for="p in ep.params" :key="p.name">
                        <td><code>{{ p.name }}</code></td>
                        <td><span class="docs-param-in" :class="'in-' + p.in">{{ p.in }}</span></td>
                        <td><code>{{ p.type }}</code></td>
                        <td>{{ p.required ? '✅' : '—' }}</td>
                        <td>{{ p.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </template>

                <template v-if="ep.body">
                  <div class="docs-ep-section-title">Тело запроса <span class="docs-content-type">application/json</span></div>
                  <pre class="docs-code-block docs-request-body">{{ ep.body }}</pre>
                </template>

                <div class="docs-ep-section-title">Ответы</div>
                <div class="docs-responses">
                  <div v-for="r in ep.responses" :key="r.code" class="docs-response-row">
                    <div class="docs-resp-row-top">
                      <span class="docs-resp-code" :class="respCls(r.code)">{{ r.code }}</span>
                      <span class="docs-resp-desc">{{ r.desc }}</span>
                    </div>
                    <pre v-if="r.example" class="docs-code-block docs-resp-example">{{ r.example }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>

    <footer class="docs-footer">
      <span>© 2026 SimbirStore</span>
      <span>·</span>
      <span>Только для сотрудников SimbirSoft</span>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTag = ref('Auth')

const errorCodes = [
  { code: 'unauthorized',         http: 401, desc: 'Не передан или невалидный JWT токен' },
  { code: 'forbidden',            http: 403, desc: 'Нет прав доступа (нужна роль admin)' },
  { code: 'not_found',            http: 404, desc: 'Ресурс не найден' },
  { code: 'insufficient_balance', http: 402, desc: 'Недостаточно монет на балансе пользователя' },
  { code: 'validation_error',     http: 400, desc: 'Ошибка валидации тела запроса' },
]

function slugify(s) { return s.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-') }

function scrollToTag(name) {
  activeTag.value = name
  const el = document.getElementById('tag-' + slugify(name))
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function respCls(code) {
  if (code < 300) return 'resp-2xx'
  if (code < 400) return 'resp-3xx'
  if (code < 500) return 'resp-4xx'
  return 'resp-5xx'
}

const tags = ref([
  {
    name: 'Auth', icon: '🔓', auth: false, adminOnly: false,
    endpoints: [
      {
        method: 'POST', path: '/auth/register', summary: 'Регистрация нового пользователя', _open: false,
        body: JSON.stringify({ email: 'ivan@simbirsoft.com', password: 'secret123', full_name: 'Иван Иванов', office: 'Ульяновск' }, null, 2),
        responses: [
          { code: 201, desc: 'Пользователь создан', example: JSON.stringify({ token: 'eyJ...', user: { id: 1, full_name: 'Иван Иванов', email: 'ivan@simbirsoft.com', role: 'user', coin_balance: 0 } }, null, 2) },
          { code: 409, desc: 'Email уже занят', example: JSON.stringify({ error: 'email_taken' }, null, 2) },
        ]
      },
      {
        method: 'POST', path: '/auth/login', summary: 'Вход — получить JWT токен', _open: false,
        body: JSON.stringify({ email: 'ivan@simbirsoft.com', password: 'secret123' }, null, 2),
        responses: [
          { code: 200, desc: 'Токен выдан', example: JSON.stringify({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', user: { id: 1, full_name: 'Иван Иванов', role: 'user', coin_balance: 1500 } }, null, 2) },
          { code: 401, desc: 'Неверный email или пароль', example: JSON.stringify({ error: 'unauthorized' }, null, 2) },
        ]
      },
    ]
  },
  {
    name: 'Profile', icon: '👤', auth: true, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/me', summary: 'Профиль текущего пользователя', _open: false,
        responses: [
          { code: 200, desc: 'Данные профиля', example: JSON.stringify({ id: 5, full_name: 'Иван Иванов', email: 'ivan@simbirsoft.com', role: 'user', coin_balance: 1500, office: 'Ульяновск' }, null, 2) },
          { code: 401, desc: 'Требуется авторизация' },
        ]
      },
      {
        method: 'GET', path: '/me/transactions', summary: 'История монет текущего пользователя', _open: false,
        params: [
          { name: 'limit',  in: 'query', type: 'integer', required: false, desc: 'Кол-во записей (макс. 100, по умолч. 50)' },
          { name: 'offset', in: 'query', type: 'integer', required: false, desc: 'Смещение для пагинации' },
        ],
        responses: [
          { code: 200, desc: 'Список транзакций', example: JSON.stringify([
            { id: 31, amount: 1000, comment: 'Победитель хакатона Q2', balance: 2500, admin_name: 'Алексей Тимлид', created_at: '2025-06-01T12:00:00Z' },
            { id: 28, amount: -200, comment: 'Корректировка', balance: 1500, admin_name: 'Алексей Тимлид', created_at: '2025-05-15T09:30:00Z' },
          ], null, 2) },
          { code: 401, desc: 'Требуется авторизация' },
        ]
      },
    ]
  },
  {
    name: 'Products', icon: '🛋️', auth: false, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/products', summary: 'Список товаров каталога', _open: false,
        params: [
          { name: 'category', in: 'query', type: 'string',  required: false, desc: 'Фильтр по коду категории (например "clothes")' },
          { name: 'search',   in: 'query', type: 'string',  required: false, desc: 'Поиск по названию' },
          { name: 'limit',    in: 'query', type: 'integer', required: false, desc: 'По умолчанию 20' },
          { name: 'offset',   in: 'query', type: 'integer', required: false, desc: 'Смещение' },
        ],
        responses: [
          { code: 200, desc: 'Массив товаров', example: JSON.stringify([{ id: 1, name: 'Толстовка SimbirSoft', price_coins: 500, category_name: 'Одежда', category_code: 'clothes', has_variants: true }], null, 2) },
        ]
      },
      {
        method: 'GET', path: '/products/:id', summary: 'Получить товар по ID', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        responses: [
          { code: 200, desc: 'Товар', example: JSON.stringify({ id: 42, name: 'Толстовка SimbirSoft', price_coins: 500, category_id: 1, has_variants: true }, null, 2) },
          { code: 404, desc: 'Товар не найден' },
        ]
      },
    ]
  },
  {
    name: 'Categories', icon: '🏷️', auth: false, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/categories', summary: 'Список всех категорий', _open: false,
        responses: [
          { code: 200, desc: 'Массив категорий', example: JSON.stringify([{ id: 1, name: 'Одежда', code: 'clothes' }, { id: 2, name: 'Канцелярия', code: 'stationery' }], null, 2) },
        ]
      },
    ]
  },
  {
    name: 'Cart', icon: '🛒', auth: true, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/cart', summary: 'Получить корзину', _open: false,
        responses: [{ code: 200, desc: 'Корзина', example: JSON.stringify({ items: [{ product_id: 1, product_name: 'Толстовка', price_coins: 500, quantity: 2 }], total_coins: 1000 }, null, 2) }]
      },
      {
        method: 'POST', path: '/cart/items', summary: 'Добавить товар в корзину', _open: false,
        body: JSON.stringify({ product_id: 42, quantity: 1 }, null, 2),
        responses: [
          { code: 200, desc: 'Обновлённая корзина' },
          { code: 404, desc: 'Товар не найден' },
        ]
      },
      {
        method: 'PUT', path: '/cart/items/:product_id', summary: 'Изменить количество', _open: false,
        params: [{ name: 'product_id', in: 'path', type: 'integer', required: true, desc: 'ID товара в корзине' }],
        body: JSON.stringify({ quantity: 3 }, null, 2),
        responses: [{ code: 200, desc: 'Обновлённая корзина' }]
      },
      {
        method: 'DELETE', path: '/cart/items/:product_id', summary: 'Удалить товар из корзины', _open: false,
        params: [{ name: 'product_id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        responses: [{ code: 200, desc: 'Обновлённая корзина' }]
      },
      {
        method: 'POST', path: '/cart/checkout', summary: 'Оформить заказ (списать монеты)', _open: false,
        description: 'Создаёт заказ из текущей корзины. Монеты списываются атомарно вместе с созданием заказа.',
        responses: [
          { code: 201, desc: 'Заказ создан', example: JSON.stringify({ id: 101, status: 'pending', total_coins: 1000, created_at: '2025-06-01T12:00:00Z' }, null, 2) },
          { code: 402, desc: 'Недостаточно монет', example: JSON.stringify({ error: 'insufficient_balance' }, null, 2) },
          { code: 422, desc: 'Корзина пустая' },
        ]
      },
    ]
  },
  {
    name: 'Orders', icon: '📦', auth: true, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/orders', summary: 'История заказов текущего пользователя', _open: false,
        responses: [{ code: 200, desc: 'Массив заказов', example: JSON.stringify([{ id: 101, status: 'pending', total_coins: 1000, created_at: '2025-06-01T12:00:00Z' }], null, 2) }]
      },
      {
        method: 'GET', path: '/orders/:id', summary: 'Получить заказ с позициями', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID заказа' }],
        responses: [
          { code: 200, desc: 'Заказ с позициями', example: JSON.stringify({ id: 101, status: 'pending', total_coins: 1000, items: [{ product_id: 1, product_name: 'Толстовка', price_coins: 500, quantity: 2 }] }, null, 2) },
          { code: 404, desc: 'Заказ не найден' },
        ]
      },
    ]
  },
  {
    name: 'Admin · Orders', icon: '📋', auth: true, adminOnly: true,
    endpoints: [
      {
        method: 'GET', path: '/admin/orders', summary: 'Все заказы всех пользователей', _open: false,
        responses: [
          { code: 200, desc: 'Массив заказов с именами сотрудников', example: JSON.stringify([{ id: 101, user_id: 5, user_name: 'Иван Иванов', status: 'pending', total_coins: 1000, created_at: '2025-06-01T12:00:00Z' }], null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
        ]
      },
      {
        method: 'PATCH', path: '/admin/orders/:id/status', summary: 'Изменить статус заказа', _open: false,
        description: 'Допустимые переходы: pending→confirmed|cancelled, confirmed→ready|cancelled, ready→done',
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID заказа' }],
        body: JSON.stringify({ status: 'confirmed' }, null, 2),
        responses: [
          { code: 200, desc: 'Статус обновлён', example: JSON.stringify({ ok: true }, null, 2) },
          { code: 422, desc: 'Недопустимый переход статуса', example: JSON.stringify({ error: 'invalid_transition' }, null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
        ]
      },
    ]
  },
  {
    name: 'Admin · Products', icon: '🛋️', auth: true, adminOnly: true,
    endpoints: [
      {
        method: 'POST', path: '/admin/products', summary: 'Создать товар', _open: false,
        body: JSON.stringify({ name: 'Толстовка SimbirSoft', description: 'Мягкая толстовка', category_id: 1, price_coins: 500, has_variants: true }, null, 2),
        responses: [
          { code: 201, desc: 'Товар создан', example: JSON.stringify({ id: 42 }, null, 2) },
          { code: 403, desc: 'Нет прав' },
        ]
      },
      {
        method: 'PUT', path: '/admin/products/:id', summary: 'Обновить товар', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        body: JSON.stringify({ name: 'Новое название', price_coins: 600, category_id: 1, has_variants: false }, null, 2),
        responses: [
          { code: 200, desc: 'Обновлено', example: JSON.stringify({ ok: true }, null, 2) },
          { code: 404, desc: 'Не найден' },
        ]
      },
      {
        method: 'DELETE', path: '/admin/products/:id', summary: 'Удалить товар', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        responses: [
          { code: 200, desc: 'Удалено', example: JSON.stringify({ ok: true }, null, 2) },
          { code: 404, desc: 'Не найден' },
        ]
      },
    ]
  },
  {
    name: 'Admin · Categories', icon: '🏷️', auth: true, adminOnly: true,
    endpoints: [
      {
        method: 'POST', path: '/admin/categories', summary: 'Создать категорию', _open: false,
        body: JSON.stringify({ name: 'Одежда', code: 'clothes' }, null, 2),
        responses: [{ code: 201, desc: 'Категория создана', example: JSON.stringify({ id: 3 }, null, 2) }]
      },
      {
        method: 'PUT', path: '/admin/categories/:id', summary: 'Обновить категорию', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID категории' }],
        body: JSON.stringify({ name: 'Одежда и обувь', code: 'clothes' }, null, 2),
        responses: [{ code: 200, desc: 'Обновлено', example: JSON.stringify({ ok: true }, null, 2) }]
      },
      {
        method: 'DELETE', path: '/admin/categories/:id', summary: 'Удалить категорию', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID категории' }],
        responses: [{ code: 200, desc: 'Удалено', example: JSON.stringify({ ok: true }, null, 2) }]
      },
    ]
  },
  {
    name: 'Admin · Users', icon: '👥', auth: true, adminOnly: true,
    endpoints: [
      {
        method: 'GET', path: '/admin/users', summary: 'Список всех пользователей с балансами', _open: false,
        responses: [
          { code: 200, desc: 'Массив пользователей', example: JSON.stringify([{ id: 5, full_name: 'Иван Иванов', email: 'ivan@simbirsoft.com', role: 'user', coin_balance: 1500, office: 'Ульяновск' }], null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
        ]
      },
      {
        method: 'POST', path: '/admin/users/coins', summary: 'Начислить или списать монеты', _open: false,
        description: 'Положительный amount — начисление. Отрицательный — списание. Поле reason обязательно (мин. 3 символа). Если баланс уйдёт в минус — вернётся insufficient_balance.',
        body: JSON.stringify({ user_id: 5, amount: 1000, reason: 'Победитель хакатона Q2 2025' }, null, 2),
        responses: [
          { code: 200, desc: 'Операция выполнена', example: JSON.stringify({ ok: true, new_balance: 2500 }, null, 2) },
          { code: 400, desc: 'Ошибка валидации', example: JSON.stringify({ error: 'validation_error', details: 'reason: min length 3' }, null, 2) },
          { code: 402, desc: 'Недостаточно монет', example: JSON.stringify({ error: 'insufficient_balance' }, null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
          { code: 404, desc: 'Пользователь не найден' },
        ]
      },
      {
        method: 'GET', path: '/admin/users/:id/transactions', summary: 'История монет пользователя', _open: false,
        description: 'Полная история начислений и списаний. Поле balance — баланс ПОСЛЕ каждой операции.',
        params: [
          { name: 'id',     in: 'path',  type: 'integer', required: true,  desc: 'ID пользователя' },
          { name: 'limit',  in: 'query', type: 'integer', required: false, desc: 'Макс. 200, по умолч. 100' },
          { name: 'offset', in: 'query', type: 'integer', required: false, desc: 'Смещение' },
        ],
        responses: [
          { code: 200, desc: 'Список транзакций', example: JSON.stringify([
            { id: 31, amount: 1000, comment: 'Победитель хакатона Q2 2025', balance: 2500, admin_name: 'Алексей Тимлид', created_at: '2025-06-01T12:00:00Z' },
            { id: 28, amount: -200, comment: 'Корректировка', balance: 1500, admin_name: 'Алексей Тимлид', created_at: '2025-05-15T09:30:00Z' },
          ], null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
          { code: 404, desc: 'Пользователь не найден' },
        ]
      },
    ]
  },
])
</script>

<style scoped>
.docs-page { min-height: 100vh; background: #F0F4FA; display: flex; flex-direction: column; font-family: 'Inter', system-ui, sans-serif; }

/* Header */
.docs-header { background: #0D1A2E; color: white; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid rgba(255,255,255,.08); }
.docs-header-inner { max-width: 1300px; margin: 0 auto; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
.docs-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.docs-logo-text { font-weight: 700; font-size: 17px; color: white; }
.docs-divider { color: rgba(255,255,255,.3); font-size: 18px; margin: 0 2px; }
.docs-title-badge { background: rgba(255,255,255,.12); color: rgba(255,255,255,.85); font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 20px; letter-spacing: .3px; }
.docs-back-btn { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; background: transparent; color: rgba(255,255,255,.6); border: 1px solid rgba(255,255,255,.15); transition: background .15s, color .15s; }
.docs-back-btn:hover { background: rgba(255,255,255,.08); color: white; }

/* Body */
.docs-body { flex: 1; max-width: 1300px; margin: 0 auto; width: 100%; padding: 24px 24px 48px; display: grid; grid-template-columns: 240px 1fr; gap: 28px; }

/* Sidebar */
.docs-sidebar { position: sticky; top: 72px; height: fit-content; display: flex; flex-direction: column; gap: 16px; }
.docs-sidebar-section { background: white; border-radius: 12px; border: 1px solid #D8E4F0; padding: 16px; }
.docs-sidebar-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #8EA4BC; margin-bottom: 10px; }
.docs-sidebar-link { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px; font-size: 13px; font-weight: 500; color: #4A607A; cursor: pointer; transition: background .15s, color .15s; }
.docs-sidebar-link:hover { background: #EFF4FF; color: #0057B8; }
.docs-sidebar-link.active { background: #EFF4FF; color: #0057B8; font-weight: 600; }
.docs-sidebar-icon { width: 18px; text-align: center; }
.docs-base-url { display: block; font-size: 12px; background: #F0F4FA; padding: 8px 10px; border-radius: 6px; color: #0057B8; word-break: break-all; font-family: monospace; }
.docs-quickstart { display: flex; flex-direction: column; gap: 8px; }
.docs-qs-step { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #4A607A; line-height: 1.5; }
.docs-qs-num { background: #0057B8; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.docs-qs-step code { background: #F0F4FA; padding: 1px 5px; border-radius: 4px; font-size: 11px; color: #0047A0; }

/* Main */
.docs-main { display: flex; flex-direction: column; gap: 24px; }

/* Intro */
.docs-intro-card { background: linear-gradient(135deg, #0047A0, #0069cc); color: white; border-radius: 16px; padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
.docs-version-badge { background: rgba(255,255,255,.15); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; display: inline-block; margin-bottom: 10px; }
.docs-intro-title { font-size: 26px; font-weight: 800; margin-bottom: 10px; }
.docs-intro-desc { font-size: 14px; opacity: .85; line-height: 1.6; max-width: 400px; }
.docs-intro-desc code { background: rgba(255,255,255,.15); padding: 1px 6px; border-radius: 4px; font-size: 12px; }
.docs-auth-block { background: rgba(0,0,0,.2); border-radius: 12px; padding: 20px; }
.docs-auth-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; opacity: .9; }
.docs-auth-code { font-family: monospace; font-size: 12px; line-height: 2; opacity: .85; }
.docs-code-comment { opacity: .55; font-style: italic; }
.docs-code-method { padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.post { background: rgba(80,200,120,.3); color: #90EE90; }

/* Errors */
.docs-errors-card { background: white; border: 1px solid #D8E4F0; border-radius: 12px; padding: 20px 24px; }
.docs-errors-title { font-size: 14px; font-weight: 700; color: #0D1A2E; margin-bottom: 14px; }
.docs-errors-grid { display: flex; flex-direction: column; gap: 8px; }
.docs-error-row { display: grid; grid-template-columns: 200px 1fr 80px; gap: 12px; align-items: center; padding: 8px 12px; border-radius: 8px; background: #F8FAFC; }
.docs-error-code { font-family: monospace; font-size: 12px; font-weight: 600; color: #C0392B; }
.docs-error-desc { font-size: 13px; color: #4A607A; }
.docs-error-http { font-size: 12px; font-weight: 700; color: #8EA4BC; text-align: right; }

/* Tag section */
.docs-tag-section { display: flex; flex-direction: column; gap: 10px; scroll-margin-top: 80px; }
.docs-tag-header { display: flex; align-items: center; gap: 10px; padding: 4px 0 8px; border-bottom: 2px solid #D8E4F0; }
.docs-tag-icon { font-size: 18px; }
.docs-tag-name { font-size: 18px; font-weight: 800; color: #0D1A2E; }
.docs-tag-auth { background: #EFF4FF; color: #0057B8; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
.docs-tag-admin { background: #FFF3DB; color: #7A5000; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }

/* Endpoints */
.docs-endpoints { display: flex; flex-direction: column; gap: 8px; }
.docs-endpoint { background: white; border: 1px solid #D8E4F0; border-radius: 12px; overflow: hidden; transition: box-shadow .15s; }
.docs-endpoint.open { box-shadow: 0 4px 16px rgba(0,87,184,.08); }
.docs-endpoint-header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; cursor: pointer; transition: background .15s; }
.docs-endpoint-header:hover { background: #F8FAFC; }
.docs-method { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: .4px; min-width: 64px; text-align: center; font-family: monospace; }
.method-get    { background: #E0EEFF; color: #0057B8; }
.method-post   { background: #D4F4E2; color: #1A6B3A; }
.method-put    { background: #FFF3DB; color: #8A5000; }
.method-patch  { background: #F3E8FF; color: #6B21A8; }
.method-delete { background: #FFE5E2; color: #9B1C1C; }
.docs-path    { font-family: monospace; font-size: 13px; font-weight: 600; color: #0D1A2E; }
.docs-summary { font-size: 13px; color: #4A607A; flex: 1; }
.docs-chevron { color: #8EA4BC; margin-left: auto; flex-shrink: 0; transition: transform .2s; }
.docs-chevron.rotated { transform: rotate(180deg); }

/* Endpoint body */
.docs-endpoint-body { padding: 20px 18px; border-top: 1px solid #EEF3FA; display: flex; flex-direction: column; gap: 16px; }
.docs-ep-desc { font-size: 13px; color: #4A607A; line-height: 1.6; }
.docs-ep-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #8EA4BC; margin-bottom: 4px; }
.docs-content-type { background: #F0F4FA; color: #0057B8; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; margin-left: 8px; font-family: monospace; text-transform: none; }

/* Params table */
.docs-params-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.docs-params-table th { text-align: left; padding: 7px 10px; background: #F8FAFC; color: #8EA4BC; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
.docs-params-table td { padding: 8px 10px; border-bottom: 1px solid #EEF3FA; color: #4A607A; }
.docs-params-table tr:last-child td { border-bottom: none; }
.docs-params-table code { background: #F0F4FA; padding: 1px 5px; border-radius: 4px; font-size: 11px; color: #0047A0; }
.docs-param-in { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.in-path  { background: #F3E8FF; color: #6B21A8; }
.in-query { background: #E0EEFF; color: #0057B8; }

/* Code blocks */
.docs-code-block { background: #0D1A2E; color: #A8D8A8; font-family: monospace; font-size: 12px; padding: 14px 16px; border-radius: 8px; overflow-x: auto; white-space: pre; line-height: 1.6; margin: 0; }
.docs-request-body { color: #F5C842; }

/* Responses */
.docs-responses { display: flex; flex-direction: column; gap: 10px; }
.docs-response-row { display: flex; flex-direction: column; gap: 6px; }
.docs-resp-row-top { display: flex; align-items: center; gap: 10px; }
.docs-resp-code { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: monospace; min-width: 44px; text-align: center; }
.resp-2xx { background: #D4F4E2; color: #1A6B3A; }
.resp-3xx { background: #E0EEFF; color: #0057B8; }
.resp-4xx { background: #FFE5E2; color: #9B1C1C; }
.resp-5xx { background: #F3E8FF; color: #6B21A8; }
.docs-resp-desc { font-size: 13px; color: #4A607A; }
.docs-resp-example { margin-top: 2px; }

/* Footer */
.docs-footer { background: #0D1A2E; color: rgba(255,255,255,.4); text-align: center; padding: 16px; font-size: 12px; display: flex; justify-content: center; gap: 8px; }

@media (max-width: 900px) {
  .docs-body { grid-template-columns: 1fr; }
  .docs-sidebar { position: static; }
  .docs-intro-card { grid-template-columns: 1fr; }
}
</style>
