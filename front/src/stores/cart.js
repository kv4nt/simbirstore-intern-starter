import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useCartStore = defineStore('cart', () => {
  const count = ref(0)

  function setCount(n) {
    count.value = n
  }

  // productId — обязательный, variantId — опциональный
  async function addItem(productId, variantId, quantity = 1) {
    await api.post('/cart/items', {
      product_id: productId,
      variant_id: variantId ?? undefined,
      quantity,
    })
    // обновляем счётчик корзины в хедере
    try {
      const { data } = await api.get('/cart')
      const items = Array.isArray(data) ? data : (data?.items ?? [])
      count.value = items.reduce((s, i) => s + i.quantity, 0)
    } catch { /* не критично */ }
  }

  return { count, setCount, addItem }
})
