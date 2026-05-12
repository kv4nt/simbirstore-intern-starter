<template>
  <AppLayout>
    <div class="info-page">
      <div class="info-hero">
        <div class="info-hero-icon">↩️</div>
        <h1 class="info-hero-title">Возврат товара</h1>
        <p class="info-hero-desc">Если что-то пошло не так — мы разберёмся. Возврат монет возможен в ряде ситуаций.</p>
      </div>

      <div class="returns-cases">
        <h2 class="info-section-title">Когда возврат возможен</h2>
        <div class="case-grid">
          <div class="case-card case-yes" v-for="c in canReturn" :key="c">
            <span class="case-icon">✅</span>
            <span>{{ c }}</span>
          </div>
        </div>
      </div>

      <div class="returns-cases" style="margin-top: 32px">
        <h2 class="info-section-title">Когда возврат невозможен</h2>
        <div class="case-grid">
          <div class="case-card case-no" v-for="c in cantReturn" :key="c">
            <span class="case-icon">❌</span>
            <span>{{ c }}</span>
          </div>
        </div>
      </div>

      <div class="returns-steps">
        <h2 class="info-section-title" style="margin-top: 48px">Как оформить возврат</h2>
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

      <div class="info-alert info-alert-warn">
        <div class="alert-icon">⚠️</div>
        <div>
          <strong>Важно:</strong> возврат рассматривается индивидуально администратором.
          Монеты возвращаются на баланс в течение 2 рабочих дней после одобрения.
        </div>
      </div>

      <div class="returns-contact">
        <h2 class="info-section-title">Остались вопросы?</h2>
        <p class="returns-contact-text">
          Обратись к администратору SimbirStore — напрямую в Telegram или через корпоративный чат.
          Мы постараемся решить вопрос как можно быстрее.
        </p>
        <div class="contact-chips">
          <div class="contact-chip">💬 Корпоративный чат</div>
          <div class="contact-chip">📧 simbirstore@simbirsoft.com</div>
          <div class="contact-chip">📞 Внутренний: 1234</div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'

const canReturn = [
  'Товар не соответствует описанию на сайте',
  'Товар был повреждён при выдаче (брак)',
  'Была допущена ошибка при оформлении заказа',
  'Заказ находится в статусе «Ожидает» (до выдачи)',
  'Выдали не тот товар',
]

const cantReturn = [
  'Товар уже использовался',
  'Прошло более 7 дней с момента выдачи',
  'Нарушена упаковка без брака изделия',
  'Товар из категории «Личная гигиена»',
  'Персонализированный или именной товар',
]

const steps = [
  { n: '01', title: 'Свяжись с администратором', desc: 'Напиши в корпоративный чат или на почту simbirstore@simbirsoft.com. Укажи номер заказа и причину обращения.' },
  { n: '02', title: 'Верни товар на ресепшн', desc: 'Принеси товар в исходном состоянии на ресепшн того офиса, где получал. Захвати бейдж и номер заказа.' },
  { n: '03', title: 'Администратор рассмотрит заявку', desc: 'В течение 1–2 рабочих дней администратор проверит товар и примет решение.' },
  { n: '04', title: 'Монеты вернутся на баланс', desc: 'При положительном решении монеты зачисляются обратно. Ты получишь запись об этом в истории транзакций.' },
]
</script>

<style scoped>
.info-page { max-width: 800px; margin: 0 auto; padding: 40px 0 64px; }

.info-hero { text-align: center; margin-bottom: 48px; }
.info-hero-icon { font-size: 52px; margin-bottom: 16px; }
.info-hero-title { font-size: 32px; font-weight: 800; color: var(--ss-text); margin-bottom: 12px; }
.info-hero-desc { font-size: 16px; color: var(--ss-muted); max-width: 480px; margin: 0 auto; line-height: 1.6; }

.info-section-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; color: var(--ss-text); }

.case-grid { display: flex; flex-direction: column; gap: 8px; }
.case-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 13px 16px; border-radius: 9px;
  font-size: 14px; line-height: 1.5;
}
.case-yes { background: #D2F0E0; color: #0A4A26; border: 1px solid #A8DEC0; }
.case-no  { background: #FFE5E2; color: #7A1010; border: 1px solid #FFBDB7; }
.case-icon { flex-shrink: 0; font-size: 15px; margin-top: 1px; }

.info-steps { display: flex; flex-direction: column; }
.info-step { display: flex; gap: 20px; align-items: flex-start; padding: 22px 0; border-bottom: 1px solid var(--ss-border); }
.info-step:first-child { border-top: 1px solid var(--ss-border); }
.info-step-num { flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; background: var(--ss-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; margin-top: 2px; }
.info-step-title { font-size: 15px; font-weight: 700; color: var(--ss-text); margin-bottom: 5px; }
.info-step-desc { font-size: 14px; color: var(--ss-muted); line-height: 1.6; }

.info-alert {
  display: flex; gap: 14px; align-items: flex-start;
  border-radius: 10px; padding: 16px 18px;
  margin: 32px 0; font-size: 14px; line-height: 1.6;
}
.info-alert { background: #EFF4FF; border: 1px solid #C8DEFF; color: var(--ss-text); }
.info-alert-warn { background: #FFF3DB; border-color: #F5C060; color: #5A3800; }
.alert-icon { font-size: 20px; flex-shrink: 0; }

.returns-contact { margin-top: 8px; }
.returns-contact-text { font-size: 15px; color: var(--ss-muted); line-height: 1.6; margin-bottom: 20px; max-width: 600px; }
.contact-chips { display: flex; gap: 10px; flex-wrap: wrap; }
.contact-chip {
  background: var(--ss-surface); border: 1px solid var(--ss-border);
  border-radius: 20px; padding: 8px 16px;
  font-size: 13px; font-weight: 600; color: var(--ss-text);
}
</style>
