<template>
  <app-layout>
    <div style="max-width:800px;margin:32px auto">
      <n-page-header title="Корзина" @back="router.back()" style="margin-bottom:24px" />

      <n-spin :show="loading">
        <!-- ПУСТАЯ КОРЗИНА -->
        <div v-if="!loading && items.length===0" style="text-align:center;padding:64px;color:var(--ss-muted)">
          <div style="font-size:56px;margin-bottom:16px">🛒</div>
          <div style="font-size:18px;font-weight:600;margin-bottom:8px">Корзина пуста</div>
          <div style="font-size:14px;margin-bottom:24px">Выберите что-нибудь в каталоге</div>
          <n-button type="primary" @click="router.push('/')">Перейти в каталог</n-button>
        </div>

        <!-- ТОВАРЫ -->
        <template v-else-if="!loading">
          <div v-for="item in items" :key="item.id" class="ss-cart-item">
            <div class="ss-cart-thumb">📦</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;margin-bottom:4px">{{ item.name }}</div>
              <div style="font-size:13px;color:#6b7280">
                <span v-if="item.color">{{ item.color }}</span>
                <span v-if="item.color && item.size"> · </span>
                <span v-if="item.size">{{ item.size }}</span>
              </div>
            </div>
            <div class="ss-qty-ctrl">
              <button class="ss-qty-btn" @click="changeQty(item, -1)">−</button>
              <span style="min-width:24px;text-align:center;font-weight:600">{{ item.quantity }}</span>
              <button class="ss-qty-btn" @click="changeQty(item, +1)">+</button>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
              <div style="font-size:16px;font-weight:700">🪙 {{ item.price_coins * item.quantity }}</div>
              <n-button size="tiny" quaternary type="error" @click="removeItem(item.id)">Удалить</n-button>
            </div>
          </div>

          <!-- ИТОГО -->
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px 24px;margin-top:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
              <span style="font-size:16px;color:#6b7280">Итого ({{ totalQty }} шт.):</span>
              <span style="font-size:24px;font-weight:800">🪙 {{ total }}</span>
            </div>
            <div v-if="auth.user" style="display:flex;justify-content:space-between;font-size:13px;color:#6b7280;margin-bottom:16px">
              <span>Баланс:</span>
              <span :style="auth.user.coins >= total ? 'color:#16a34a' : 'color:#dc2626'">🪙 {{ (auth.user.coins ?? 0).toLocaleString('ru') }}</span>
            </div>
            <n-button
              type="primary" block size="large"
              :disabled="total > (auth.user?.coins ?? 0)"
              :loading="ordering"
              @click="placeOrder"
            >
              {{ total > (auth.user?.coins ?? 0) ? 'Недостаточно симбиркоинов' : 'Оформить заказ' }}
            </n-button>
          </div>
        </template>
      </n-spin>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin, NButton, NPageHeader, useMessage } from 'naive-ui'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()
const cartStore = useCartStore()

const items = ref([])
const loading = ref(false)
const ordering = ref(false)

// Считаем по price_coins — именно так называется поле в API
const total = computed(() =>
  items.value.reduce((s, i) => s + i.price_coins * i.quantity, 0)
)
const totalQty = computed(() =>
  items.value.reduce((s, i) => s + i.quantity, 0)
)

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/cart')
    items.value = Array.isArray(data) ? data : (data?.items ?? [])
    cartStore.setCount(totalQty.value)
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

async function changeQty(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) { await removeItem(item.id); return }
  await api.patch(`/cart/items/${item.id}`, { quantity: newQty })
  item.quantity = newQty
  cartStore.setCount(totalQty.value)
}

async function removeItem(id) {
  await api.delete(`/cart/items/${id}`)
  items.value = items.value.filter(i => i.id !== id)
  cartStore.setCount(totalQty.value)
}

async function placeOrder() {
  ordering.value = true
  try {
    await api.post('/orders/checkout')
    message.success('Заказ успешно оформлен! 🎉')
    items.value = []
    cartStore.setCount(0)
    await auth.fetchMe()
    router.push('/orders')
  } catch (e) {
    message.error(e?.response?.data?.message || 'Не удалось оформить заказ')
  } finally {
    ordering.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.ss-cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 10px;
}
.ss-cart-thumb {
  width: 56px;
  height: 56px;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}
.ss-qty-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px 8px;
}
.ss-qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  color: #374151;
  transition: background .1s;
}
.ss-qty-btn:hover { background: #e5e7eb; }
</style>
