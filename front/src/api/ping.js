import api from './index'

/**
 * GET /api/v1/ping
 * Возвращает { ok: true, message: "pong" } если бэкенд доступен.
 */
export function pingBackend() {
  return api.get('/ping')
}
