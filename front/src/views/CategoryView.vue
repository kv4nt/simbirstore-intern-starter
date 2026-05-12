<template>
  <app-layout>

    <!-- HERO -->
    <section class="cat-hero" :style="heroStyle">
      <div class="cat-hero-overlay"></div>
      <div class="cat-hero-content">
        <button class="cat-back" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Каталог
        </button>
        <div class="cat-hero-emoji">{{ catInfo.emoji }}</div>
        <h1 class="cat-hero-title">{{ catInfo.name }}</h1>
        <p class="cat-hero-desc">{{ catInfo.desc }}</p>
        <div class="cat-hero-meta">
          <span class="cat-hero-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            {{ filteredProducts.length }} товаров
          </span>
          <span class="cat-hero-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Доставка 3 дня
          </span>
        </div>
      </div>
    </section>

    <!-- TOOLBAR -->
    <div class="cat-toolbar">
      <!-- Поиск -->
      <div class="cat-search">
        <svg class="cat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="query"
          class="cat-search-input"
          type="text"
          placeholder="Найти в категории..."
          @input="page = 1"
        />
        <button v-if="query" class="cat-search-clear" @click="query = ''; page = 1">✕</button>
      </div>

      <!-- Сортировка -->
      <div class="cat-sort">
        <button
          v-for="s in sortOptions" :key="s.value"
          class="cat-sort-btn"
          :class="{ active: sort === s.value }"
          @click="sort = s.value; page = 1"
        >{{ s.label }}</button>
      </div>
    </div>

    <!-- LOADING SKELETON -->
    <div v-if="loading" class="ss-product-grid">
      <div v-for="i in 8" :key="i" class="cat-skeleton-card">
        <div class="cat-skeleton-img shimmer"></div>
        <div class="cat-skeleton-body">
          <div class="cat-skeleton-line shimmer" style="width:40%;height:11px"></div>
          <div class="cat-skeleton-line shimmer" style="width:80%;height:15px;margin-top:6px"></div>
          <div class="cat-skeleton-line shimmer" style="width:55%;height:13px;margin-top:8px"></div>
        </div>
      </div>
    </div>

    <!-- ПУСТО -->
    <div v-else-if="paged.length === 0" class="cat-empty">
      <div class="cat-empty-icon">🔍</div>
      <div class="cat-empty-title">Ничего не найдено</div>
      <div class="cat-empty-hint">Попробуй другой запрос или сбрось фильтр</div>
      <button class="cat-empty-btn" @click="query = ''; sort = 'default'; page = 1">Сбросить</button>
    </div>

    <!-- GRID -->
    <template v-else>
      <div class="ss-product-grid">
        <article
          v-for="p in paged" :key="p.id"
          class="ss-product-card cat-card"
          @click="router.push('/product/' + p.id)"
        >
          <div class="ss-badge" :class="badgeClass(p)" v-if="p.badge">{{ p.badge }}</div>
          <div class="ss-product-img">
            <img
              v-if="productImage(p)"
              :src="productImage(p)"
              :alt="p.name"
              loading="lazy"
              style="width:100%;height:100%;object-fit:cover;border-radius:var(--ss-radius) var(--ss-radius) 0 0"
            />
            <span v-else style="font-size:44px">{{ catInfo.emoji }}</span>
          </div>
          <div class="ss-product-body">
            <div class="ss-product-tag">{{ p.category_name ?? catInfo.name }}</div>
            <div class="ss-product-name">{{ p.name }}</div>
            <div class="ss-product-footer">
              <div>
                <div class="ss-price">🪙 {{ (p.price_coins ?? p.min_price ?? 0).toLocaleString('ru') }}</div>
                <div v-if="p.old_price" class="ss-price-old">🪙 {{ p.old_price.toLocaleString('ru') }}</div>
              </div>
              <button
                class="ss-add-btn"
                @click.stop="quickAdd(p)"
                :aria-label="'Добавить ' + p.name + ' в корзину'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span>В корзину</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- ПАГИНАЦИЯ -->
      <div v-if="totalPages > 1" class="cat-pagination">
        <button class="cat-page-btn" :disabled="page === 1" @click="page--; scrollTop()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button
          v-for="n in pageNumbers" :key="n"
          class="cat-page-btn"
          :class="{ active: page === n, ellipsis: n === '…' }"
          :disabled="n === '…'"
          @click="n !== '…' && (page = n, scrollTop())"
        >{{ n }}</button>
        <button class="cat-page-btn" :disabled="page === totalPages" @click="page++; scrollTop()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </template>

  </app-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router  = useRouter()
const route   = useRoute()
const message = useMessage()
const auth    = useAuthStore()
const cart    = useCartStore()

// ── state ──────────────────────────────────────────────────────────────────
const products = ref([])
const loading  = ref(false)
const query    = ref('')
const sort     = ref('default')
const page     = ref(1)
const PER_PAGE = 12

