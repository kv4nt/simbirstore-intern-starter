<template>
  <div class="ping-widget">
    <div class="ping-status" :class="statusClass">
      <span class="ping-dot" />
      <span class="ping-label">{{ statusText }}</span>
      <span v-if="latency !== null" class="ping-latency">{{ latency }} ms</span>
    </div>

    <n-button
      size="small"
      :loading="loading"
      :type="buttonType"
      @click="doPing"
    >
      {{ loading ? 'Проверяю...' : 'Ping backend' }}
    </n-button>

    <transition name="fade">
      <div v-if="errorMsg" class="ping-error">
        {{ errorMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NButton } from 'naive-ui'
import { pingBackend } from '@/api/ping'

// 'idle' | 'ok' | 'error'
const status  = ref('idle')
const loading = ref(false)
const latency = ref(null)
const errorMsg = ref('')

const statusText = computed(() => ({
  idle:  'Не проверялось',
  ok:    'Бэкенд доступен',
  error: 'Бэкенд недоступен',
}[status.value]))

const statusClass = computed(() => `ping-status--${status.value}`)

const buttonType = computed(() => ({
  idle:  'default',
  ok:    'success',
  error: 'error',
}[status.value]))

async function doPing() {
  loading.value  = true
  errorMsg.value = ''
  latency.value  = null

  const start = Date.now()
  try {
    await pingBackend()
    latency.value = Date.now() - start
    status.value  = 'ok'
  } catch (err) {
    status.value  = 'error'
    latency.value = null
    if (err.response) {
      errorMsg.value = `HTTP ${err.response.status}: ${err.response.data?.error ?? 'unknown'}`
    } else {
      errorMsg.value = 'Нет соединения с сервером (CORS или сеть)'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ping-widget {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
  font-size: 13px;
}

/* Статус-строка */
.ping-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

/* Светофор */
.ping-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.3s;
}
.ping-status--idle  .ping-dot { background: #b0b0b0; }
.ping-status--ok    .ping-dot { background: #18a058; box-shadow: 0 0 0 3px #18a05820; }
.ping-status--error .ping-dot { background: #d03050; box-shadow: 0 0 0 3px #d0305020; }

.ping-status--idle  .ping-label { color: #888; }
.ping-status--ok    .ping-label { color: #18a058; }
.ping-status--error .ping-label { color: #d03050; }

.ping-latency {
  color: #888;
  font-weight: 400;
}

/* Текст ошибки */
.ping-error {
  width: 100%;
  margin-top: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
  font-size: 12px;
  word-break: break-all;
}

/* Анимация появления ошибки */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to    { opacity: 0; }
</style>
