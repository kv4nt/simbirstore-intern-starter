<template>
  <app-layout>
    <!-- Скелетон -->
    <template v-if="loading">
      <div class="product-skeleton">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton-info">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line short"></div>
          <div class="skeleton skeleton-price"></div>
        </div>
      </div>
    </template>

    <!-- 404 -->
    <template v-else-if="notFound">
      <div class="product-empty">
        <div class="product-empty__icon">📦</div>
        <h2>Товар не найден</h2>
        <p>Возможно, он был снят с продажи или вы перешли по неверной ссылке.</p>
        <n-button type="primary" @click="router.push('/')">На главную</n-button>
      </div>
    </template>

    <!-- Страница товара -->
    <template v-else-if="product">
      <!-- Хлебные крошки -->
      <nav class="breadcrumb" aria-label="breadcrumb">
        <span class="breadcrumb__item" @click="router.push('/')">Каталог</span>
        <span class="breadcrumb__sep">›</span>
        <span class="breadcrumb__item" @click="router.push('/category/' + product.category_code)">
          {{ product.category_name }}
        </span>
        <span class="breadcrumb__sep">›</span>
        <span class="breadcrumb__item breadcrumb__item--current">{{ product.name }}</span>
      </nav>

      <div class="product">
        <!-- Левая колонка: изображение -->
        <div class="product__gallery">
          <div class="product__img-wrap">
            <img
              v-if="mainImage"
              :src="mainImage"
              :alt="product.name"
              class="product__img"
              loading="lazy"
            />
            <div v-else class="product__img-placeholder">
              <span>{{ product.name[0] }}</span>
            </div>
          </div>

          <!-- Миниатюры (если картинок несколько) -->
          <div v-if="product.images.length > 1" class="product__thumbs">
            <button
              v-for="(img, i) in product.images"
              :key="i"
              class="product__thumb"
              :class="{ active: mainImage === img }"
              @click="mainImage = img"
            >
              <img :src="img" :alt="product.name + ' ' + (i+1)" />
            </button>
          </div>
        </div>

        <!-- Правая колонка: детали -->
        <div class="product__info">
          <!-- Категория-бейдж -->
          <span
            class="product__category-badge"
            @click="router.push('/category/' + product.category_code)"
            :title="'Перейти в раздел ' + product.category_name"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            {{ product.category_name }}
          </span>

          <h1 class="product__name">{{ product.name }}</h1>

          <p class="product__desc">{{ product.description }}</p>

          <!-- Цена -->
          <div class="product__price">
            <span class="product__coin">🪙</span>
            <span class="product__price-val">{{ product.price_coins }}</span>
            <span class="product__price-label">монет</span>
          </div>

          <!-- Варианты -->
          <template v-if="product.has_variants && product.variants.length">
            <!-- Выбор цвета -->
            <div v-if="colors.length" class="product__variants">
              <div class="product__variants-label">Цвет: <strong>{{ selectedColor }}</strong></div>
              <div class="product__color-list">
                <button
                  v-for="color in colors"
                  :key="color"
                  class="product__color-btn"
                  :class="{ active: selectedColor === color, 'is-light': isLightColor(color) }"
                  :style="{ backgroundColor: colorHex(color) }"
                  :title="color"
                  @click="selectedColor = color; selectedSize = null"
                />
              </div>
            </div>

            <!-- Выбор размера -->
            <div v-if="sizesForColor.length" class="product__variants">
              <div class="product__variants-label">Размер:</div>
              <div class="product__size-list">
                <button
                  v-for="size in sizesForColor"
                  :key="size.id"
                  class="product__size-btn"
                  :class="{ active: selectedVariantId === size.id, disabled: size.stock_qty === 0 }"
                  :disabled="size.stock_qty === 0"
                  @click="selectedVariantId = size.id"
                >
                  {{ size.size }}
                  <span v-if="size.stock_qty === 0" class="product__size-out">нет</span>
                </button>
              </div>
            </div>

            <!-- Если нет вариантов (один вариант без цвета/размера) -->
            <div v-if="!colors.length && !sizesForColor.length && product.variants.length === 1" class="product__one-variant">
              Один вариант • {{ product.variants[0].stock_qty }} шт. в наличии
            </div>
          </template>

          <!-- Остаток -->
          <div v-if="selectedVariant" class="product__stock" :class="stockClass">
            {{ stockLabel }}
          </div>

          <!-- Авторизован: добавить в корзину -->
          <template v-if="auth.isLoggedIn">
            <div class="product__cart-row">
              <div class="product__qty">
                <button class="qty-btn" :disabled="qty <= 1" @click="qty--">−</button>
                <span class="qty-val">{{ qty }}</span>
                <button class="qty-btn" :disabled="qty >= 99" @click="qty++">+</button>
              </div>
              <button
                class="product__add-btn"
                :class="{ loading: adding, disabled: !canAdd }"
                :disabled="!canAdd || adding"
                @click="addToCart"
              >
                <span v-if="adding">Добавляем...</span>
                <span v-else-if="addedDone">✓ Добавлено!</span>
                <span v-else>В корзину</span>
              </button>
            </div>
          </template>

          <!-- Гость -->
          <template v-else>
            <div class="product__guest">
              <span>Чтобы заказать товар, нужно</span>
              <button class="product__login-link" @click="router.push('/login')">войти в аккаунт</button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, NButton } from 'naive-ui'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const auth = useAuthStore()
