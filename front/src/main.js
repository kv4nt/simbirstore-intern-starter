import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Восстанавливаем сессию до первого рендера роутера
const auth = useAuthStore()
auth.init().finally(() => {
  app.mount('#app')
})
