import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1'
})

// ── Token refresh lock ─────────────────────────────────────────────
// Флаг чтобы не посылать несколько /auth/refresh одновременно.
// Все запросы, упавшие с 401 пока идёт refresh, ждут его завершения.
let _refreshing = false
let _queue = [] // [{ resolve, reject }]

function _processQueue(error, token) {
  _queue.forEach(p => error ? p.reject(error) : p.resolve(token))
  _queue = []
}

// ── Request interceptor ────────────────────────────────────────────
// Токен уже проставлен в defaults.headers после login — ничего доп. делать не надо.
api.interceptors.request.use(config => config)

// ── Response interceptor ──────────────────────────────────────────
api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config

    // Пробуем refresh только один раз на запрос и только при 401
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    // Если refresh уже в процессе — ставим запрос в очередь
    if (_refreshing) {
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject })
      }).then(token => {
        original.headers['Authorization'] = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    _refreshing = true

    try {
      const { useAuthStore } = await import('@/stores/auth')
      const store = useAuthStore()
      const newToken = await store.refreshToken()

      _processQueue(null, newToken)
      original.headers['Authorization'] = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      _processQueue(refreshError, null)

      // refresh тоже упал (токен истёк) — выходим
      const { useAuthStore } = await import('@/stores/auth')
      useAuthStore().logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      _refreshing = false
    }
  }
)

export default api