const cart = useCartStore()

const product = ref(null)
const loading = ref(false)
const notFound = ref(false)
const adding = ref(false)
const addedDone = ref(false)
const qty = ref(1)
const mainImage = ref(null)
const selectedColor = ref(null)
const selectedSize = ref(null)
const selectedVariantId = ref(null)

const colors = computed(() => {
  if (!product.value) return []
  const set = new Set(product.value.variants.map(v => v.color).filter(Boolean))
  return [...set]
})

const sizesForColor = computed(() => {
  if (!product.value) return []
  if (selectedColor.value) {
    return product.value.variants.filter(v => v.color === selectedColor.value)
  }
  return product.value.variants.filter(v => v.size)
})

const selectedVariant = computed(() => {
  if (!product.value) return null
  if (selectedVariantId.value) {
    return product.value.variants.find(v => v.id === selectedVariantId.value)
  }
  if (product.value.variants.length === 1) return product.value.variants[0]
  return null
})

const canAdd = computed(() => {
  if (!product.value) return false
  if (!product.value.has_variants) return true
  return !!selectedVariant.value && selectedVariant.value.stock_qty > 0
})

const stockLabel = computed(() => {
  if (!selectedVariant.value) return ''
  const q = selectedVariant.value.stock_qty
  if (q === 0) return 'Нет в наличии'
  if (q <= 3) return `Осталось всего ${q} шт.`
  if (q <= 10) return `В наличии ${q} шт.`
  return 'В наличии'
})

const stockClass = computed(() => {
  if (!selectedVariant.value) return ''
  const q = selectedVariant.value.stock_qty
  if (q === 0) return 'product__stock--out'
  if (q <= 3) return 'product__stock--low'
  return 'product__stock--ok'
})

// Цвета, у которых светлый фон — нужна более заметная обводка
const LIGHT_COLORS = new Set(['Белый', 'Белая', 'Бежевый', 'Бежевая', 'Жёлтый', 'Желтый', 'Светло-серый'])

function isLightColor(name) {
  return LIGHT_COLORS.has(name)
}

