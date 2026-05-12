<template>
  <app-layout>
    <div class="profile">

      <!-- ── Hero-шапка ── -->
      <div class="profile__hero">
        <div class="profile__avatar">
          <span>{{ initials }}</span>
        </div>
        <div class="profile__hero-info">
          <div class="profile__name">{{ auth.user?.full_name ?? auth.user?.name ?? '—' }}</div>
          <div class="profile__email">{{ auth.user?.email }}</div>
          <div class="profile__meta">
            <span v-if="isAdmin" class="profile__role profile__role--admin">👑 Администратор</span>
            <span v-else class="profile__role profile__role--user">👤 Сотрудник</span>
            <span v-if="auth.user?.position" class="profile__office">💼 {{ auth.user.position }}</span>
            <span v-else-if="auth.user?.office" class="profile__office">🏢 {{ auth.user.office }}</span>
          </div>
        </div>
        <button class="profile__logout" @click="handleLogout" title="Выйти">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Выйти
        </button>
      </div>

      <!-- ── Баланс ── -->
      <div class="profile__balance">
        <div class="profile__balance-bg"></div>
        <div class="profile__balance-content">
          <div class="profile__balance-label">Баланс</div>
          <div class="profile__balance-val">
            <span class="profile__coin">🪙</span>
            <span class="profile__balance-num">{{ (auth.user?.coin_balance ?? auth.user?.coins ?? 0).toLocaleString('ru') }}</span>
            <span class="profile__balance-currency">симбиркоинов</span>
          </div>
          <div class="profile__balance-hint">SimbirSoft • внутренняя валюта</div>
        </div>
      </div>

      <!-- ── Статистика ── -->
      <div class="profile__stats">
        <div class="profile__stat-card">
          <div class="profile__stat-icon">🛋️</div>
          <div class="profile__stat-val">
            <template v-if="loadingStats">
              <div class="skeleton skeleton-sm"></div>
            </template>
            <template v-else>{{ stats.total_orders ?? 0 }}</template>
          </div>
          <div class="profile__stat-label">Всего заказов</div>
        </div>
        <div class="profile__stat-card">
          <div class="profile__stat-icon">🪙</div>
          <div class="profile__stat-val">
            <template v-if="loadingStats">
              <div class="skeleton skeleton-sm"></div>
            </template>
            <template v-else>{{ (stats.spent ?? 0).toLocaleString('ru') }}</template>
          </div>
          <div class="profile__stat-label">Потрачено</div>
        </div>
        <div class="profile__stat-card">
          <div class="profile__stat-icon">⏳</div>
          <div class="profile__stat-val">
            <template v-if="loadingStats">
              <div class="skeleton skeleton-sm"></div>
            </template>
            <template v-else>{{ stats.pending_orders ?? 0 }}</template>
          </div>
          <div class="profile__stat-label">В обработке</div>
        </div>
      </div>

      <!-- ── Быстрые действия ── -->
      <div class="profile__actions">
        <button class="profile__action-btn" @click="router.push('/')">
          <span class="profile__action-icon">🛒</span>
          <span>В магазин</span>
        </button>
        <button class="profile__action-btn" @click="router.push('/orders')">
          <span class="profile__action-icon">📦</span>
          <span>Мои заказы</span>
        </button>
        <button v-if="isAdmin" class="profile__action-btn profile__action-btn--admin" @click="router.push('/admin')">
          <span class="profile__action-icon">⚙️</span>
          <span>Админпанель</span>
        </button>
      </div>

      <!-- ── История транзакций ── -->
      <div class="profile__card">
        <div class="profile__card-header">
          <span class="profile__card-title">История транзакций</span>
          <span class="profile__tx-count" v-if="txs.length">{{ txs.length }}</span>
        </div>

        <template v-if="loadingTxs">
          <div v-for="i in 4" :key="i" class="profile__tx-skeleton">
            <div class="skeleton skeleton-tx-left"></div>
            <div class="skeleton skeleton-tx-right"></div>
          </div>
        </template>

        <div v-else-if="txs.length === 0" class="profile__empty">
          <div class="profile__empty-icon">💸</div>
          <div>Транзакций пока нет</div>
          <div class="profile__empty-hint">Здесь будет отображаться история начислений и списаний</div>
        </div>

        <div v-else class="profile__tx-list">
          <div v-for="tx in txs" :key="tx.id" class="profile__tx">
            <div class="profile__tx-icon" :class="tx.amount > 0 ? 'tx-plus' : 'tx-minus'">
              {{ tx.amount > 0 ? '↑' : '↓' }}
            </div>
            <div class="profile__tx-body">
              <div class="profile__tx-desc">{{ tx.comment || tx.reason || tx.description || '—' }}</div>
              <div class="profile__tx-date">{{ formatDate(tx.created_at) }}</div>
            </div>
            <div class="profile__tx-amount" :class="tx.amount > 0 ? 'tx-amount-plus' : 'tx-amount-minus'">
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toLocaleString('ru') }} 🪙
            </div>
          </div>
        </div>
      </div>

    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const txs = ref([])
const stats = ref({})
const loadingTxs = ref(false)
const loadingStats = ref(false)

const initials = computed(() => {
  const name = auth.user?.full_name ?? auth.user?.name ?? ''
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
})

const isAdmin = computed(() => auth.user?.role === 'admin')

