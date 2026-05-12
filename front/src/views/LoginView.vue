<template>
  <div style="min-height:100vh;background:var(--ss-bg);display:flex;align-items:center;justify-content:center;padding:24px">
    <div style="width:100%;max-width:400px">
      <div style="text-align:center;margin-bottom:32px">
        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="width:40px;height:40px;border-radius:10px;overflow:hidden">
            <svg width="40" height="40" viewBox="0 0 22 22" fill="none">
              <rect width="22" height="22" rx="5" fill="#0057B8"/>
              <path d="M6 6.5C6 5.12 7.12 4 8.5 4H14a1 1 0 010 2H8.5A.5.5 0 008 6.5v2a.5.5 0 00.5.5h5A3.5 3.5 0 0117 12.5v3a2.5 2.5 0 01-2.5 2.5H8a1 1 0 010-2h6.5a.5.5 0 00.5-.5v-3a1.5 1.5 0 00-1.5-1.5h-5A2.5 2.5 0 016 9V6.5z" fill="white"/>
            </svg>
          </div>
          <span style="font-size:22px;font-weight:800;color:#0D1A2E">Simbir<span style="color:#F5A623">Store</span></span>
        </div>
        <div style="font-size:14px;color:#4A607A">Корпоративный магазин SimbirSoft</div>
      </div>

      <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,87,184,.1)">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:4px">Вход</h2>
        <p style="font-size:13px;color:#4A607A;margin-bottom:24px">Используй корпоративный аккаунт</p>

        <n-form @submit.prevent="handleLogin">
          <n-form-item label="Email" :feedback="errors.email" :validation-status="errors.email?'error':undefined">
            <n-input v-model:value="form.email" type="email" placeholder="ivan@simbirsoft.com" size="large" :disabled="loading" @keyup.enter="handleLogin" />
          </n-form-item>
          <n-form-item label="Пароль" :feedback="errors.password" :validation-status="errors.password?'error':undefined">
            <n-input v-model:value="form.password" type="password" placeholder="••••••••" size="large" show-password-on="click" :disabled="loading" @keyup.enter="handleLogin" />
          </n-form-item>

          <n-alert v-if="serverError" type="error" style="margin-bottom:16px">{{ serverError }}</n-alert>

          <n-button type="primary" size="large" block :loading="loading" @click="handleLogin">
            Войти
          </n-button>
        </n-form>

        <div style="text-align:center;margin-top:12px">
          <n-button text @click="router.push('/register')" style="color:#4A607A;font-size:13px">
            Нет аккаунта? Зарегистрироваться →
          </n-button>
        </div>
        <div style="text-align:center;margin-top:8px">
          <n-button text @click="router.push('/')" style="color:#4A607A;font-size:13px">
            ← Вернуться в каталог
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NAlert } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const serverError = ref('')
const loading = ref(false)

function validate() {
  errors.email = form.email ? '' : 'Введите email'
  errors.password = form.password ? '' : 'Введите пароль'
  return !errors.email && !errors.password
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  serverError.value = ''
  try {
    await auth.login(form.email, form.password)
    router.push('/')
  } catch (e) {
    serverError.value = e?.response?.data?.message || 'Неверный email или пароль'
  } finally {
    loading.value = false
  }
}
</script>
