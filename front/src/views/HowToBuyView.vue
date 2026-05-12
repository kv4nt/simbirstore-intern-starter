<template>
  <AppLayout>
    <div class="info-page">
      <div class="info-hero">
        <div class="info-hero-icon">🛒</div>
        <h1 class="info-hero-title">Как купить</h1>
        <p class="info-hero-desc">Покупки в SimbirStore — это просто. Выбирай, оплачивай монетами, забирай.</p>
      </div>

      <div class="info-steps">
        <div class="info-step" v-for="step in steps" :key="step.n">
          <div class="info-step-num">{{ step.n }}</div>
          <div class="info-step-body">
            <h3 class="info-step-title">{{ step.title }}</h3>
            <p class="info-step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <div class="info-cards">
        <div class="info-card" v-for="card in tips" :key="card.title">
          <div class="info-card-icon">{{ card.icon }}</div>
          <h4 class="info-card-title">{{ card.title }}</h4>
          <p class="info-card-text">{{ card.text }}</p>
        </div>
      </div>

      <div class="info-faq">
        <h2 class="info-section-title">Частые вопросы</h2>
        <div class="faq-item" v-for="q in faq" :key="q.q">
          <button class="faq-q" @click="q.open = !q.open">
            <span>{{ q.q }}</span>
            <svg :style="{transform: q.open ? 'rotate(180deg)' : 'none'}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="faq-a" v-if="q.open">{{ q.a }}</div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive } from 'vue'
import AppLayout from '@/components/AppLayout.vue'

const steps = [
  { n: '01', title: 'Выбери товар', desc: 'Перейди в каталог, выбери нужный товар и открой его карточку. Там ты найдёшь описание, фото и стоимость в монетах.' },
  { n: '02', title: 'Добавь в корзину', desc: 'Нажми кнопку «В корзину» на карточке товара. Ты можешь добавить сразу несколько товаров — они сохранятся до оформления.' },
  { n: '03', title: 'Оформи заказ', desc: 'Перейди в корзину, проверь состав и нажми «Оформить заказ». Система спишет монеты с твоего баланса автоматически.' },
  { n: '04', title: 'Жди подтверждения', desc: 'После оформления заказ попадёт к администратору на подтверждение. Обычно это занимает не более 1 рабочего дня.' },
  { n: '05', title: 'Забери товар', desc: 'Когда статус заказа изменится на «Готов к выдаче», ты получишь уведомление. Подойди на ресепшн и покажи номер заказа.' },
]

const tips = [
  { icon: '🪙', title: 'Откуда монеты?', text: 'Монеты начисляются за активность, достижения и по решению руководителя. Проверить баланс можно в профиле.' },
  { icon: '⏳', title: 'Срок действия', text: 'Начисленные монеты не сгорают — они хранятся на балансе бессрочно.' },
  { icon: '🔒', title: 'Безопасность', text: 'Все транзакции фиксируются в истории. Ты всегда можешь проверить, откуда пришли и куда ушли монеты.' },
]

const faq = reactive([
  { q: 'Можно ли отменить заказ?', a: 'Да, пока статус заказа «Ожидает подтверждения» — ты можешь отменить его самостоятельно в разделе «Заказы». После подтверждения — только через администратора.', open: false },
  { q: 'Что если монет не хватает?', a: 'Система не позволит оформить заказ при недостаточном балансе. Дождись следующего начисления или обратись к своему руководителю.', open: false },
  { q: 'Можно ли купить несколько одинаковых товаров?', a: 'Да, можно увеличить количество прямо в корзине с помощью кнопок + и −.', open: false },
  { q: 'Сколько времени займёт обработка заказа?', a: 'Обычно 1 рабочий день на подтверждение и ещё 1–2 дня на подготовку к выдаче.', open: false },
])
</script>

<style scoped>
.info-page { max-width: 800px; margin: 0 auto; padding: 40px 0 64px; }

.info-hero { text-align: center; margin-bottom: 48px; }
.info-hero-icon { font-size: 52px; margin-bottom: 16px; }
.info-hero-title { font-size: 32px; font-weight: 800; color: var(--ss-text); margin-bottom: 12px; }
.info-hero-desc { font-size: 16px; color: var(--ss-muted); max-width: 480px; margin: 0 auto; line-height: 1.6; }

.info-steps { display: flex; flex-direction: column; gap: 0; margin-bottom: 48px; }
.info-step {
  display: flex; gap: 20px; align-items: flex-start;
  padding: 24px 0;
  border-bottom: 1px solid var(--ss-border);
}
.info-step:first-child { border-top: 1px solid var(--ss-border); }
.info-step-num {
  flex-shrink: 0; width: 44px; height: 44px;
  border-radius: 50%; background: var(--ss-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; letter-spacing: -.5px;
  margin-top: 2px;
}
.info-step-title { font-size: 16px; font-weight: 700; color: var(--ss-text); margin-bottom: 6px; }
.info-step-desc { font-size: 14px; color: var(--ss-muted); line-height: 1.6; }

.info-cards {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  margin-bottom: 48px;
}
.info-card {
  background: var(--ss-surface); border: 1px solid var(--ss-border);
  border-radius: 12px; padding: 20px 18px;
}
.info-card-icon { font-size: 28px; margin-bottom: 10px; }
.info-card-title { font-size: 14px; font-weight: 700; color: var(--ss-text); margin-bottom: 6px; }
.info-card-text { font-size: 13px; color: var(--ss-muted); line-height: 1.55; }

.info-section-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.info-faq { display: flex; flex-direction: column; gap: 2px; }
.faq-item { border-radius: 10px; overflow: hidden; }
.faq-q {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; background: var(--ss-surface);
  border: 1px solid var(--ss-border); border-radius: 10px;
  font-size: 14px; font-weight: 600; color: var(--ss-text);
  cursor: pointer; text-align: left; gap: 12px;
  transition: background .15s;
}
.faq-q svg { flex-shrink: 0; color: var(--ss-muted); transition: transform .2s; }
.faq-q:hover { background: #EFF4FF; }
.faq-a {
  padding: 14px 18px 18px;
  background: var(--ss-surface);
  border: 1px solid var(--ss-border); border-top: none;
  border-radius: 0 0 10px 10px;
  font-size: 14px; color: var(--ss-muted); line-height: 1.6;
  margin-top: -4px;
}
@media (max-width: 600px) {
  .info-cards { grid-template-columns: 1fr; }
}
</style>
