<template>
  <div style="min-height:100vh;background:var(--ss-bg);display:flex;align-items:center;justify-content:center;padding:24px">
    <div style="width:100%;max-width:400px">
      <!-- Logo -->
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

      <!-- Card -->
      <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,87,184,.1)">
        <h2 style="font-size:20px;font-weight:700;margin-bottom:4px">Регистрация</h2>
        <p style="font-size:13px;color:#4A607A;margin-bottom:24px">Создай корпоративный аккаунт</p>

        <n-form @submit.prevent="handleRegister">
          <n-form-item
            label="Имя и фамилия"
            :feedback="errors.full_name"
            :validation-status="errors.full_name ? 'error' : undefined"
          >
            <n-input
              v-model:value="form.full_name"
              placeholder="Иван Иванов"
              size="large"
              :disabled="loading"
              :status="errors.full_name ? 'error' : undefined"
              @input="errors.full_name = ''"
            />
          </n-form-item>

          <n-form-item
            label="Email"
            :feedback="errors.email"
            :validation-status="errors.email ? 'error' : undefined"
          >
            <n-input
              v-model:value="form.email"
              type="text"
              placeholder="ivan@simbirsoft.com"
              size="large"
              :disabled="loading"
              :status="errors.email ? 'error' : undefined"
              @input="errors.email = ''"
            />
          </n-form-item>

          <n-form-item label="Офис (необязательно)">
            <n-input
              v-model:value="form.office"
              placeholder="Казань"
              size="large"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item
            label="Пароль"
            :feedback="errors.password"
            :validation-status="errors.password ? 'error' : undefined"
          >
            <n-input
              v-model:value="form.password"
              type="password"
              placeholder="Минимум 6 символов"
              size="large"
              show-password-on="click"
              :disabled="loading"
              :status="errors.password ? 'error' : undefined"
              @input="errors.password = ''"
            />
          </n-form-item>

          <n-form-item
            label="Повторите пароль"
            :feedback="errors.confirm"
            :validation-status="errors.confirm ? 'error' : undefined"
          >
            <n-input
              v-model:value="form.confirm"
              type="password"
              placeholder="••••••••"
              size="large"
              show-password-on="click"
              :disabled="loading"
              :status="errors.confirm ? 'error' : undefined"
              @input="errors.confirm = ''"
              @keyup.enter="handleRegister"
            />
          </n-form-item>

          <n-alert v-if="serverError" type="error" style="margin-bottom:16px">{{ serverError }}</n-alert>

          <n-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleRegister"
          >
            Зарегистрироваться
          </n-button>
        </n-form>

        <div style="text-align:center;margin-top:16px">
          <n-button text @click="router.push('/login')" style="color:#4A607A;font-size:13px">
            Уже есть аккаунт? Войти →
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

const form = reactive({
  full_name: '',
  email: '',
  office: '',
  password: '',
  confirm: ''
})

const errors = reactive({
  full_name: '',
  email: '',
  password: '',
  confirm: ''
})

const serverError = ref('')
const loading = ref(false)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  errors.full_name = form.full_name.trim().length >= 2
    ? ''
    : 'Введите имя (минимум 2 символа)'

  if (!form.email.trim()) {
    errors.email = 'Введите email'
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Некорректный email — например, ivan@simbirsoft.com'
  } else {
    errors.email = ''
  }

  errors.password = form.password.length >= 6
    ? ''
    : 'Пароль должен быть не короче 6 символов'

  errors.confirm = form.password === form.confirm
    ? ''
    : 'Пароли не совпадают'

  return !Object.values(errors).some(Boolean)
}

// Парсим техническое сообщение от Gin-валидатора и возвращаем
// человекочитаемую ошибку + поле, которое нужно подсветить.
// Пример message: "Key: 'RegisterRequest.Email' Error:Field validation
//   for 'Email' failed on the 'email' tag"
function parseGinError(message = '') {
  const fieldMatch = message.match(/for '(\w+)' failed on the '(\w+)' tag/)
  if (!fieldMatch) return { field: null, text: 'Ошибка регистрации, попробуй снова' }

  const field = fieldMatch[1].toLowerCase()   // 'email', 'password', 'fullname'
  const tag   = fieldMatch[2]                  // 'email', 'min', 'required'

  const fieldLabels = {
    email:    'Email',
    password: 'Пароль',
    fullname: 'Имя и фамилия',
    full_name: 'Имя и фамилия',
  }

  const tagMessages = {
    email:    'Некорректный формат email',
    required: 'Обязательное поле',
    min:      'Слишком короткое значение',
  }

  const label = fieldLabels[field] ?? field
  const hint  = tagMessages[tag]  ?? `Ошибка валидации (${tag})`

  return { field, text: `${label}: ${hint}` }
}

async function handleRegister() {
  serverError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await auth.register(form.email, form.password, form.full_name, form.office || undefined)
    router.push('/')
  } catch (e) {
    const data = e?.response?.data
    const code = data?.error
    const message = data?.message ?? ''

    if (code === 'email_taken') {
      errors.email = 'Этот email уже зарегистрирован'
    } else if (code === 'bad_request' && message) {
      const { field, text } = parseGinError(message)
      // Подсвечиваем конкретное поле если смогли распарсить
      if (field === 'email')                      errors.email     = text
      else if (field === 'password')              errors.password  = text
      else if (field === 'fullname' || field === 'full_name') errors.full_name = text
      else                                        serverError.value = text
    } else {
      serverError.value = 'Ошибка регистрации, попробуй снова'
    }
  } finally {
    loading.value = false
  }
}
</script>
