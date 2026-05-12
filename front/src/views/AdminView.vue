<template>
  <app-layout>
    <div class="admin">

      <!-- ── Шапка ── -->
      <div class="admin__header">
        <div class="admin__header-left">
          <span class="admin__badge">⚙️ Админ</span>
          <h1 class="admin__title">Панель управления</h1>
        </div>
        <button class="admin__back" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          На сайт
        </button>
      </div>

      <!-- ── Табы ── -->
      <div class="admin__tabs">
        <button
          v-for="tab in TABS" :key="tab.id"
          class="admin__tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
          <span v-if="tab.id === 'orders' && pendingCount" class="admin__tab-badge">{{ pendingCount }}</span>
        </button>
      </div>

      <!-- ═══════════════ ЗАКАЗЫ ═══════════════ -->
      <section v-show="activeTab === 'orders'" class="admin__section">
        <div class="admin__filters">
          <button
            v-for="f in STATUS_FILTERS" :key="f.value ?? 'all'"
            class="admin__filter-btn"
            :class="{ active: orderFilter === f.value }"
            @click="orderFilter = f.value; orderPage = 1"
          >
            {{ f.icon }} {{ f.label }}
            <span v-if="f.value" class="admin__filter-count">{{ orderCountByStatus(f.value) }}</span>
          </button>
        </div>

        <div class="admin__table-wrap">
          <div v-if="loadingOrders" class="admin__loading">
            <div v-for="i in 5" :key="i" class="admin__row-skeleton">
              <div class="skeleton s-id"></div><div class="skeleton s-user"></div>
              <div class="skeleton s-date"></div><div class="skeleton s-sum"></div>
              <div class="skeleton s-status"></div><div class="skeleton s-action"></div>
            </div>
          </div>
          <table v-else class="admin__table">
            <thead><tr>
              <th>№</th><th>Сотрудник</th><th>Дата</th><th>Сумма</th><th>Статус</th><th>Действие</th>
            </tr></thead>
            <tbody>
              <tr v-if="pagedOrders.length === 0">
                <td colspan="6" class="admin__table-empty">Заказов нет</td>
              </tr>
              <tr v-for="o in pagedOrders" :key="o.id" class="admin__table-row">
                <td class="admin__cell-id">#{{ o.id }}</td>
                <td><div class="admin__user-name">{{ o.user_name }}</div></td>
                <td class="admin__cell-muted">{{ fmtDate(o.created_at) }}</td>
                <td class="admin__cell-bold">🪙 {{ o.total_coins?.toLocaleString('ru') }}</td>
                <td>
                  <span class="admin__status" :class="statusCls(o.status)">
                    {{ statusIcon(o.status) }} {{ statusLabel(o.status) }}
                  </span>
                </td>
                <td>
                  <div class="admin__actions-row">
                    <button
                      class="admin__btn admin__btn--sm admin__btn--ghost"
                      @click="openOrderItemsModal(o)"
                    >📋 Состав</button>
                    <button
                      v-for="s in nextStatuses(o.status)" :key="s.value"
                      class="admin__btn admin__btn--sm" :class="s.cls"
                      :disabled="updating === o.id"
                      @click="changeStatus(o, s.value)"
                    >{{ s.icon }} {{ s.label }}</button>
                    <span v-if="nextStatuses(o.status).length === 0" class="admin__cell-muted" style="font-size:12px">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AdminPagination
          :current="orderPage"
          :total="filteredOrders.length"
          :per-page="PAGE_SIZE"
          @change="orderPage = $event"
        />
      </section>

      <!-- ═══════════════ ТОВАРЫ ═══════════════ -->
      <section v-show="activeTab === 'products'" class="admin__section">
        <div class="admin__toolbar">
          <input v-model="productSearch" class="admin__search" placeholder="🔍 Поиск товара..." @input="productPage = 1" />
          <button class="admin__btn admin__btn--primary" @click="openProductModal()">+ Добавить товар</button>
        </div>
        <div class="admin__table-wrap">
          <div v-if="loadingProducts" class="admin__loading">
            <div v-for="i in 6" :key="i" class="admin__row-skeleton">
              <div class="skeleton s-id"></div><div class="skeleton s-user"></div>
              <div class="skeleton s-date"></div><div class="skeleton s-sum"></div>
              <div class="skeleton s-action"></div>
            </div>
          </div>
          <table v-else class="admin__table">
            <thead><tr>
              <th>ID</th><th>Фото</th><th>Название</th><th>Категория</th><th>Цена</th><th>Варианты</th><th>Статус</th><th>Действия</th>
            </tr></thead>
            <tbody>
              <tr v-if="pagedProducts.length === 0">
                <td colspan="8" class="admin__table-empty">Товаров нет</td>
              </tr>
              <tr v-for="p in pagedProducts" :key="p.id" class="admin__table-row">
                <td class="admin__cell-id">{{ p.id }}</td>
                <td>
                  <div class="admin__product-thumb">
                    <img v-if="p.image_url" :src="p.image_url" alt="" class="admin__thumb-img" />
                    <span v-else class="admin__thumb-placeholder">🖼️</span>
                  </div>
                </td>
                <td><div class="admin__product-name">{{ p.name }}</div></td>
                <td><span class="admin__cat-badge">{{ p.category_name }}</span></td>
                <td class="admin__cell-bold">🪙 {{ p.price_coins?.toLocaleString('ru') }}</td>
                <td class="admin__cell-muted">{{ p.has_variants ? 'Есть' : 'Нет' }}</td>
                <td>
                  <span class="admin__active-badge" :class="p.is_active ? 'active-on' : 'active-off'">
                    {{ p.is_active ? '🟢 Активен' : '⚫ Скрыт' }}
                  </span>
                </td>
                <td>
                  <div class="admin__actions-row">
                    <button class="admin__btn admin__btn--sm admin__btn--ghost" @click="openProductModal(p)">Редактировать</button>
                    <button class="admin__btn admin__btn--sm admin__btn--danger" @click="deleteProduct(p)">Удалить</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AdminPagination
          :current="productPage"
          :total="filteredProducts.length"
          :per-page="PAGE_SIZE"
          @change="productPage = $event"
        />
      </section>

      <!-- ═══════════════ КАТЕГОРИИ ═══════════════ -->
      <section v-show="activeTab === 'categories'" class="admin__section">
        <div class="admin__toolbar">
          <div style="flex:1"></div>
          <button class="admin__btn admin__btn--primary" @click="openCatModal()">+ Добавить категорию</button>
        </div>
        <div class="admin__cat-grid">
          <div v-if="loadingCategories" v-for="i in 4" :key="i" class="admin__cat-card skeleton-card">
            <div class="skeleton s-cat-name"></div><div class="skeleton s-cat-code"></div>
          </div>
          <template v-else>
            <div v-if="pagedCategories.length === 0" class="admin__table-empty" style="padding:40px">Категорий нет</div>
            <div v-for="cat in pagedCategories" :key="cat.id" class="admin__cat-card">
              <div class="admin__cat-icon-row">
                <span v-if="cat.icon" class="admin__cat-icon">{{ cat.icon }}</span>
                <div class="admin__cat-name">{{ cat.name }}</div>
              </div>
              <div class="admin__cat-code">{{ cat.code }}</div>
              <div v-if="cat.description" class="admin__cat-desc">{{ cat.description }}</div>
              <div class="admin__cat-footer">
                <span class="admin__cat-count">{{ productCountByCategory(cat.code) }} тов.</span>
                <div class="admin__actions-row">
                  <button class="admin__btn admin__btn--sm admin__btn--ghost" @click="openCatModal(cat)">Редакт.</button>
                  <button class="admin__btn admin__btn--sm admin__btn--danger" @click="deleteCat(cat)">Удал.</button>
                </div>
              </div>
            </div>
          </template>
        </div>
        <AdminPagination
          :current="catPage"
          :total="categories.length"
          :per-page="PAGE_SIZE"
          @change="catPage = $event"
        />
      </section>

      <!-- ═══════════════ ПОЛЬЗОВАТЕЛИ ═══════════════ -->
      <section v-show="activeTab === 'users'" class="admin__section">
        <div class="admin__toolbar">
          <input v-model="userSearch" class="admin__search" placeholder="🔍 Поиск по имени или email..." @input="userPage = 1" />
        </div>

        <div class="admin__table-wrap">
          <div v-if="loadingUsers" class="admin__loading">
            <div v-for="i in 6" :key="i" class="admin__row-skeleton users-skeleton">
              <div class="skeleton s-id"></div><div class="skeleton s-user"></div>
              <div class="skeleton s-date"></div><div class="skeleton s-sum"></div>
              <div class="skeleton s-action"></div>
            </div>
          </div>
          <table v-else class="admin__table">
            <thead><tr>
              <th>ID</th><th>Имя</th><th>Email</th><th>Роль</th><th>Баланс</th><th>Действия</th>
            </tr></thead>
            <tbody>
              <tr v-if="pagedUsers.length === 0">
                <td colspan="6" class="admin__table-empty">Пользователей нет</td>
              </tr>
              <tr v-for="u in pagedUsers" :key="u.id" class="admin__table-row">
                <td class="admin__cell-id">{{ u.id }}</td>
                <td><div class="admin__user-name">{{ u.full_name }}</div></td>
                <td class="admin__cell-muted">{{ u.email }}</td>
                <td>
                  <span class="admin__role-badge" :class="u.role === 'admin' ? 'role-admin' : 'role-user'">
                    {{ u.role === 'admin' ? '⚙️ Админ' : '👤 Сотрудник' }}
                  </span>
                </td>
                <td class="admin__cell-bold">🪙 {{ (u.coin_balance ?? 0).toLocaleString('ru') }}</td>
                <td>
                  <div class="admin__actions-row">
                    <button class="admin__btn admin__btn--sm admin__btn--coin" @click="openAwardModal(u)">
                      🪙 Начислить
                    </button>
                    <button class="admin__btn admin__btn--sm admin__btn--ghost" @click="openTxModal(u)">
                      📋 История
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AdminPagination
          :current="userPage"
          :total="filteredUsers.length"
          :per-page="PAGE_SIZE"
          @change="userPage = $event"
        />
      </section>

    </div>

    <!-- ═══════════════ МОДАЛЫ ═══════════════ -->
    <teleport to="body">

      <!-- МОДАЛ: СОСТАВ ЗАКАЗА -->
      <div v-if="orderItemsModal.show" class="admin__overlay" @click.self="orderItemsModal.show = false">
        <div class="admin__modal admin__modal--wide">
          <div class="admin__modal-header">
            <span>📋 Состав заказа #{{ orderItemsModal.orderId }} — {{ orderItemsModal.userName }}</span>
            <button class="admin__modal-close" @click="orderItemsModal.show = false">×</button>
          </div>
          <div class="admin__modal-body admin__modal-body--scroll">
            <div v-if="loadingOrderItems" class="admin__tx-loading">
              <div v-for="i in 4" :key="i" class="skeleton" style="height:60px;border-radius:8px"></div>
            </div>
            <div v-else-if="orderItems.length === 0" class="admin__table-empty">Позиции не найдены</div>
            <div v-else class="admin__order-items-list">
              <div v-for="item in orderItems" :key="item.id ?? item.product_id" class="admin__order-item">
                <div class="admin__order-item-thumb">
                  <img v-if="item.image_url" :src="item.image_url" alt="" class="admin__thumb-img" @error="item.image_url = ''" />
                  <span v-else class="admin__thumb-placeholder">🖼️</span>
                </div>
                <div class="admin__order-item-info">
                  <div class="admin__order-item-name">{{ item.product_name ?? item.name }}</div>
                  <div class="admin__order-item-meta">
                    <span v-if="item.color || item.size" class="admin__order-item-variant">
                      {{ [item.color, item.size].filter(Boolean).join(' / ') }}
                    </span>
                    <span class="admin__cell-muted">× {{ item.quantity }}</span>
                  </div>
                </div>
                <div class="admin__order-item-price">
                  🪙 {{ ((item.price_coins ?? item.price ?? 0) * item.quantity).toLocaleString('ru') }}
                </div>
              </div>
            </div>
          </div>
          <div class="admin__modal-footer admin__modal-footer--between">
            <span v-if="orderItems.length > 0" class="admin__order-total">
              Итого: 🪙 {{ orderItemsModal.totalCoins?.toLocaleString('ru') }}
            </span>
            <button class="admin__btn admin__btn--ghost" @click="orderItemsModal.show = false">Закрыть</button>
          </div>
        </div>
      </div>

      <!-- МОДАЛ: ТОВАР -->
      <div v-if="productModal.show" class="admin__overlay" @click.self="productModal.show = false">
        <div class="admin__modal admin__modal--wide">
          <div class="admin__modal-header">
            <span>{{ productModal.id ? 'Редактировать товар' : 'Новый товар' }}</span>
            <button class="admin__modal-close" @click="productModal.show = false">×</button>
          </div>
          <div class="admin__modal-body">

            <!-- Превью изображения -->
            <div v-if="productModal.image_url" class="admin__img-preview">
              <img :src="productModal.image_url" alt="Превью" class="admin__preview-img" @error="productModal.image_url = ''" />
            </div>

            <!-- Две колонки -->
            <div class="admin__modal-grid">
              <!-- Левая -->
              <div class="admin__modal-col">
                <label class="admin__label">Название <span class="admin__req">*</span>
                  <input v-model="productModal.name" class="admin__input" placeholder="Название товара" />
                </label>

                <label class="admin__label">Категория <span class="admin__req">*</span>
                  <select v-model="productModal.category_id" class="admin__input admin__select">
                    <option disabled value="">-- выбрать --</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </label>

                <label class="admin__label">Цена (монет) <span class="admin__req">*</span>
                  <input v-model.number="productModal.price_coins" type="number" min="1" class="admin__input" placeholder="100" />
                </label>

                <label class="admin__label">URL изображения
                  <input v-model="productModal.image_url" class="admin__input" placeholder="https://..." />
                  <span class="admin__hint">Прямая ссылка на картинку товара</span>
                </label>
              </div>

              <!-- Правая -->
              <div class="admin__modal-col">
                <label class="admin__label">Описание
                  <textarea v-model="productModal.description" class="admin__input admin__textarea" placeholder="Описание товара..."></textarea>
                </label>

                <div class="admin__checkboxes">
                  <label class="admin__label admin__label--row">
                    <input type="checkbox" v-model="productModal.has_variants" />
                    Есть варианты (цвет/размер)
                  </label>
                  <label class="admin__label admin__label--row">
                    <input type="checkbox" v-model="productModal.is_active" />
                    Активен (виден в каталоге)
                  </label>
                </div>
              </div>
            </div>

            <!-- Варианты товара -->
            <div v-if="productModal.has_variants" class="admin__variants-section">
              <div class="admin__variants-header">
                <span class="admin__variants-title">🎨 Варианты товара</span>
                <button type="button" class="admin__btn admin__btn--sm admin__btn--ghost" @click="addVariant">+ Добавить вариант</button>
              </div>
              <div v-if="productModal.variants.length === 0" class="admin__variants-empty">
                Нет вариантов. Нажмите «+ Добавить вариант»
              </div>
              <div v-for="(v, idx) in productModal.variants" :key="idx" class="admin__variant-row">
                <input v-model="v.color" class="admin__input admin__variant-input" placeholder="Цвет (напр. Красный)" />
                <input v-model="v.size" class="admin__input admin__variant-input" placeholder="Размер (напр. M)" />
                <input v-model.number="v.stock_qty" type="number" min="0" class="admin__input admin__variant-input admin__variant-stock" placeholder="Кол-во" />
                <button type="button" class="admin__btn admin__btn--sm admin__btn--danger admin__variant-del" @click="removeVariant(idx)">✕</button>
              </div>
            </div>

          </div>
          <div class="admin__modal-footer">
            <button class="admin__btn admin__btn--ghost" @click="productModal.show = false">Отмена</button>
            <button class="admin__btn admin__btn--primary" :disabled="savingProduct" @click="saveProduct">
              {{ savingProduct ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- МОДАЛ: КАТЕГОРИЯ -->
      <div v-if="catModal.show" class="admin__overlay" @click.self="catModal.show = false">
        <div class="admin__modal">
          <div class="admin__modal-header">
            <span>{{ catModal.id ? 'Редактировать категорию' : 'Новая категория' }}</span>
            <button class="admin__modal-close" @click="catModal.show = false">×</button>
          </div>
          <div class="admin__modal-body">
            <!-- Скелетон пока грузятся данные категории -->
            <div v-if="catModal.loading" class="admin__tx-loading">
              <div v-for="i in 3" :key="i" class="skeleton" style="height:44px;border-radius:8px"></div>
            </div>
            <template v-else>
              <label class="admin__label">Название <span class="admin__req">*</span>
                <input v-model="catModal.name" class="admin__input" placeholder="Например: Одежда" />
              </label>
              <label class="admin__label">Код (slug) <span class="admin__req">*</span>
                <input v-model="catModal.code" class="admin__input" placeholder="Например: clothes" />
                <span class="admin__hint">Латинские буквы, цифры, дефисы. Используется в фильтрах каталога.</span>
              </label>
              <label class="admin__label">Иконка (emoji)
                <div class="admin__icon-input-row">
                  <span class="admin__icon-preview">{{ catModal.icon || '🏷️' }}</span>
                  <input v-model="catModal.icon" class="admin__input" placeholder="Например: 👗 или 🛋️" />
                </div>
                <span class="admin__hint">Вставьте emoji — будет отображаться рядом с названием категории.</span>
              </label>
              <label class="admin__label">Описание
                <textarea v-model="catModal.description" class="admin__input admin__textarea" placeholder="Краткое описание категории..."></textarea>
              </label>
            </template>
          </div>
          <div class="admin__modal-footer">
            <button class="admin__btn admin__btn--ghost" @click="catModal.show = false">Отмена</button>
            <button class="admin__btn admin__btn--primary" :disabled="savingCat || catModal.loading" @click="saveCat">
              {{ savingCat ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>

      <!-- МОДАЛ: НАЧИСЛИТЬ МОНЕТЫ -->
      <div v-if="awardModal.show" class="admin__overlay" @click.self="awardModal.show = false">
        <div class="admin__modal">
          <div class="admin__modal-header">
            <span>🪙 Начисление монет — {{ awardModal.userName }}</span>
            <button class="admin__modal-close" @click="awardModal.show = false">×</button>
          </div>
          <div class="admin__modal-body">
            <div class="admin__balance-info">
              Текущий баланс: <strong>🪙 {{ (awardModal.currentBalance ?? 0).toLocaleString('ru') }}</strong>
            </div>
            <label class="admin__label">Количество монет
              <div class="admin__amount-row">
                <button
                  class="admin__sign-btn" :class="{ active: awardModal.sign === 1 }"
                  @click="awardModal.sign = 1"
                >+ Начислить</button>
                <button
                  class="admin__sign-btn admin__sign-btn--minus" :class="{ active: awardModal.sign === -1 }"
                  @click="awardModal.sign = -1"
                >− Списать</button>
              </div>
              <input
                v-model.number="awardModal.amount"
                type="number" min="1"
                class="admin__input"
                placeholder="Например: 500"
              />
            </label>
            <label class="admin__label">Основание (обязательно)
              <textarea
                v-model="awardModal.reason"
                class="admin__input admin__textarea"
                placeholder="Например: Победитель хакатона Q2, участие в корпоративе..."
              ></textarea>
            </label>
          </div>
          <div class="admin__modal-footer">
            <button class="admin__btn admin__btn--ghost" @click="awardModal.show = false">Отмена</button>
            <button
              class="admin__btn admin__btn--primary"
              :disabled="savingAward || !awardModal.amount || !awardModal.reason?.trim()"
              @click="submitAward"
            >
              {{ savingAward ? 'Сохранение...' : (awardModal.sign === 1 ? '🪙 Начислить' : '🪙 Списать') }}
            </button>
          </div>
        </div>
      </div>

      <!-- МОДАЛ: ИСТОРИЯ ТРАНЗАКЦИЙ -->
      <div v-if="txModal.show" class="admin__overlay" @click.self="txModal.show = false">
        <div class="admin__modal admin__modal--wide">
          <div class="admin__modal-header">
            <span>📋 История монет — {{ txModal.userName }}</span>
            <button class="admin__modal-close" @click="txModal.show = false">×</button>
          </div>
          <div class="admin__modal-body admin__modal-body--scroll">
            <div v-if="loadingTx" class="admin__tx-loading">
              <div v-for="i in 5" :key="i" class="skeleton" style="height:44px;border-radius:8px"></div>
            </div>
            <div v-else-if="txList.length === 0" class="admin__table-empty">История пуста</div>
            <div v-else class="admin__tx-list">
              <div v-for="tx in txList" :key="tx.id" class="admin__tx-row">
                <div class="admin__tx-left">
                  <span class="admin__tx-amount" :class="tx.amount > 0 ? 'tx-plus' : 'tx-minus'">
                    {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toLocaleString('ru') }} 🪙
                  </span>
                  <span class="admin__tx-reason">{{ tx.comment }}</span>
                </div>
                <div class="admin__tx-right">
                  <span class="admin__tx-balance">баланс: {{ tx.balance.toLocaleString('ru') }}</span>
                  <span v-if="tx.admin_name" class="admin__tx-admin">👤 {{ tx.admin_name }}</span>
                  <span class="admin__tx-date">{{ fmtDate(tx.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="admin__modal-footer">
            <button class="admin__btn admin__btn--ghost" @click="txModal.show = false">Закрыть</button>
          </div>
        </div>
      </div>

    </teleport>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import AppLayout from '@/components/AppLayout.vue'
import AdminPagination from '@/components/AdminPagination.vue'
import api from '@/api'

const router = useRouter()
const message = useMessage()

const activeTab = ref('orders')
const TABS = [
  { id: 'orders',     label: 'Заказы',         icon: '📦' },
  { id: 'products',   label: 'Товары',         icon: '🛋️' },
  { id: 'categories', label: 'Категории',      icon: '🏷️' },
  { id: 'users',      label: 'Пользователи',   icon: '👥' },
]

// ─────────────── ПАГИНАЦИЯ ───────────────
const PAGE_SIZE = 10

const orderPage   = ref(1)
const productPage = ref(1)
const catPage     = ref(1)
const userPage    = ref(1)

function paginate(list, page) {
  const start = (page - 1) * PAGE_SIZE
  return list.slice(start, start + PAGE_SIZE)
}

// ─────────────── ЗАКАЗЫ ───────────────
const orders = ref([])
const loadingOrders = ref(false)
const updating = ref(null)
const orderFilter = ref(null)

const STATUS = {
  new:       { label: 'Новый',        icon: '🆕', cls: 'st-new' },
  pending:   { label: 'Ожидает',      icon: '⏳', cls: 'st-pending' },
  confirmed: { label: 'Подтверждён', icon: '✅', cls: 'st-confirmed' },
  ready:     { label: 'Готов',        icon: '🎁', cls: 'st-ready' },
  done:      { label: 'Выдан',        icon: '✔️', cls: 'st-done' },
  cancelled: { label: 'Отменён',      icon: '❌', cls: 'st-cancelled' },
  completed: { label: 'Завершён',    icon: '✔️', cls: 'st-done' },
}
const TRANSITIONS = {
  new:       [{ value:'pending',   label:'В обработку',  icon:'⏳', cls:'admin__btn--pending' },
              { value:'cancelled', label:'Отменить',     icon:'❌', cls:'admin__btn--cancel' }],
  pending:   [{ value:'confirmed', label:'Подтвердить', icon:'✅', cls:'admin__btn--confirm' },
              { value:'cancelled', label:'Отменить',    icon:'❌', cls:'admin__btn--cancel' }],
  confirmed: [{ value:'ready',     label:'Готов',        icon:'🎁', cls:'admin__btn--ready' },
              { value:'cancelled', label:'Отменить',    icon:'❌', cls:'admin__btn--cancel' }],
  ready:     [{ value:'done',      label:'Выдать',       icon:'✔️', cls:'admin__btn--done' }],
  done:[], completed:[], cancelled:[],
}
const STATUS_FILTERS = [
  { value: null,        label: 'Все',             icon: '📋' },
  { value: 'new',       label: 'Новые',           icon: '🆕' },
  { value: 'pending',   label: 'Ожидают',        icon: '⏳' },
  { value: 'confirmed', label: 'Подтверждёные',  icon: '✅' },
  { value: 'ready',     label: 'Готовы',          icon: '🎁' },
  { value: 'done',      label: 'Выданы',          icon: '✔️' },
  { value: 'cancelled', label: 'Отмененные',     icon: '❌' },
]

const filteredOrders = computed(() =>
  orderFilter.value ? orders.value.filter(o => o.status === orderFilter.value) : orders.value
)
const pagedOrders = computed(() => paginate(filteredOrders.value, orderPage.value))

const pendingCount = computed(() => orders.value.filter(o => o.status === 'new' || o.status === 'pending').length)
const orderCountByStatus = s => orders.value.filter(o => o.status === s).length
const statusLabel = s => STATUS[s]?.label ?? s
const statusIcon  = s => STATUS[s]?.icon  ?? ''
const statusCls   = s => STATUS[s]?.cls   ?? ''
const nextStatuses = s => TRANSITIONS[s] ?? []
const fmtDate = d => new Date(d).toLocaleDateString('ru', { day:'numeric', month:'short', year:'numeric' })

async function changeStatus(order, newStatus) {
  updating.value = order.id
  try {
    await api.patch(`/admin/orders/${order.id}/status`, { status: newStatus })
    order.status = newStatus
    message.success(`Статус → ${statusLabel(newStatus)}`)
  } catch {
    message.error('Не удалось изменить статус')
  } finally {
    updating.value = null
  }
}

// ─── Модал состава заказа ───
const orderItemsModal = ref({ show: false, orderId: null, userName: '', totalCoins: 0 })
const orderItems = ref([])
const loadingOrderItems = ref(false)

async function openOrderItemsModal(order) {
  orderItemsModal.value = {
    show: true,
    orderId: order.id,
    userName: order.user_name,
    totalCoins: order.total_coins ?? 0,
  }
  orderItems.value = []
  loadingOrderItems.value = true
  try {
    const { data } = await api.get(`/admin/orders/${order.id}/items`)
    orderItems.value = Array.isArray(data) ? data : (data?.items ?? [])
  } catch {
    message.error('Не удалось загрузить состав заказа')
  } finally {
    loadingOrderItems.value = false
  }
}

// ─────────────── ТОВАРЫ ───────────────
const products = ref([])
const loadingProducts = ref(false)
const productSearch = ref('')
const savingProduct = ref(false)
const productModal = ref({
  show: false, id: null,
  name: '', description: '', category_id: '',
  price_coins: 0, has_variants: false,
  is_active: true, image_url: '',
  variants: [],
})

const filteredProducts = computed(() => {
  const q = productSearch.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category_name?.toLowerCase().includes(q)
  )
})
const pagedProducts = computed(() => paginate(filteredProducts.value, productPage.value))

function openProductModal(p = null) {
  productModal.value = {
    show: true, id: p?.id ?? null,
    name: p?.name ?? '',
    description: p?.description ?? '',
    category_id: p?.category_id ?? '',
    price_coins: p?.price_coins ?? 0,
    has_variants: p?.has_variants ?? false,
    is_active: p ? (p.is_active ?? true) : true,
    image_url: p?.image_url ?? '',
    variants: p?.variants ? JSON.parse(JSON.stringify(p.variants)) : [],
  }
}

function addVariant() {
  productModal.value.variants.push({ color: '', size: '', stock_qty: 0 })
}

function removeVariant(idx) {
  productModal.value.variants.splice(idx, 1)
}

async function saveProduct() {
  const m = productModal.value
  if (!m.name || !m.category_id || !m.price_coins) { message.warning('Заполните все обязательные поля'); return }
  savingProduct.value = true
  try {
    const payload = {
      name: m.name,
      description: m.description,
      category_id: Number(m.category_id),
      price_coins: m.price_coins,
      has_variants: m.has_variants,
      is_active: m.is_active,
      image_url: m.image_url ?? '',
    }
    if (m.id) {
      await api.put(`/admin/products/${m.id}`, payload)
      const idx = products.value.findIndex(p => p.id === m.id)
      if (idx !== -1) {
        const cat = categories.value.find(c => c.id === Number(m.category_id))
        products.value[idx] = { ...products.value[idx], ...payload, category_name: cat?.name }
      }
      message.success('Товар обновлён')
    } else {
      const { data } = await api.post('/admin/products', payload)
      const cat = categories.value.find(c => c.id === Number(m.category_id))
      products.value.unshift({ ...payload, id: data.id, category_name: cat?.name })
      message.success('Товар добавлен')
    }
    productModal.value.show = false
  } catch {
    message.error('Ошибка сохранения')
  } finally {
    savingProduct.value = false
  }
}

async function deleteProduct(p) {
  if (!confirm(`Удалить «${p.name}»?`)) return
  try {
    await api.delete(`/admin/products/${p.id}`)
    products.value = products.value.filter(x => x.id !== p.id)
    message.success('Товар удалён')
  } catch {
    message.error('Не удалось удалить')
  }
}

// ─────────────── КАТЕГОРИИ ───────────────
const categories = ref([])
const loadingCategories = ref(false)
const savingCat = ref(false)
const catModal = ref({ show: false, loading: false, id: null, name: '', code: '', icon: '', description: '' })

const pagedCategories = computed(() => paginate(categories.value, catPage.value))

const productCountByCategory = code =>
  products.value.filter(p => p.category_code === code).length

/**
 * Открыть модал категории.
 * Если передан объект cat — это редактирование:
 *   сначала показываем модал со скелетоном,
 *   затем запрашиваем /admin/categories/:id чтобы получить
 *   актуальные icon и description (публичный /categories может их не отдавать).
 */
async function openCatModal(cat = null) {
  if (!cat) {
    // Новая категория — просто открываем пустой модал
    catModal.value = { show: true, loading: false, id: null, name: '', code: '', icon: '', description: '' }
    return
  }

  // Редактирование: сразу показываем модал с тем, что уже есть в списке
  catModal.value = {
    show: true,
    loading: true,
    id: cat.id,
    name: cat.name ?? '',
    code: cat.code ?? '',
    icon: cat.icon ?? '',
    description: cat.description ?? '',
  }

  try {
    const { data } = await api.get(`/admin/categories/${cat.id}`)
    catModal.value.name        = data.name        ?? cat.name        ?? ''
    catModal.value.code        = data.code        ?? cat.code        ?? ''
    catModal.value.icon        = data.icon        ?? cat.icon        ?? ''
    catModal.value.description = data.description ?? cat.description ?? ''
    // Обновляем и локальный список, чтобы карточка сразу отразила актуальные данные
    const idx = categories.value.findIndex(c => c.id === cat.id)
    if (idx !== -1) categories.value[idx] = { ...categories.value[idx], ...data }
  } catch {
    message.error('Не удалось загрузить данные категории')
  } finally {
    catModal.value.loading = false
  }
}

async function saveCat() {
  const m = catModal.value
  if (!m.name || !m.code) { message.warning('Заполните название и код'); return }
  savingCat.value = true
  try {
    const payload = { name: m.name, code: m.code, icon: m.icon ?? '', description: m.description ?? '' }
    if (m.id) {
      await api.put(`/admin/categories/${m.id}`, payload)
      const idx = categories.value.findIndex(c => c.id === m.id)
      if (idx !== -1) categories.value[idx] = { ...categories.value[idx], ...payload }
      message.success('Категория обновлена')
    } else {
      const { data } = await api.post('/admin/categories', payload)
      categories.value.push({ ...payload, id: data.id })
      message.success('Категория добавлена')
    }
    catModal.value.show = false
  } catch {
    message.error('Ошибка сохранения')
  } finally {
    savingCat.value = false
  }
}

async function deleteCat(cat) {
  if (!confirm(`Удалить категорию «${cat.name}»? Все товары в ней будут удалены.`)) return
  try {
    await api.delete(`/admin/categories/${cat.id}`)
    categories.value = categories.value.filter(c => c.id !== cat.id)
    message.success('Категория удалена')
  } catch {
    message.error('Не удалось удалить')
  }
}

// ─────────────── ПОЛЬЗОВАТЕЛИ ───────────────
const users = ref([])
const loadingUsers = ref(false)
const userSearch = ref('')

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase().trim()
  if (!q) return users.value
  return users.value.filter(u =>
    u.full_name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q)
  )
})
const pagedUsers = computed(() => paginate(filteredUsers.value, userPage.value))

async function loadUsers() {
  loadingUsers.value = true
  try {
    const { data } = await api.get('/admin/users')
    users.value = Array.isArray(data) ? data : (data?.items ?? [])
  } catch {
    message.error('Не удалось загрузить пользователей')
  } finally {
    loadingUsers.value = false
  }
}

// ─── Модал начисления монет ───
const awardModal = ref({ show: false, userId: null, userName: '', currentBalance: 0, amount: null, reason: '', sign: 1 })
const savingAward = ref(false)

function openAwardModal(u) {
  awardModal.value = {
    show: true,
    userId: u.id,
    userName: u.full_name,
    currentBalance: u.coin_balance ?? 0,
    amount: null,
    reason: '',
    sign: 1,
  }
}

async function submitAward() {
  const m = awardModal.value
  if (!m.amount || m.amount <= 0) { message.warning('Укажите сумму больше 0'); return }
  if (!m.reason?.trim()) { message.warning('Укажите основание'); return }
  savingAward.value = true
  try {
    const { data } = await api.post('/admin/users/coins', {
      user_id: m.userId,
      amount:  m.sign * m.amount,
      reason:  m.reason.trim(),
    })
    const u = users.value.find(x => x.id === m.userId)
    if (u) u.coin_balance = data.new_balance
    message.success(`Готово! Новый баланс: 🪙 ${data.new_balance?.toLocaleString('ru')}`)
    awardModal.value.show = false
  } catch (e) {
    const msg = e?.response?.data?.error ?? 'Ошибка'
    message.error(msg === 'insufficient_balance' ? 'Недостаточно монет у пользователя' : msg)
  } finally {
    savingAward.value = false
  }
}

// ─── Модал истории транзакций ───
const txModal = ref({ show: false, userId: null, userName: '' })
const txList = ref([])
const loadingTx = ref(false)

async function openTxModal(u) {
  txModal.value = { show: true, userId: u.id, userName: u.full_name }
  txList.value = []
  loadingTx.value = true
  try {
    const { data } = await api.get(`/admin/users/${u.id}/transactions`)
    txList.value = Array.isArray(data) ? data : (data?.items ?? [])
  } catch {
    message.error('Не удалось загрузить историю')
  } finally {
    loadingTx.value = false
  }
}

// ─────────────── МОНТИРОВАНИЕ ───────────────
onMounted(async () => {
  loadingOrders.value = true
  loadingProducts.value = true
  loadingCategories.value = true

  const [oRes, pRes, cRes] = await Promise.allSettled([
    api.get('/admin/orders'),
    api.get('/products'),
    api.get('/categories'),
  ])

  if (oRes.status === 'fulfilled') {
    const d = oRes.value.data
    orders.value = Array.isArray(d) ? d : (d?.items ?? [])
  }
  if (pRes.status === 'fulfilled') {
    const d = pRes.value.data
    products.value = Array.isArray(d) ? d : (d?.items ?? [])
  }
  if (cRes.status === 'fulfilled') {
    const d = cRes.value.data
    categories.value = Array.isArray(d) ? d : (d?.items ?? [])
  }

  loadingOrders.value = false
  loadingProducts.value = false
  loadingCategories.value = false

  loadUsers()
})
</script>

<style scoped>
@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}

/* ─── layout ─── */
.admin { padding: 8px 0 48px; display: flex; flex-direction: column; gap: 24px; }

/* ─── header ─── */
.admin__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.admin__header-left { display: flex; align-items: center; gap: 12px; }
.admin__badge { background: #fef9c3; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: .3px; }
.admin__title { font-size: 22px; font-weight: 800; color: #111827; margin: 0; }
.admin__back { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; background: none; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 7px 12px; cursor: pointer; transition: color .15s, border-color .15s; }
.admin__back:hover { color: #3b82f6; border-color: #93c5fd; }

/* ─── tabs ─── */
.admin__tabs { display: flex; gap: 4px; background: #f3f4f6; padding: 4px; border-radius: 12px; width: fit-content; }
.admin__tab { position: relative; display: flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 9px; font-size: 14px; font-weight: 500; color: #6b7280; background: none; border: none; cursor: pointer; transition: color .15s, background .15s; }
.admin__tab:hover { color: #374151; background: rgba(0,0,0,.04); }
.admin__tab.active { background: white; color: #111827; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.admin__tab-badge { background: #ef4444; color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; min-width: 18px; text-align: center; }

/* ─── section ─── */
.admin__section { display: flex; flex-direction: column; gap: 16px; }

/* ─── filters ─── */
.admin__filters { display: flex; gap: 8px; flex-wrap: wrap; }
.admin__filter-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; color: #374151; cursor: pointer; transition: border-color .15s, background .15s, color .15s; }
.admin__filter-btn:hover { border-color: #93c5fd; color: #3b82f6; }
.admin__filter-btn.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; font-weight: 600; }
.admin__filter-count { background: #e5e7eb; border-radius: 20px; font-size: 11px; padding: 1px 6px; font-weight: 600; }
.admin__filter-btn.active .admin__filter-count { background: #bfdbfe; color: #1d4ed8; }

/* ─── toolbar ─── */
.admin__toolbar { display: flex; align-items: center; gap: 12px; }
.admin__search { flex: 1; max-width: 320px; padding: 9px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; background: white; transition: border-color .15s; outline: none; }
.admin__search:focus { border-color: #3b82f6; }

/* ─── table ─── */
.admin__table-wrap { background: white; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.admin__loading { padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; }
.admin__row-skeleton { display: grid; grid-template-columns: 50px 1fr 100px 80px 90px 120px; gap: 12px; align-items: center; padding: 4px 0; }
.users-skeleton { grid-template-columns: 50px 1fr 160px 80px 90px 140px; }
.s-id { height: 16px; width: 40px; } .s-user { height: 16px; } .s-date { height: 14px; } .s-sum { height: 16px; } .s-status { height: 24px; border-radius: 20px; } .s-action { height: 30px; border-radius: 8px; }
.admin__table { width: 100%; border-collapse: collapse; font-size: 14px; }
.admin__table thead { background: #f9fafb; }
.admin__table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid #f3f4f6; white-space: nowrap; }
.admin__table td { padding: 13px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.admin__table-row:last-child td { border-bottom: none; }
.admin__table-row:hover td { background: #fafafa; }
.admin__table-empty { text-align: center; padding: 40px !important; color: #9ca3af; font-size: 14px; }

.admin__cell-id { font-weight: 700; color: #6b7280; font-size: 13px; white-space: nowrap; }
.admin__cell-muted { color: #9ca3af; font-size: 13px; white-space: nowrap; }
.admin__cell-bold { font-weight: 700; color: #111827; white-space: nowrap; }
.admin__user-name { font-weight: 600; color: #111827; }
.admin__product-name { font-weight: 600; color: #111827; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ─── product thumb ─── */
.admin__product-thumb { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.admin__thumb-img { width: 40px; height: 40px; object-fit: cover; }
.admin__thumb-placeholder { font-size: 18px; color: #d1d5db; }

/* ─── active badge ─── */
.admin__active-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }
.active-on  { background: #dcfce7; color: #166534; }
.active-off { background: #f3f4f6; color: #6b7280; }

/* ─── role badges ─── */
.admin__role-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }
.role-admin { background: #fef9c3; color: #92400e; }
.role-user  { background: #f3f4f6; color: #374151; }

/* ─── statuses ─── */
.admin__status { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
.st-new       { background: #e0f2fe; color: #0369a1; }
.st-pending   { background: #fef9c3; color: #92400e; } .st-confirmed { background: #dcfce7; color: #166534; }
.st-ready     { background: #dbeafe; color: #1e40af; } .st-done      { background: #f0fdf4; color: #15803d; }
.st-cancelled { background: #fee2e2; color: #991b1b; }
.admin__cat-badge { display: inline-block; background: #eff6ff; color: #3b82f6; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }

/* ─── action buttons ─── */
.admin__actions-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.admin__btn { padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: background .15s, opacity .15s, transform .1s; }
.admin__btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.admin__btn:active:not(:disabled) { transform: translateY(1px); }
.admin__btn--primary { background: #3b82f6; color: white; } .admin__btn--primary:hover:not(:disabled) { background: #2563eb; }
.admin__btn--sm { padding: 5px 10px; font-size: 12px; }
.admin__btn--ghost { background: #f3f4f6; color: #374151; } .admin__btn--ghost:hover:not(:disabled) { background: #e5e7eb; }
.admin__btn--danger { background: #fee2e2; color: #dc2626; } .admin__btn--danger:hover:not(:disabled) { background: #fecaca; }
.admin__btn--pending { background: #e0f2fe; color: #0369a1; } .admin__btn--pending:hover:not(:disabled) { background: #bae6fd; }
.admin__btn--confirm { background: #dcfce7; color: #15803d; } .admin__btn--confirm:hover:not(:disabled) { background: #bbf7d0; }
.admin__btn--cancel  { background: #fee2e2; color: #dc2626; } .admin__btn--cancel:hover:not(:disabled)  { background: #fecaca; }
.admin__btn--ready   { background: #dbeafe; color: #1e40af; } .admin__btn--ready:hover:not(:disabled)   { background: #bfdbfe; }
.admin__btn--done    { background: #f0fdf4; color: #15803d; } .admin__btn--done:hover:not(:disabled)    { background: #dcfce7; }
.admin__btn--coin    { background: #fef9c3; color: #92400e; } .admin__btn--coin:hover:not(:disabled)    { background: #fde68a; }

/* ─── categories grid ─── */
.admin__cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.admin__cat-card { background: white; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.04); display: flex; flex-direction: column; gap: 6px; }
.skeleton-card { min-height: 100px; }
.s-cat-name { height: 20px; width: 70%; } .s-cat-code { height: 14px; width: 45%; margin-top: 4px; }
.admin__cat-icon-row { display: flex; align-items: center; gap: 8px; }
.admin__cat-icon { font-size: 20px; flex-shrink: 0; }
.admin__cat-name { font-size: 16px; font-weight: 700; color: #111827; } .admin__cat-code { font-size: 12px; color: #6b7280; font-family: monospace; }
.admin__cat-desc { font-size: 12px; color: #6b7280; line-height: 1.4; }
.admin__cat-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 10px; border-top: 1px solid #f3f4f6; }
.admin__cat-count { font-size: 12px; color: #9ca3af; }

/* ─── modal ─── */
.admin__overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.admin__modal { background: white; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,.2); display: flex; flex-direction: column; overflow: hidden; max-height: 90vh; }
.admin__modal--wide { max-width: 720px; }
.admin__modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; font-size: 16px; font-weight: 700; color: #111827; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.admin__modal-close { background: none; border: none; font-size: 22px; color: #9ca3af; cursor: pointer; line-height: 1; padding: 0 4px; }
.admin__modal-close:hover { color: #111827; }
.admin__modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.admin__modal-body--scroll { max-height: 460px; overflow-y: auto; }
.admin__modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; background: #fafafa; flex-shrink: 0; }
.admin__modal-footer--between { justify-content: space-between; align-items: center; }
.admin__label { display: flex; flex-direction: column; gap: 5px; font-size: 13px; font-weight: 600; color: #374151; }
.admin__label--row { flex-direction: row; align-items: center; font-weight: 400; }
.admin__input { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #111827; outline: none; transition: border-color .15s; width: 100%; background: white; }
.admin__input:focus { border-color: #3b82f6; }
.admin__textarea { resize: vertical; min-height: 80px; }
.admin__select { appearance: none; cursor: pointer; }
.admin__hint { font-size: 11px; color: #9ca3af; font-weight: 400; }
.admin__req { color: #ef4444; }

/* ─── icon input ─── */
.admin__icon-input-row { display: flex; align-items: center; gap: 10px; }
.admin__icon-preview { font-size: 24px; flex-shrink: 0; width: 36px; text-align: center; }

/* ─── modal two-column grid ─── */
.admin__modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.admin__modal-col { display: flex; flex-direction: column; gap: 12px; }
@media (max-width: 600px) { .admin__modal-grid { grid-template-columns: 1fr; } }

/* ─── checkboxes group ─── */
.admin__checkboxes { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }

/* ─── image preview ─── */
.admin__img-preview { border-radius: 10px; overflow: hidden; background: #f9fafb; border: 1px solid #e5e7eb; max-height: 160px; display: flex; align-items: center; justify-content: center; }
.admin__preview-img { max-height: 160px; max-width: 100%; object-fit: contain; }

/* ─── variants section ─── */
.admin__variants-section { border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 14px; background: #fafafa; display: flex; flex-direction: column; gap: 10px; }
.admin__variants-header { display: flex; align-items: center; justify-content: space-between; }
.admin__variants-title { font-size: 13px; font-weight: 700; color: #374151; }
.admin__variants-empty { font-size: 13px; color: #9ca3af; text-align: center; padding: 8px 0; }
.admin__variant-row { display: grid; grid-template-columns: 1fr 1fr 90px 32px; gap: 8px; align-items: center; }
.admin__variant-input { font-size: 13px; padding: 7px 10px; }
.admin__variant-stock { text-align: right; }
.admin__variant-del { padding: 6px 8px; font-size: 12px; flex-shrink: 0; }

/* ─── award modal extras ─── */
.admin__balance-info { font-size: 13px; color: #6b7280; background: #f9fafb; border-radius: 8px; padding: 10px 14px; }
.admin__amount-row { display: flex; gap: 8px; margin-bottom: 6px; }
.admin__sign-btn { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #374151; transition: all .15s; }
.admin__sign-btn.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
.admin__sign-btn--minus.active { border-color: #ef4444; background: #fee2e2; color: #dc2626; }

/* ─── order items modal ─── */
.admin__order-items-list { display: flex; flex-direction: column; gap: 0; }
.admin__order-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
.admin__order-item:last-child { border-bottom: none; }
.admin__order-item-thumb { width: 52px; height: 52px; border-radius: 10px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.admin__order-item-thumb .admin__thumb-img { width: 52px; height: 52px; }
.admin__order-item-info { flex: 1; min-width: 0; }
.admin__order-item-name { font-size: 14px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin__order-item-meta { display: flex; align-items: center; gap: 8px; margin-top: 3px; }
.admin__order-item-variant { font-size: 12px; background: #eff6ff; color: #3b82f6; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
.admin__order-item-price { font-size: 14px; font-weight: 700; color: #111827; white-space: nowrap; flex-shrink: 0; }
.admin__order-total { font-size: 14px; font-weight: 700; color: #111827; }

/* ─── transaction list ─── */
.admin__tx-loading { display: flex; flex-direction: column; gap: 8px; }
.admin__tx-list { display: flex; flex-direction: column; gap: 0; }
.admin__tx-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
.admin__tx-row:last-child { border-bottom: none; }
.admin__tx-left { display: flex; flex-direction: column; gap: 3px; }
.admin__tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.admin__tx-amount { font-size: 15px; font-weight: 700; white-space: nowrap; }
.tx-plus  { color: #15803d; } .tx-minus { color: #dc2626; }
.admin__tx-reason { font-size: 13px; color: #374151; max-width: 300px; }
.admin__tx-balance { font-size: 11px; color: #9ca3af; }
.admin__tx-admin  { font-size: 11px; color: #6b7280; }
.admin__tx-date   { font-size: 11px; color: #9ca3af; }

/* ─── mobile ─── */
@media (max-width: 768px) {
  .admin__tabs { width: 100%; overflow-x: auto; }
  .admin__table-wrap { overflow-x: auto; }
  .admin__table { min-width: 700px; }
  .admin__row-skeleton { grid-template-columns: 40px 1fr 80px 70px 70px 90px; }
  .admin__search { max-width: 100%; }
  .admin__toolbar { flex-wrap: wrap; }
  .admin__variant-row { grid-template-columns: 1fr 1fr; }
}
</style>
