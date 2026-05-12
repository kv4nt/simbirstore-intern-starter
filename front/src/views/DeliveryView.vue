<template>
  <AppLayout>
    <div class="info-page">
      <div class="info-hero">
        <div class="info-hero-icon">📦</div>
        <h1 class="info-hero-title">Доставка и выдача</h1>
        <p class="info-hero-desc">Все заказы выдаются лично в офисах SimbirSoft. Никакой почты — только живой контакт.</p>
      </div>

      <div class="delivery-offices">
        <h2 class="info-section-title">Точки выдачи</h2>
        <div class="office-grid">
          <div class="office-card" v-for="o in offices" :key="o.city">
            <div class="office-city">{{ o.city }}</div>
            <div class="office-addr">📍 {{ o.address }}</div>
            <div class="office-hours">🕐 {{ o.hours }}</div>
            <div class="office-contact">👤 {{ o.contact }}</div>
          </div>
        </div>
      </div>

      <div class="delivery-how">
        <h2 class="info-section-title">Как происходит выдача</h2>
        <div class="info-steps">
          <div class="info-step" v-for="step in steps" :key="step.n">
            <div class="info-step-num">{{ step.n }}</div>
            <div class="info-step-body">
              <h3 class="info-step-title">{{ step.title }}</h3>
              <p class="info-step-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="info-alert">
        <div class="alert-icon">ℹ️</div>
        <div>
          <strong>Важно:</strong> при получении необходимо предъявить корпоративный бейдж или назвать номер заказа.
          Без подтверждения личности заказ не выдаётся.
        </div>
      </div>

      <div class="delivery-terms">
        <h2 class="info-section-title">Сроки</h2>
        <table class="terms-table">
          <thead>
            <tr>
              <th>Статус заказа</th>
              <th>Среднее время</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in terms" :key="row.status">
              <td><span class="ss-status" :class="row.cls">{{ row.status }}</span></td>
              <td class="td-time">{{ row.time }}</td>
              <td class="td-desc">{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'

const offices = [
  { city: 'Ульяновск (HQ)', address: 'ул. Федерации, 60', hours: 'Пн–Пт 09:00–18:00', contact: 'Ресепшн, 1 этаж' },
  { city: 'Казань', address: 'ул. Баумана, 44', hours: 'Пн–Пт 09:00–18:00', contact: 'Ресепшн, 2 этаж' },
  { city: 'Самара', address: 'ул. Молодогвардейская, 111', hours: 'Пн–Пт 10:00–17:00', contact: 'Ресепшн, 1 этаж' },
  { city: 'Санкт-Петербург', address: 'Невский пр-т, 30', hours: 'Пн–Пт 09:00–18:00', contact: 'Ресепшн, 3 этаж' },
]

const steps = [
  { n: '01', title: 'Оформи заказ', desc: 'Добавь товары в корзину и подтверди заказ. Монеты спишутся сразу.' },
  { n: '02', title: 'Дождись статуса «Готов к выдаче»', desc: 'Администратор подтвердит заказ и подготовит товар. Ты получишь уведомление в системе.' },
  { n: '03', title: 'Подойди на ресепшн', desc: 'Подойди в удобное время в рабочие часы. Возьми с собой бейдж или запомни номер заказа.' },
  { n: '04', title: 'Получи товар', desc: 'Сотрудник ресепшн выдаст товар и отметит заказ как выполненный в системе.' },
]

const terms = [
  { status: 'Ожидает', cls: 'ss-status-pending', time: 'до 1 дня', desc: 'Заказ создан, ждёт подтверждения от администратора' },
  { status: 'Подтверждён', cls: 'ss-status-confirmed', time: '1–2 дня', desc: 'Товар готовится к выдаче' },
  { status: 'Готов к выдаче', cls: 'ss-status-ready', time: 'бессрочно', desc: 'Можно забрать в любое рабочее время' },
  { status: 'Выдан', cls: 'ss-status-done', time: '—', desc: 'Заказ успешно получен' },
]
</script>

<style scoped>
.info-page { max-width: 800px; margin: 0 auto; padding: 40px 0 64px; }

.info-hero { text-align: center; margin-bottom: 48px; }
.info-hero-icon { font-size: 52px; margin-bottom: 16px; }
.info-hero-title { font-size: 32px; font-weight: 800; color: var(--ss-text); margin-bottom: 12px; }
.info-hero-desc { font-size: 16px; color: var(--ss-muted); max-width: 480px; margin: 0 auto; line-height: 1.6; }

.info-section-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; color: var(--ss-text); }

.office-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 48px;
}
.office-card {
  background: var(--ss-surface); border: 1px solid var(--ss-border);
  border-radius: 12px; padding: 20px;
}
.office-city { font-size: 15px; font-weight: 700; color: var(--ss-primary); margin-bottom: 10px; }
.office-addr, .office-hours, .office-contact { font-size: 13px; color: var(--ss-muted); margin-bottom: 5px; }

.delivery-how { margin-bottom: 32px; }
.info-steps { display: flex; flex-direction: column; }
.info-step { display: flex; gap: 20px; align-items: flex-start; padding: 22px 0; border-bottom: 1px solid var(--ss-border); }
.info-step:first-child { border-top: 1px solid var(--ss-border); }
.info-step-num { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; background: var(--ss-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; margin-top: 2px; }
.info-step-title { font-size: 15px; font-weight: 700; color: var(--ss-text); margin-bottom: 5px; }
.info-step-desc { font-size: 14px; color: var(--ss-muted); line-height: 1.6; }

.info-alert {
  display: flex; gap: 14px; align-items: flex-start;
  background: #EFF4FF; border: 1px solid #C8DEFF; border-radius: 10px;
  padding: 16px 18px; margin: 32px 0; font-size: 14px; color: var(--ss-text); line-height: 1.6;
}
.alert-icon { font-size: 20px; flex-shrink: 0; }

.delivery-terms { margin-top: 8px; }
.terms-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.terms-table th { text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--ss-muted); border-bottom: 2px solid var(--ss-border); }
.terms-table td { padding: 12px 14px; border-bottom: 1px solid var(--ss-border); vertical-align: middle; }
.terms-table tr:last-child td { border-bottom: none; }
.td-time { font-weight: 600; color: var(--ss-text); white-space: nowrap; }
.td-desc { color: var(--ss-muted); }
@media (max-width: 600px) {
  .office-grid { grid-template-columns: 1fr; }
}
</style>
