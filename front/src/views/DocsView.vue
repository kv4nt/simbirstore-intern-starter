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
      <!-- Сайдбар -->
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
              <span>Добавь заголовок <code>Authorization: Bearer &lt;access_token&gt;</code></span>
            </div>
            <div class="docs-qs-step">
              <span class="docs-qs-num">3</span>
              <span>Вызывай нужные эндпоинты</span>
            </div>
          </div>
        </div>

        <div class="docs-sidebar-section">
          <div class="docs-sidebar-title">Базовый URL</div>
          <code class="docs-base-url">http://localhost:5173/api/v1</code>
        </div>

        <div class="docs-sidebar-section">
          <div class="docs-sidebar-title">Роли</div>
          <div class="docs-roles">
            <div class="docs-role-row">
              <code class="docs-role-badge employee">employee</code>
              <span>По умолчанию при регистрации</span>
            </div>
            <div class="docs-role-row">
              <code class="docs-role-badge admin">admin</code>
              <span>Назначается вручную в БД</span>
            </div>
          </div>
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
              пользователями, товарами и начислением монет. По умолчанию все пользователи получают роль <code>employee</code>.
            </p>
          </div>
          <div class="docs-auth-block">
            <div class="docs-auth-title">🔑 Аутентификация</div>
            <div class="docs-auth-code">
              <span class="docs-code-comment"># Получить токен</span><br>
              <span class="docs-code-method post">POST</span> /auth/login<br><br>
              <span class="docs-code-comment"># Использовать в запросах</span><br>
              Authorization: Bearer &lt;access_token&gt;<br><br>
              <span class="docs-code-comment"># Обновить токен</span><br>
              <span class="docs-code-method post">POST</span> /auth/refresh
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
  { code: 'bad_request',          http: 400, desc: 'Невалидное тело запроса или параметры' },
  { code: 'unauthorized',         http: 401, desc: 'Не передан или невалидный JWT токен' },
  { code: 'insufficient_balance', http: 402, desc: 'Недостаточно монет на балансе' },
  { code: 'forbidden',            http: 403, desc: 'Нет прав доступа (нужна роль admin)' },
  { code: 'not_found',            http: 404, desc: 'Ресурс не найден' },
  { code: 'conflict',             http: 409, desc: 'Нарушение уникальности (дубликат email, code и т.д.)' },
  { code: 'internal_error',       http: 500, desc: 'Внутренняя ошибка сервера — смотри логи Go' },
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
        description: 'Роль по умолчанию — employee. Поле office необязательно.',
        body: JSON.stringify({ email: 'ivan@simbirsoft.com', password: 'secret123', full_name: 'Иван Иванов', office: 'Казань' }, null, 2),
        responses: [
          { code: 201, desc: 'Пользователь создан', example: JSON.stringify({
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...',
            user: { id: 5, full_name: 'Иван Иванов', email: 'ivan@simbirsoft.com', role: 'employee', coin_balance: 0, office: 'Казань' }
          }, null, 2) },
          { code: 409, desc: 'Email уже занят', example: JSON.stringify({ error: 'email_taken' }, null, 2) },
          { code: 400, desc: 'Невалидные поля', example: JSON.stringify({ error: 'bad_request', details: 'password: min length 6' }, null, 2) },
        ]
      },
      {
        method: 'POST', path: '/auth/login', summary: 'Вход — получить пару JWT токенов', _open: false,
        body: JSON.stringify({ email: 'admin@simbirsoft.com', password: 'admin123' }, null, 2),
        responses: [
          { code: 200, desc: 'Токены выданы', example: JSON.stringify({
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...',
            user: { id: 1, full_name: 'Алексей Тимлид', email: 'admin@simbirsoft.com', role: 'admin', coin_balance: 0, office: 'Ульяновск' }
          }, null, 2) },
          { code: 401, desc: 'Неверный email или пароль', example: JSON.stringify({ error: 'unauthorized' }, null, 2) },
        ]
      },
      {
        method: 'POST', path: '/auth/refresh', summary: 'Обновить пару токенов', _open: false,
        description: 'Старый refresh_token становится недействительным (ротация).',
        body: JSON.stringify({ refresh_token: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' }, null, 2),
        responses: [
          { code: 200, desc: 'Новые токены', example: JSON.stringify({
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refresh_token: 'bmV3IHJlZnJlc2ggdG9rZW4...'
          }, null, 2) },
          { code: 401, desc: 'Токен просрочен или не найден в БД' },
        ]
      },
      {
        method: 'POST', path: '/auth/logout', summary: 'Выход из системы', _open: false,
        description: 'Требует: Authorization: Bearer <access_token>',
        responses: [
          { code: 200, desc: 'Успешно', example: JSON.stringify({ ok: true }, null, 2) },
        ]
      },
    ]
  },
  {
    name: 'Catalog', icon: '🛍️', auth: false, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/categories', summary: 'Список всех категорий', _open: false,
        description: 'При пустой таблице возвращает { "items": [] }, никогда не null.',
        responses: [
          { code: 200, desc: 'Список категорий', example: JSON.stringify({
            items: [{ id: 1, name: 'Одежда', code: 'clothes', icon: '👕', description: 'Футболки, худи, кепки' }]
          }, null, 2) },
        ]
      },
      {
        method: 'GET', path: '/products', summary: 'Список товаров с фильтрацией и пагинацией', _open: false,
        description: 'Неактивные товары (is_active = false) не попадают в выдачу.',
        params: [
          { name: 'category', in: 'query', type: 'string',  required: false, desc: 'Фильтр по code категории (например "clothes")' },
          { name: 'search',   in: 'query', type: 'string',  required: false, desc: 'Поиск по названию (без учёта регистра)' },
          { name: 'limit',    in: 'query', type: 'integer', required: false, desc: 'Размер страницы (макс. 100, по умолч. 20)' },
          { name: 'offset',   in: 'query', type: 'integer', required: false, desc: 'Сдвиг для пагинации' },
        ],
        responses: [
          { code: 200, desc: 'Список товаров', example: JSON.stringify({
            items: [{
              id: 7, name: 'Футболка SimbirSoft', description: '100% хлопок',
              category_id: 1, category_name: 'Одежда', category_code: 'clothes',
              price_coins: 300, has_variants: true, image_url: 'https://example.com/tshirt.jpg',
              variants: [{ id: 1, size: 'S', color: 'белый', sku: 'TSHIRT-S-WHT', price_coins: null, in_stock: true }]
            }]
          }, null, 2) },
        ]
      },
      {
        method: 'GET', path: '/products/{id}', summary: 'Один товар по ID', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        responses: [
          { code: 200, desc: 'Товар с вариантами', example: JSON.stringify({
            id: 7, name: 'Футболка SimbirSoft', price_coins: 300, has_variants: true,
            variants: [{ id: 1, size: 'S', color: 'белый', sku: 'TSHIRT-S-WHT', price_coins: null, in_stock: true }]
          }, null, 2) },
          { code: 404, desc: 'Товар не найден или неактивен' },
        ]
      },
    ]
  },
  {
    name: 'Profile', icon: '👤', auth: true, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/me', summary: 'Данные текущего пользователя', _open: false,
        responses: [
          { code: 200, desc: 'Профиль', example: JSON.stringify({ id: 5, full_name: 'Иван Иванов', email: 'ivan@simbirsoft.com', role: 'employee', coin_balance: 1500, office: 'Казань' }, null, 2) },
          { code: 401, desc: 'Требуется авторизация' },
        ]
      },
      {
        method: 'GET', path: '/me/coins', summary: 'История монетных транзакций', _open: false,
        description: 'type: "manual" — начисление от администратора (amount > 0). type: "order" — списание при заказе (amount < 0).',
        responses: [
          { code: 200, desc: 'История транзакций', example: JSON.stringify({
            items: [
              { id: 1, type: 'manual', amount: 500, balance: 500, comment: 'Начальный бонус', admin_name: 'Алексей Тимлид', order_id: null, created_at: '2024-01-15T10:30:00Z' },
              { id: 2, type: 'order', amount: -300, balance: 200, comment: null, admin_name: null, order_id: 42, created_at: '2024-01-16T14:00:00Z' }
            ]
          }, null, 2) },
          { code: 401, desc: 'Требуется авторизация' },
        ]
      },
      {
        method: 'GET', path: '/me/stats', summary: 'Агрегированная статистика профиля', _open: false,
        description: 'Все поля — числа, никогда не null. При отсутствии данных — 0.',
        responses: [
          { code: 200, desc: 'Статистика', example: JSON.stringify({ orders_count: 5, coins_spent: 2500, coins_earned: 3000 }, null, 2) },
          { code: 401, desc: 'Требуется авторизация' },
        ]
      },
    ]
  },
  {
    name: 'Cart', icon: '🛒', auth: true, adminOnly: false,
    endpoints: [
      {
        method: 'GET', path: '/cart', summary: 'Текущая корзина пользователя', _open: false,
        description: 'Корзина создаётся автоматически при первом обращении. Пустая корзина: { "items": [], "total_coins": 0 }',
        responses: [
          { code: 200, desc: 'Корзина', example: JSON.stringify({
            items: [{ id: 1, product_id: 7, product_name: 'Футболка SimbirSoft', variant_id: 2, variant_label: 'M / белый', price_coins: 300, quantity: 2 }],
            total_coins: 600
          }, null, 2) }
        ]
      },
      {
        method: 'POST', path: '/cart/items', summary: 'Добавить товар в корзину', _open: false,
        description: 'Если товар с таким product_id + variant_id уже есть — quantity увеличивается. Если has_variants = true и variant_id не передан — 400.',
        body: JSON.stringify({ product_id: 7, variant_id: 2, quantity: 1 }, null, 2),
        responses: [
          { code: 200, desc: 'Обновлённая корзина (структура как GET /cart)' },
          { code: 400, desc: 'Не передан variant_id для товара с вариантами' },
          { code: 404, desc: 'Товар не найден' },
        ]
      },
      {
        method: 'PATCH', path: '/cart/items/{itemId}', summary: 'Изменить количество позиции', _open: false,
        params: [{ name: 'itemId', in: 'path', type: 'integer', required: true, desc: 'ID позиции корзины (cart item id, не product_id)' }],
        body: JSON.stringify({ quantity: 3 }, null, 2),
        responses: [
          { code: 200, desc: 'Обновлённая корзина' },
          { code: 404, desc: 'Позиция не найдена или принадлежит другому пользователю' },
        ]
      },
      {
        method: 'DELETE', path: '/cart/items/{itemId}', summary: 'Удалить позицию из корзины', _open: false,
        params: [{ name: 'itemId', in: 'path', type: 'integer', required: true, desc: 'ID позиции корзины' }],
        responses: [{ code: 200, desc: 'Обновлённая корзина' }]
      },
    ]
  },
  {
    name: 'Orders', icon: '📦', auth: true, adminOnly: false,
    endpoints: [
      {
        method: 'POST', path: '/orders/checkout', summary: 'Оформить заказ из корзины', _open: false,
        description: 'После успешного оформления: корзина очищается, баланс списывается, запись в coin_transactions создаётся.',
        body: JSON.stringify({}, null, 2),
        responses: [
          { code: 201, desc: 'Заказ создан', example: JSON.stringify({
            id: 42, status: 'new', total_coins: 600, created_at: '2024-01-16T14:00:00Z',
            items: [{ product_id: 7, product_name: 'Футболка SimbirSoft', quantity: 2, price_coins: 300 }]
          }, null, 2) },
          { code: 400, desc: 'Корзина пуста', example: JSON.stringify({ error: 'bad_request' }, null, 2) },
          { code: 402, desc: 'Недостаточно монет', example: JSON.stringify({ error: 'insufficient_balance' }, null, 2) },
        ]
      },
      {
        method: 'GET', path: '/orders', summary: 'История заказов текущего пользователя', _open: false,
        responses: [
          { code: 200, desc: 'Список заказов', example: JSON.stringify({
            items: [{ id: 42, status: 'completed', total_coins: 600, created_at: '2024-01-16T14:00:00Z' }]
          }, null, 2) }
        ]
      },
      {
        method: 'GET', path: '/orders/{id}', summary: 'Заказ с позициями', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID заказа' }],
        responses: [
          { code: 200, desc: 'Полный заказ', example: JSON.stringify({
            id: 42, status: 'completed', total_coins: 600, created_at: '2024-01-16T14:00:00Z',
            items: [{ product_id: 7, product_name: 'Футболка SimbirSoft', quantity: 2, price_coins: 300 }]
          }, null, 2) },
          { code: 404, desc: 'Заказ не найден или принадлежит другому пользователю' },
        ]
      },
    ]
  },
  {
    name: 'Admin · Orders', icon: '📋', auth: true, adminOnly: true,
    endpoints: [
      {
        method: 'GET', path: '/admin/orders', summary: 'Все заказы всех пользователей', _open: false,
        params: [
          { name: 'status', in: 'query', type: 'string', required: false, desc: 'Фильтр: new | pending | confirmed | ready | done | completed | cancelled' },
        ],
        responses: [
          { code: 200, desc: 'Список заказов', example: JSON.stringify({
            items: [{ id: 42, status: 'new', total_coins: 600, created_at: '2024-01-16T14:00:00Z', user_id: 5, user_name: 'Иван Иванов' }]
          }, null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
        ]
      },
      {
        method: 'GET', path: '/admin/orders/{id}/items', summary: 'Состав заказа', _open: false,
        description: 'color и size — всегда строка. Если варианта нет — пустая строка "", не null.',
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID заказа' }],
        responses: [
          { code: 200, desc: 'Состав заказа', example: JSON.stringify({
            order_id: 42, total_coins: 600,
            items: [{ item_id: 1, product_id: 7, product_name: 'Футболка SimbirSoft', image_url: 'https://example.com/tshirt.jpg', color: 'белый', size: 'M', quantity: 2, price_coins: 300 }]
          }, null, 2) },
          { code: 404, desc: 'Заказ не найден' },
        ]
      },
      {
        method: 'PATCH', path: '/admin/orders/{id}/status', summary: 'Изменить статус заказа', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID заказа' }],
        body: JSON.stringify({ status: 'confirmed' }, null, 2),
        responses: [
          { code: 200, desc: 'Статус обновлён', example: JSON.stringify({ order_id: 42, new_status: 'confirmed' }, null, 2) },
          { code: 400, desc: 'Недопустимое значение статуса' },
          { code: 404, desc: 'Заказ не найден' },
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
        body: JSON.stringify({ name: 'Худи SimbirSoft', category_id: 1, price_coins: 800, description: 'Тёплое худи', has_variants: false, is_active: true, image_url: null }, null, 2),
        responses: [
          { code: 201, desc: 'Товар создан', example: JSON.stringify({ id: 10 }, null, 2) },
          { code: 403, desc: 'Нет прав' },
        ]
      },
      {
        method: 'PUT', path: '/admin/products/{id}', summary: 'Обновить товар', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        body: JSON.stringify({ name: 'Худи SimbirSoft v2', category_id: 1, price_coins: 900, description: 'Обновлённое', has_variants: false, is_active: true, image_url: null }, null, 2),
        responses: [
          { code: 200, desc: 'Обновлено', example: JSON.stringify({ id: 10 }, null, 2) },
          { code: 404, desc: 'Товар не найден' },
        ]
      },
      {
        method: 'DELETE', path: '/admin/products/{id}', summary: 'Удалить товар (soft-delete)', _open: false,
        description: 'Товар не удаляется из БД — устанавливается флаг is_active = false. Он исчезает из каталога.',
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        responses: [
          { code: 200, desc: 'Деактивировано', example: JSON.stringify({ deleted: 10 }, null, 2) },
          { code: 404, desc: 'Товар не найден' },
        ]
      },
      {
        method: 'POST', path: '/admin/products/{id}/variants', summary: 'Добавить вариант к товару', _open: false,
        description: 'Добавление первого варианта автоматически ставит has_variants = true на товаре.',
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID товара' }],
        body: JSON.stringify({ size: 'XL', color: 'чёрный', sku: 'HOOD-XL-BLK', price_coins: null, in_stock: true }, null, 2),
        responses: [
          { code: 201, desc: 'Вариант создан', example: JSON.stringify({ id: 5 }, null, 2) },
        ]
      },
      {
        method: 'PUT', path: '/admin/products/{id}/variants/{variantId}', summary: 'Обновить вариант', _open: false,
        params: [
          { name: 'id',        in: 'path', type: 'integer', required: true, desc: 'ID товара' },
          { name: 'variantId', in: 'path', type: 'integer', required: true, desc: 'ID варианта' },
        ],
        responses: [{ code: 200, desc: 'Обновлено', example: JSON.stringify({ ok: true }, null, 2) }]
      },
      {
        method: 'DELETE', path: '/admin/products/{id}/variants/{variantId}', summary: 'Удалить вариант', _open: false,
        description: 'Удаление последнего варианта автоматически сбрасывает has_variants = false.',
        params: [
          { name: 'id',        in: 'path', type: 'integer', required: true, desc: 'ID товара' },
          { name: 'variantId', in: 'path', type: 'integer', required: true, desc: 'ID варианта' },
        ],
        responses: [{ code: 200, desc: 'Удалено', example: JSON.stringify({ ok: true }, null, 2) }]
      },
    ]
  },
  {
    name: 'Admin · Categories', icon: '🏷️', auth: true, adminOnly: true,
    endpoints: [
      {
        method: 'POST', path: '/admin/categories', summary: 'Создать категорию', _open: false,
        description: 'code — только [a-z0-9-], уникальный.',
        body: JSON.stringify({ code: 'books', name: 'Книги', icon: '📚', description: 'Корпоративная литература' }, null, 2),
        responses: [
          { code: 201, desc: 'Категория создана', example: JSON.stringify({ id: 3, code: 'books', name: 'Книги', icon: '📚', description: 'Корпоративная литература' }, null, 2) },
          { code: 409, desc: 'code уже занят', example: JSON.stringify({ error: 'conflict' }, null, 2) },
        ]
      },
      {
        method: 'PUT', path: '/admin/categories/{id}', summary: 'Обновить категорию', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID категории' }],
        body: JSON.stringify({ code: 'books', name: 'Книги и журналы', icon: '📖', description: 'Обновлено' }, null, 2),
        responses: [{ code: 200, desc: 'Обновлено', example: JSON.stringify({ ok: true }, null, 2) }]
      },
      {
        method: 'DELETE', path: '/admin/categories/{id}', summary: 'Удалить категорию', _open: false,
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID категории' }],
        responses: [
          { code: 200, desc: 'Удалено', example: JSON.stringify({ ok: true }, null, 2) },
          { code: 409, desc: 'К категории привязаны товары', example: JSON.stringify({ error: 'conflict' }, null, 2) },
        ]
      },
    ]
  },
  {
    name: 'Admin · Users', icon: '👥', auth: true, adminOnly: true,
    endpoints: [
      {
        method: 'GET', path: '/admin/users', summary: 'Список всех пользователей с балансами', _open: false,
        responses: [
          { code: 200, desc: 'Список пользователей', example: JSON.stringify({
            items: [{ id: 5, full_name: 'Иван Иванов', email: 'ivan@simbirsoft.com', role: 'employee', coin_balance: 1500, office: 'Казань' }]
          }, null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
        ]
      },
      {
        method: 'POST', path: '/admin/users/coins', summary: 'Начислить или списать монеты', _open: false,
        description: 'amount может быть отрицательным (списание). Баланс не может уйти в минус.',
        body: JSON.stringify({ user_id: 5, amount: 500, reason: 'Премия за квартал' }, null, 2),
        responses: [
          { code: 200, desc: 'Операция выполнена', example: JSON.stringify({ user_id: 5, amount: 500, new_balance: 2000, reason: 'Премия за квартал' }, null, 2) },
          { code: 400, desc: 'Баланс уйдёт в минус', example: JSON.stringify({ error: 'bad_request' }, null, 2) },
          { code: 402, desc: 'Недостаточно монет', example: JSON.stringify({ error: 'insufficient_balance' }, null, 2) },
          { code: 403, desc: 'Нет прав доступа' },
          { code: 404, desc: 'Пользователь не найден' },
        ]
      },
      {
        method: 'GET', path: '/admin/users/{id}/transactions', summary: 'История монет пользователя', _open: false,
        description: 'Та же структура что и GET /me/coins.',
        params: [{ name: 'id', in: 'path', type: 'integer', required: true, desc: 'ID пользователя' }],
        responses: [
          { code: 200, desc: 'История транзакций', example: JSON.stringify({
            items: [
              { id: 31, type: 'manual', amount: 1000, balance: 2500, comment: 'Победитель хакатона', admin_name: 'Алексей Тимлид', order_id: null, created_at: '2025-06-01T12:00:00Z' },
              { id: 28, type: 'order',  amount: -300, balance: 1500, comment: null, admin_name: null, order_id: 42, created_at: '2025-05-15T09:30:00Z' },
            ]
          }, null, 2) },
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
.docs-roles { display: flex; flex-direction: column; gap: 8px; }
.docs-role-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #4A607A; }
.docs-role-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; }
.docs-role-badge.employee { background: #D4F4E2; color: #1A6B3A; }
.docs-role-badge.admin { background: #FFF3DB; color: #7A5000; }

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
