<template>
  <app-layout>
    <div style="max-width:860px;margin:32px auto">
      <n-page-header title="Мои заказы" @back="router.back()" style="margin-bottom:24px" />

      <n-spin :show="loading">
        <div v-if="!loading && orders.length===0" style="text-align:center;padding:64px;color:var(--ss-muted)">
          <div style="font-size:56px;margin-bottom:16px">📋</div>
          <div style="font-size:18px;font-weight:600;margin-bottom:8px">Заказов пока нет</div>
          <div style="font-size:14px;margin-bottom:24px">Оформите первый заказ из корзины</div>
          <n-button type="primary" @click="router.push('/')">В каталог</n-button>
        </div>

        <div v-for="order in orders" :key="order.id" class="ss-order-card">
          <div class="ss-order-header">
            <div>
              <span style="font-weight:700">Заказ #{{ order.id }}</span>
              <span style="font-size:13px;color:var(--ss-muted);margin-left:12px">{{ formatDate(order.created_at) }}</span>
            </div>
            <span class="ss-status" :class="statusClass(order.status)">
              {{ statusIcon(order.status) }} {{ statusLabel(order.status) }}
            </span>
          </div>

          <!-- Позиции заказа: защищаемся от null -->
          <div v-if="order.items && order.items.length" style="display:flex;flex-direction:column;gap:8px">
            <div v-for="item in order.items" :key="item.id"
              style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0;border-bottom:1px solid var(--ss-border)">
              <span>
                {{ item.name }}
                <span v-if="item.color" style="color:var(--ss-muted)"> · {{ item.color }}</span>
                <span v-if="item.size" style="color:var(--ss-muted)"> · {{ item.size }}</span>
                <span style="color:var(--ss-muted)"> × {{ item.quantity }}</span>
              </span>
              <span style="font-weight:600">🪙 {{ item.price_coins * item.quantity }}</span>
            </div>
          </div>
          <div v-else style="font-size:13px;color:var(--ss-muted);padding:8px 0">
            Состав заказа недоступен
          </div>

          <div style="display:flex;justify-content:flex-end;margin-top:12px">
            <span style="font-size:16px;font-weight:800">Итого: 🪙 {{ order.total_coins }}</span>
          </div>
        </div>
      </n-spin>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin, NButton, NPageHeader } from 'naive-ui'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/api'

const router = useRouter()
const orders = ref([])
const loading = ref(false)

const STATUS = {
  pending:   { label: 'Ожидает',        icon: '⏳', cls: 'ss-status-pending'   },
  confirmed: { label: 'Подтверждён',  icon: '✅', cls: 'ss-status-confirmed' },
  ready:     { label: 'Готов к выдаче', icon: '🎁', cls: 'ss-status-ready'     },
  done:      { label: 'Выдан',         icon: '✔️', cls: 'ss-status-done'      },
  cancelled: { label: 'Отменён',       icon: '❌', cls: 'ss-status-cancelled' },
}
const statusLabel = s => STATUS[s]?.label ?? s
const statusIcon  = s => STATUS[s]?.icon  ?? ''
const statusClass = s => STATUS[s]?.cls   ?? ''

const formatDate = d => new Date(d).toLocaleDateString('ru', {
  day: 'numeric', month: 'long', year: 'numeric'
})

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/orders')
    // API возвращает { items: Order[], total_count: N }
    // или просто массив Order[] — обрабатываем оба случая
    const list = Array.isArray(data) ? data : (data?.items ?? [])
    // Гарантируем что items внутри каждого заказа всегда массив
    orders.value = list.map(o => ({ ...o, items: o.items ?? [] }))
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ss-order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
}
.ss-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.ss-status {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: #f3f4f6;
  color: #374151;
}
.ss-status-pending   { background:#fef3c7; color:#92400e; }
.ss-status-confirmed { background:#dbeafe; color:#1e40af; }
.ss-status-ready     { background:#d1fae5; color:#065f46; }
.ss-status-done      { background:#f3f4f6; color:#374151; }
.ss-status-cancelled { background:#fee2e2; color:#991b1b; }
</style>