// ── category meta ──────────────────────────────────────────────────────────
const CATEGORIES = {
  clothes:     { name: 'Одежда',      emoji: '👕', desc: 'Футболки, худи, толстовки и другая одежда с символикой SimbirSoft', color: '#1a56db', from: '#1e3a8a', to: '#2563eb' },
  accessories: { name: 'Аксессуары',  emoji: '👜', desc: 'Сумки, рюкзаки, кепки и другие аксессуары для стиля и дела',       color: '#0e9f6e', from: '#064e3b', to: '#059669' },
  drinkware:   { name: 'Посуда',      emoji: '☕', desc: 'Кружки, термокружки, бутылки для воды — бодрость на весь день',    color: '#c2410c', from: '#7c2d12', to: '#ea580c' },
  stationery:  { name: 'Канцелярия',  emoji: '📝', desc: 'Блокноты, ручки, стикеры и всё для продуктивной работы',           color: '#6d28d9', from: '#3b0764', to: '#7c3aed' },
  tech:        { name: 'Техника',     emoji: '📱', desc: 'Гаджеты, аксессуары для техники и электроника',                    color: '#0f766e', from: '#134e4a', to: '#0d9488' },
  books:       { name: 'Книги',       emoji: '📖', desc: 'Профессиональная литература и книги от SimbirSoft',                 color: '#b45309', from: '#451a03', to: '#d97706' },
}
const DEFAULT_CAT = { name: 'Товары', emoji: '📦', desc: 'Все товары SimbirStore', color: '#0057B8', from: '#003880', to: '#1a7acc' }

const catCode = computed(() => route.params.code)
const catInfo = computed(() => CATEGORIES[catCode.value] ?? DEFAULT_CAT)

const heroStyle = computed(() => ({
  background: `linear-gradient(135deg, ${catInfo.value.from} 0%, ${catInfo.value.to} 100%)`
}))

// ── sort options ────────────────────────────────────────────────────────────
const sortOptions = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price_asc',  label: '↑ Цена'  },
  { value: 'price_desc', label: '↓ Цена'  },
  { value: 'name',       label: 'А–Я'     },
]

// ── computed ────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = products.value
  if (query.value.trim()) {
    const q = query.value.toLowerCase()
    list = list.filter(p => p.name?.toLowerCase().includes(q))
  }
  if (sort.value === 'price_asc')  list = [...list].sort((a, b) => (a.price_coins ?? 0) - (b.price_coins ?? 0))
  if (sort.value === 'price_desc') list = [...list].sort((a, b) => (b.price_coins ?? 0) - (a.price_coins ?? 0))
  if (sort.value === 'name')       list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  return list
})

const filteredProducts = filtered

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const paged = computed(() => {
  const start = (page.value - 1) * PER_PAGE
  return filtered.value.slice(start, start + PER_PAGE)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (cur > 3) pages.push('…')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

// ── helpers ──────────────────────────────────────────────────────────────────
function productImage(p) {
  if (p.images?.length) return p.images[0].image_url ?? p.images[0].url ?? p.images[0]
  return p.image_url ?? null
}

function badgeClass(p) {
  if (p.badge === '🔥 Хит') return 'ss-badge-hot'
  if (p.badge === 'Новинка') return 'ss-badge-new'
  return 'ss-badge-sale'
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Добавить товар в корзину прямо из карточки.
 * Сигнатура cart.addItem(productId, variantId, qty) — как в ProductView.
 */
async function quickAdd(product) {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  try {
    const variantId = product.default_variant_id ?? null
    await cart.addItem(product.id, variantId, 1)
    message.success('Добавлено в корзину 🛍️')
  } catch {
    router.push('/product/' + product.id)
  }
}

// ── data loading ─────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  page.value = 1
  try {
    const code = catCode.value
    const [pRes] = await Promise.all([ api.get('/products') ])
    const all = Array.isArray(pRes.data)
      ? pRes.data
      : (pRes.data?.products ?? pRes.data?.items ?? pRes.data?.data ?? [])
    // фильтруем по категории если код передан
    products.value = all.filter(p => {
      const c = p.category_code ?? p.categoryCode ?? p.category?.code ?? null
      return !code || c === code
    })
  } catch (e) {
    console.error('[CategoryView] load error', e)
  } finally {
    loading.value = false
  }
}

watch(catCode, load)
onMounted(load)
</script>

<style scoped>
/* ── HERO ─────────────────────────────────────────────────────────────────── */
.cat-hero {
  position: relative;
  border-radius: 0 0 24px 24px;
  margin: 0 -24px 36px;
  padding: 40px 48px 44px;
  overflow: hidden;
  color: #fff;
}
.cat-hero::after {
  content: '';
  position: absolute; right: -80px; top: -80px;
  width: 380px; height: 380px; border-radius: 50%;
  background: rgba(255,255,255,.06);
  pointer-events: none;
}
.cat-hero::before {
  content: '';
  position: absolute; left: -40px; bottom: -60px;
  width: 240px; height: 240px; border-radius: 50%;
  background: rgba(255,255,255,.04);
  pointer-events: none;
}
.cat-hero-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.08);
  pointer-events: none;
}
.cat-hero-content { position: relative; }