function colorHex(name) {
  const map = {
    'Чёрный': '#1a1a1a', 'Черный': '#1a1a1a',
    'Белый': '#f5f5f5', 'Белая': '#f5f5f5',
    'Серый': '#9ca3af', 'Светло-серый': '#e5e7eb',
    'Синий': '#3b82f6', 'Красный': '#ef4444',
    'Зелёный': '#22c55e', 'Зеленый': '#22c55e',
    'Жёлтый': '#eab308', 'Желтый': '#eab308',
    'Оранжевый': '#f97316', 'Фиолетовый': '#a855f7',
    'Розовый': '#ec4899', 'Бежевый': '#d4c5a9', 'Бежевая': '#d4c5a9',
    'Коричневый': '#92400e', 'Голубой': '#38bdf8',
  }
  return map[name] || '#6b7280'
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/products/${route.params.id}`)
    product.value = data
    mainImage.value = data.images?.[0] ?? null
    if (data.variants?.length === 1) {
      selectedVariantId.value = data.variants[0].id
      selectedColor.value = data.variants[0].color
      selectedSize.value = data.variants[0].size
    }
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
})

async function addToCart() {
  if (!canAdd.value) return
  adding.value = true
  try {
    const productId = product.value.id
    const variantId = product.value.has_variants
      ? (selectedVariant.value?.id ?? null)
      : null
    await cart.addItem(productId, variantId, qty.value)
    addedDone.value = true
    message.success('Добавлено в корзину!')
    setTimeout(() => { addedDone.value = false }, 2000)
  } catch (e) {
    message.error(e?.response?.data?.message || 'Не удалось добавить в корзину')
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 8px;
}
.product-skeleton { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 32px 0; }
.skeleton-img { height: 420px; }
.skeleton-info { display: flex; flex-direction: column; gap: 14px; padding-top: 12px; }
.skeleton-title { height: 32px; width: 70%; }
.skeleton-line { height: 16px; }
.skeleton-line.short { width: 55%; }
.skeleton-price { height: 44px; width: 40%; margin-top: 8px; }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.breadcrumb__item { cursor: pointer; transition: color .15s; }
.breadcrumb__item:hover { color: #3b82f6; }
.breadcrumb__item--current { color: #374151; font-weight: 500; cursor: default; }
.breadcrumb__item--current:hover { color: #374151; }
.breadcrumb__sep { color: #d1d5db; }

.product { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }

.product__gallery { display: flex; flex-direction: column; gap: 12px; }
.product__img-wrap {
  border-radius: 16px; overflow: hidden; background: #f3f4f6;
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
}
.product__img { width: 100%; height: 100%; object-fit: contain; padding: 24px; }
.product__img-placeholder { font-size: 80px; font-weight: 700; color: #d1d5db; user-select: none; }
.product__thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
.product__thumb {
  width: 64px; height: 64px; border-radius: 8px; overflow: hidden;
  border: 2px solid transparent; cursor: pointer; background: #f3f4f6;
  padding: 4px; transition: border-color .15s;
}
.product__thumb.active { border-color: #3b82f6; }
.product__thumb img { width: 100%; height: 100%; object-fit: contain; }

.product__info { display: flex; flex-direction: column; gap: 16px; padding-top: 4px; }

/* ── Категория-бейдж ─────────────────────────────────────────── */
.product__category-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #0057B8;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .6px;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 20px;
  width: fit-content;
  cursor: pointer;
  transition: background .15s, transform .1s;
  user-select: none;
}
.product__category-badge:hover {
  background: #003d8f;
  transform: translateY(-1px);
}
.product__category-badge svg {
  flex-shrink: 0;
  opacity: .85;
}

.product__name { font-size: 26px; font-weight: 700; color: #111827; line-height: 1.25; margin: 0; }
.product__desc { font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0; max-width: 54ch; }
.product__price {
  display: flex; align-items: baseline; gap: 8px;
  padding: 16px 20px; background: #f9fafb;
  border-radius: 12px; border: 1px solid #e5e7eb;
}
.product__coin { font-size: 22px; }
.product__price-val { font-size: 32px; font-weight: 800; color: #111827; font-variant-numeric: tabular-nums; }
.product__price-label { font-size: 15px; color: #9ca3af; }

.product__variants { display: flex; flex-direction: column; gap: 8px; }
.product__variants-label { font-size: 13px; color: #6b7280; }
.product__variants-label strong { color: #111827; }
.product__color-list { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Кружки цвета: всегда видны за счёт inset-тени ─────────── */
.product__color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  outline: 2px solid transparent;
  outline-offset: 2px;
  /* тонкая внутренняя рамка — делает кружок видимым на любом фоне */
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  transition: outline-color .15s, transform .1s, box-shadow .15s;
}
.product__color-btn:hover {
  transform: scale(1.12);
}
.product__color-btn.active {
  outline: 2.5px solid #3b82f6;
}
/* Для светлых цветов (белый, бежевый, жёлтый) рамка темнее */
.product__color-btn.is-light {
  box-shadow: inset 0 0 0 1.5px rgba(0, 0, 0, 0.28);
}
.product__color-btn.is-light.active {
  outline: 2.5px solid #1d4ed8;
}

.product__size-list { display: flex; gap: 8px; flex-wrap: wrap; }
.product__size-btn {
  position: relative; min-width: 44px; padding: 6px 14px;
  border-radius: 8px; border: 1.5px solid #e5e7eb;
  font-size: 14px; font-weight: 500; color: #374151;
  background: white; cursor: pointer;
  transition: border-color .15s, background .15s, color .15s;
}
.product__size-btn:hover:not(.disabled) { border-color: #3b82f6; color: #3b82f6; }
.product__size-btn.active { border-color: #3b82f6; background: #eff6ff; color: #3b82f6; font-weight: 600; }
.product__size-btn.disabled { opacity: .45; cursor: not-allowed; text-decoration: line-through; }
.product__size-out { display: block; font-size: 9px; font-weight: 400; color: #9ca3af; line-height: 1; }
.product__one-variant { font-size: 13px; color: #6b7280; background: #f9fafb; padding: 8px 12px; border-radius: 8px; }

.product__stock { font-size: 13px; font-weight: 500; padding: 6px 12px; border-radius: 8px; width: fit-content; }
.product__stock--ok  { background: #f0fdf4; color: #16a34a; }
.product__stock--low { background: #fff7ed; color: #ea580c; }
.product__stock--out { background: #fef2f2; color: #dc2626; }

.product__cart-row { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.product__qty {
  display: flex; align-items: center;
  border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden;
}
.qty-btn { width: 36px; height: 44px; font-size: 18px; color: #374151; background: white; border: none; cursor: pointer; transition: background .1s; }
.qty-btn:hover:not(:disabled) { background: #f3f4f6; }
.qty-btn:disabled { color: #d1d5db; cursor: not-allowed; }
.qty-val { min-width: 36px; text-align: center; font-size: 15px; font-weight: 600; color: #111827; user-select: none; }

.product__add-btn {
  flex: 1; height: 44px; padding: 0 24px;
  background: #3b82f6; color: white; border: none;
  border-radius: 10px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: background .15s, transform .1s;
}
.product__add-btn:hover:not(.disabled):not(.loading) { background: #2563eb; transform: translateY(-1px); }
.product__add-btn:active:not(.disabled) { transform: translateY(0); }
.product__add-btn.disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
.product__add-btn.loading  { background: #60a5fa; cursor: wait; }

.product__guest {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; color: #6b7280;
  background: #f0f9ff; padding: 14px 16px;
  border-radius: 10px; border: 1px solid #bae6fd;
}
.product__login-link {
  background: none; border: none; color: #3b82f6;
  font-weight: 600; cursor: pointer; font-size: 14px;
  text-decoration: underline; text-decoration-color: transparent;
  transition: text-decoration-color .15s;
}
.product__login-link:hover { text-decoration-color: #3b82f6; }

.product-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 80px 20px; gap: 16px; }
.product-empty__icon { font-size: 64px; }
.product-empty h2 { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
.product-empty p { font-size: 15px; color: #6b7280; max-width: 36ch; margin: 0; }

@media (max-width: 768px) {
  .product { grid-template-columns: 1fr; gap: 24px; }
  .product-skeleton { grid-template-columns: 1fr; }
  .product__name { font-size: 22px; }
  .product__price-val { font-size: 26px; }
  .product__add-btn { flex: unset; width: 100%; }
  .product__cart-row { flex-wrap: wrap; }
  .product__qty { flex: 1; justify-content: center; }
}
</style>
