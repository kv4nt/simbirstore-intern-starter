<template>
  <app-layout>
    <section class="ss-hero">
      <div class="ss-hero-eyebrow">🎯 Только для сотрудников SimbirSoft</div>
      <h1 class="ss-hero-title">Твой любимый<br><span class="accent">корпоративный</span><br>мерч за <span style="color:#F5A623">симбиркоины</span></h1>
      <p class="ss-hero-desc">Футболки, худи, аксессуары и многое другое — выбирай и оплачивай внутренней валютой компании.</p>
      <div class="ss-hero-actions">
        <button class="ss-btn-white" @click="scrollToCatalog">📦 Смотреть каталог</button>
        <button class="ss-btn-ghost" @click="scrollToHow">Как это работает?</button>
      </div>
      <div class="ss-hero-stats">
        <div><div class="ss-hero-stat-value">{{ products.length || '80' }}+</div><div class="ss-hero-stat-label">товаров в каталоге</div></div>
        <div><div class="ss-hero-stat-value">🪙 {{ auth.isLoggedIn ? (auth.user?.coins?.toLocaleString('ru') ?? '—') : '???' }}</div><div class="ss-hero-stat-label">твой баланс</div></div>
        <div><div class="ss-hero-stat-value">3 дня</div><div class="ss-hero-stat-label">среднее время выдачи</div></div>
      </div>
    </section>

    <div class="ss-section">
      <div class="ss-section-header"><h2 class="ss-section-title">🔥 Популярное</h2></div>
      <n-spin :show="loadingPopular">
        <div class="ss-product-grid">
          <article v-for="p in popularProducts" :key="p.id" class="ss-product-card" @click="router.push('/product/'+p.id)">
            <div class="ss-badge ss-badge-hot">🔥 Хит</div>
            <div class="ss-product-img"><span style="font-size:40px">{{ p.emoji || '📦' }}</span></div>
            <div class="ss-product-body">
              <div class="ss-product-tag">{{ p.category_name }}</div>
              <div class="ss-product-name">{{ p.name }}</div>
              <div class="ss-product-footer">
                <div class="ss-price">🪙 {{ p.price_coins ?? p.min_price }}</div>
                <button class="ss-add-btn" @click.stop="quickAdd(p)">В корзину</button>
              </div>
            </div>
          </article>
        </div>
      </n-spin>
    </div>

    <div ref="catalogRef" class="ss-section">
      <div class="ss-section-header"><h2 class="ss-section-title">🛒 Товары</h2></div>
      <div class="ss-cat-grid" style="margin-bottom:24px">
        <div class="ss-cat-card" @click="scrollToCatalog"><span class="ss-cat-icon">🏪</span> Все</div>
        <div v-for="cat in uniqueCategories" :key="cat.code" class="ss-cat-card" @click="router.push('/category/' + cat.code)">
          <span class="ss-cat-icon">{{ catIcon(cat.code) }}</span> {{ cat.name }}
        </div>
      </div>
      <n-spin :show="loadingProducts">
        <div class="ss-product-grid">
          <article v-for="p in products" :key="p.id" class="ss-product-card" @click="router.push('/product/'+p.id)">
            <div class="ss-product-img"><span style="font-size:40px">{{ p.emoji || '📦' }}</span></div>
            <div class="ss-product-body">
              <div class="ss-product-tag">{{ p.category_name }}</div>
              <div class="ss-product-name">{{ p.name }}</div>
              <div class="ss-product-footer">
                <div class="ss-price">🪙 {{ p.price_coins ?? p.min_price }}</div>
                <button class="ss-add-btn" @click.stop="quickAdd(p)">В корзину</button>
              </div>
            </div>
          </article>
        </div>
      </n-spin>
    </div>

    <div ref="howRef" class="ss-section">
      <div class="ss-section-header"><h2 class="ss-section-title">Как это работает?</h2></div>
      <div class="how-grid">
        <div v-for="(step, i) in howSteps" :key="i" class="how-card">
          <div class="how-number">0{{ i + 1 }}</div>
          <div class="how-icon">{{ step.icon }}</div>
          <div class="how-title">{{ step.title }}</div>
          <div class="how-desc">{{ step.desc }}</div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin, useMessage } from 'naive-ui'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()
const cart = useCartStore()

const products = ref([])
const popularProducts = ref([])
const categories = ref([])
const loadingProducts = ref(false)
const loadingPopular = ref(false)
const catalogRef = ref(null)
const howRef = ref(null)

const howSteps = [
  { icon: '🪙', title: 'Зарабатывай коины', desc: 'Участвуй в жизни компании.' },
  { icon: '🛍️', title: 'Выбирай мерч', desc: 'Добавляй понравившееся в корзину.' },
  { icon: '✅', title: 'Оформляй заказ', desc: 'Коины спишутся автоматически.' },
  { icon: '🏢', title: 'Забирай в офисе', desc: 'Тебе придёт уведомление, когда всё готово.' },
]

const ICONS = { clothes: '👕', accessories: '👜', drinkware: '☕', stationery: '📝', tech: '📱', books: '📖' }
function catIcon(code) { return ICONS[code] || '📂' }

function extractArray(data, hints = []) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    for (const k of hints) if (Array.isArray(data[k])) return data[k]
    for (const k of Object.keys(data)) if (Array.isArray(data[k])) return data[k]
  }
  return []
}

const uniqueCategories = computed(() => {
  const seen = new Set()
  return categories.value.filter(c => { if (seen.has(c.code)) return false; seen.add(c.code); return true })
})

async function quickAdd(product) {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  try {
    await cart.addItem(product.id, product.default_variant_id ?? null, 1)
    message.success('Добавлено в корзину 🛍️')
  } catch { router.push('/product/' + product.id) }
}

function scrollToCatalog() { catalogRef.value?.scrollIntoView({ behavior: 'smooth' }) }
function scrollToHow() { howRef.value?.scrollIntoView({ behavior: 'smooth' }) }

onMounted(async () => {
  loadingPopular.value = true
  api.get('/products/popular').then(r => { popularProducts.value = extractArray(r.data, ['products', 'items', 'data']) }).catch(() => {}).finally(() => { loadingPopular.value = false })
  loadingProducts.value = true
  try {
    const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')])
    products.value = extractArray(pRes.data, ['products', 'items', 'data'])
    categories.value = extractArray(cRes.data, ['categories', 'items', 'data'])
    if (!popularProducts.value.length && products.value.length) popularProducts.value = products.value.slice(0, 6)
  } catch (e) { console.error(e) } finally { loadingProducts.value = false }
})
</script>

<style scoped>
.how-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:20px; }
.how-card { background:var(--ss-surface); border:1px solid var(--ss-border); border-radius:var(--ss-radius); padding:24px; display:flex; flex-direction:column; transition:box-shadow .2s,transform .15s; }
.how-card:hover { box-shadow:0 8px 24px rgba(0,87,184,.1); transform:translateY(-2px); }
.how-number { font-size:32px; font-weight:800; color:var(--ss-primary); opacity:.25; line-height:1; margin-bottom:10px; }
.how-icon { font-size:28px; margin-bottom:12px; }
.how-title { font-weight:700; font-size:15px; margin-bottom:8px; }
.how-desc { font-size:14px; color:var(--ss-muted); line-height:1.6; }
</style>