.cat-back {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.28);
  color: #fff; border-radius: 8px; padding: 6px 12px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  margin-bottom: 20px;
  transition: background .15s;
}
.cat-back:hover { background: rgba(255,255,255,.28); }

.cat-hero-emoji {
  font-size: 52px; line-height: 1;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,.2));
}
.cat-hero-title {
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 800; line-height: 1.1;
  margin-bottom: 10px;
}
.cat-hero-desc {
  font-size: 15px; opacity: .85; max-width: 480px;
  line-height: 1.6; margin-bottom: 20px;
}
.cat-hero-meta { display: flex; gap: 10px; flex-wrap: wrap; }
.cat-hero-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25);
  border-radius: 20px; padding: 4px 12px;
  font-size: 12px; font-weight: 600;
}

/* ── TOOLBAR ──────────────────────────────────────────────────────────────── */
.cat-toolbar {
  display: flex; align-items: center; gap: 16px;
  flex-wrap: wrap; margin-bottom: 24px;
}
.cat-search {
  position: relative; flex: 1; min-width: 200px;
}
.cat-search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--ss-faint); pointer-events: none;
}
.cat-search-input {
  width: 100%; height: 40px;
  padding: 0 36px 0 38px;
  border: 1px solid var(--ss-border);
  border-radius: 10px; background: var(--ss-surface);
  font-size: 14px; color: var(--ss-text);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.cat-search-input::placeholder { color: var(--ss-faint); }
.cat-search-input:focus {
  border-color: var(--ss-primary);
  box-shadow: 0 0 0 3px rgba(0,87,184,.1);
}
.cat-search-clear {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--ss-faint);
  cursor: pointer; font-size: 13px; padding: 4px;
  line-height: 1;
  transition: color .15s;
}
.cat-search-clear:hover { color: var(--ss-text); }

.cat-sort { display: flex; gap: 6px; flex-wrap: wrap; }
.cat-sort-btn {
  padding: 7px 14px; border-radius: 8px;
  border: 1px solid var(--ss-border);
  background: var(--ss-surface);
  font-size: 13px; font-weight: 500; color: var(--ss-muted);
  cursor: pointer;
  transition: border-color .15s, color .15s, background .15s;
  white-space: nowrap;
}
.cat-sort-btn:hover { border-color: var(--ss-primary); color: var(--ss-primary); }
.cat-sort-btn.active {
  background: var(--ss-primary); border-color: var(--ss-primary);
  color: #fff;
}

/* ── SKELETON ─────────────────────────────────────────────────────────────── */
@keyframes shimmer {
  0%   { background-position: -400px 0 }
  100% { background-position: 400px 0 }
}
.shimmer {
  background: linear-gradient(90deg, #eef0f4 25%, #e2e5eb 50%, #eef0f4 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
.cat-skeleton-card {
  background: var(--ss-surface);
  border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius);
  overflow: hidden;
}
.cat-skeleton-img { height: 160px; }
.cat-skeleton-body { padding: 14px; }
.cat-skeleton-line {
  border-radius: 6px;
  margin-bottom: 6px;
}

/* ── CARD hover accent ────────────────────────────────────────────────────── */
.cat-card { transition: box-shadow .2s, transform .15s; }
.cat-card:hover {
  box-shadow: 0 10px 32px rgba(0,87,184,.15);
  transform: translateY(-3px);
}

/* ── EMPTY ────────────────────────────────────────────────────────────────── */
.cat-empty {
  text-align: center; padding: 64px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.cat-empty-icon  { font-size: 52px; }
.cat-empty-title { font-size: 18px; font-weight: 700; color: var(--ss-text); }
.cat-empty-hint  { font-size: 14px; color: var(--ss-muted); }
.cat-empty-btn {
  margin-top: 8px; padding: 9px 24px;
  background: var(--ss-primary); color: #fff;
  border: none; border-radius: 9px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: background .15s;
}
.cat-empty-btn:hover { background: #0047A0; }

/* ── PAGINATION ───────────────────────────────────────────────────────────── */
.cat-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; margin-top: 36px; flex-wrap: wrap;
}
.cat-page-btn {
  min-width: 38px; height: 38px; padding: 0 10px;
  border-radius: 9px; border: 1px solid var(--ss-border);
  background: var(--ss-surface); color: var(--ss-muted);
  font-size: 14px; font-weight: 500; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .15s, color .15s, background .15s;
}
.cat-page-btn:hover:not(:disabled):not(.ellipsis) {
  border-color: var(--ss-primary); color: var(--ss-primary);
}
.cat-page-btn.active {
  background: var(--ss-primary); border-color: var(--ss-primary);
  color: #fff;
}
.cat-page-btn:disabled { opacity: .4; cursor: default; }
.cat-page-btn.ellipsis { border: none; background: none; cursor: default; }

/* ── RESPONSIVE ───────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .cat-hero { padding: 28px 20px 32px; margin: 0 -16px 24px; }
  .cat-hero-emoji { font-size: 40px; }
  .cat-toolbar { flex-direction: column; align-items: stretch; }
  .cat-sort { justify-content: flex-start; }
}
</style>
