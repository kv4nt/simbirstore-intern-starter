import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1'
})

// ── Token refresh lock ─────────────────────────────────────────────
let _refreshing = false
let _queue = []

function _processQueue(error, token) {
  _queue.forEach(p => error ? p.reject(error) : p.resolve(token))
  _queue = []
}

api.interceptors.request.use(config => config)

api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

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
