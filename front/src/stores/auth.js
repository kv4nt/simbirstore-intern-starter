import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

const ACCESS_KEY  = 'ss_token'
const REFRESH_KEY = 'ss_refresh_token'

export const useAuthStore = defineStore('auth', () => {
  // ── state ──────────────────────────────────────────────────────────
  const token        = ref(sessionStorage.getItem(ACCESS_KEY)  ?? null)
  const refreshToken_ = ref(sessionStorage.getItem(REFRESH_KEY) ?? null)
  const user         = ref(null)

  // ── getters ────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')

  // ── helpers ────────────────────────────────────────────────────────
  function _applyTokens(access, refresh) {
    token.value = access
    if (access) {
      sessionStorage.setItem(ACCESS_KEY, access)
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`
    } else {
      sessionStorage.removeItem(ACCESS_KEY)
      delete api.defaults.headers.common['Authorization']
    }

    refreshToken_.value = refresh ?? null
    if (refresh) {
      sessionStorage.setItem(REFRESH_KEY, refresh)
    } else {
      sessionStorage.removeItem(REFRESH_KEY)
    }
  }

  function _normalizeUser(data) {
    return {
      ...data,
      coins: data.coins ?? data.coin_balance ?? 0,
    }
  }

  // ── actions ────────────────────────────────────────────────────────
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    _applyTokens(data.access_token, data.refresh_token)
    await fetchMe()
  }

  async function register(email, password, full_name, office) {
    const { data } = await api.post('/auth/register', { email, password, full_name, office })
    _applyTokens(data.access_token, data.refresh_token)
    await fetchMe()
  }

  async function refreshToken() {
    if (!refreshToken_.value) throw new Error('no_refresh_token')

    const { default: axios } = await import('axios')
    const { data } = await axios.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken_.value,
    })

    _applyTokens(data.access_token, data.refresh_token)
    return data.access_token
  }

  async function fetchMe() {
    try {
      const { data } = await api.get('/me')
      user.value = _normalizeUser(data)
    } catch {
      logout()
    }
  }

  async function init() {
    if (!token.value) return
    _applyTokens(token.value, refreshToken_.value)
    await fetchMe()
  }

  function logout() {
    user.value = null
    _applyTokens(null, null)
  }

  return {
    token, user, isLoggedIn, isAdmin,
    login, register, logout, init, fetchMe, refreshToken,
  }
})