const formatDate = d => new Date(d).toLocaleDateString('ru', {
  day: 'numeric', month: 'long', year: 'numeric'
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  // Обновляем данные пользователя из /me (чтобы position появился сразу)
  try {
    const meRes = await api.get('/me')
    if (meRes.data) auth.setUser(meRes.data)
  } catch {}

  loadingTxs.value = true
  loadingStats.value = true
  try {
    const [tRes, sRes] = await Promise.allSettled([
      api.get('/me/coins'),
      api.get('/me/stats'),
    ])
    if (tRes.status === 'fulfilled') {
      const d = tRes.value.data
      txs.value = Array.isArray(d) ? d : (d?.items ?? d?.transactions ?? [])
    } else {
      txs.value = []
    }
    if (sRes.status === 'fulfilled') {
      stats.value = sRes.value.data ?? {}
    }
  } finally {
    loadingTxs.value = false
    loadingStats.value = false
  }
})
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
  border-radius: 6px;
}
.skeleton-sm { height: 28px; width: 60%; }
.profile__tx-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
}
.skeleton-tx-left { height: 36px; flex: 1; }
.skeleton-tx-right { height: 20px; width: 80px; }

.profile {
  max-width: 680px;
  margin: 0 auto;
  padding: 8px 0 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.profile__hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
  position: relative;
}
.profile__avatar {
  width: 60px; height: 60px; border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; flex-shrink: 0; letter-spacing: -1px;
}
.profile__hero-info { flex: 1; min-width: 0; }
.profile__name { font-size: 18px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.profile__email { font-size: 13px; color: #6b7280; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.profile__meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.profile__role { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; letter-spacing: .3px; }
.profile__role--admin { background: #fef9c3; color: #92400e; }
.profile__role--user  { background: #eff6ff; color: #2563eb; }
.profile__office { font-size: 11px; color: #6b7280; padding: 3px 8px; background: #f3f4f6; border-radius: 20px; }
.profile__logout {
  display: flex; align-items: center; gap: 6px; font-size: 13px; color: #9ca3af;
  background: none; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 7px 12px;
  cursor: pointer; transition: color .15s, border-color .15s, background .15s;
  white-space: nowrap; flex-shrink: 0;
}
.profile__logout:hover { color: #ef4444; border-color: #fca5a5; background: #fef2f2; }
.profile__balance {
  position: relative; border-radius: 16px; overflow: hidden;
  padding: 28px 28px 24px;
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
  color: white;
}
.profile__balance-bg {
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='28' fill='none' stroke='rgba(255,255,255,.06)' stroke-width='1'/%3E%3C/svg%3E") repeat;
  pointer-events: none;
}
.profile__balance-content { position: relative; }
.profile__balance-label { font-size: 12px; opacity: .7; text-transform: uppercase; letter-spacing: .8px; font-weight: 600; margin-bottom: 10px; }
.profile__balance-val { display: flex; align-items: baseline; gap: 10px; }
.profile__coin { font-size: 28px; line-height: 1; }
.profile__balance-num { font-size: 44px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
.profile__balance-currency { font-size: 16px; opacity: .7; align-self: flex-end; padding-bottom: 4px; }
.profile__balance-hint { font-size: 12px; opacity: .55; margin-top: 10px; }
.profile__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.profile__stat-card {
  background: white; border: 1px solid #e5e7eb; border-radius: 14px;
  padding: 18px 16px; display: flex; flex-direction: column; gap: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.profile__stat-icon { font-size: 22px; }
.profile__stat-val { font-size: 26px; font-weight: 800; color: #111827; font-variant-numeric: tabular-nums; min-height: 32px; display: flex; align-items: center; }
.profile__stat-label { font-size: 12px; color: #6b7280; }
.profile__actions { display: flex; gap: 10px; flex-wrap: wrap; }
.profile__action-btn {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  background: white; border: 1.5px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; font-weight: 500; color: #374151; cursor: pointer;
  transition: border-color .15s, background .15s, color .15s;
}
.profile__action-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.profile__action-btn--admin:hover { border-color: #f59e0b; color: #92400e; background: #fffbeb; }
.profile__action-icon { font-size: 16px; }
.profile__card { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.profile__card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.profile__card-title { font-size: 16px; font-weight: 700; color: #111827; }
.profile__tx-count { background: #eff6ff; color: #3b82f6; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
.profile__tx-list { display: flex; flex-direction: column; }
.profile__tx { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
.profile__tx:last-child { border-bottom: none; padding-bottom: 0; }
.profile__tx-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
.tx-plus  { background: #f0fdf4; color: #16a34a; }
.tx-minus { background: #fef2f2; color: #dc2626; }
.profile__tx-body { flex: 1; min-width: 0; }
.profile__tx-desc { font-size: 14px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.profile__tx-date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
.profile__tx-amount { font-size: 15px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.tx-amount-plus  { color: #16a34a; }
.tx-amount-minus { color: #dc2626; }
.profile__empty { text-align: center; padding: 32px 16px; color: #9ca3af; font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.profile__empty-icon { font-size: 40px; }
.profile__empty-hint { font-size: 12px; }
@media (max-width: 600px) {
  .profile__hero { flex-wrap: wrap; gap: 12px; }
  .profile__logout { order: -1; margin-left: auto; }
  .profile__balance-num { font-size: 34px; }
  .profile__stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .profile__stat-card { padding: 14px 12px; }
  .profile__stat-val { font-size: 22px; }
  .profile__card { padding: 16px; }
}
</style>
