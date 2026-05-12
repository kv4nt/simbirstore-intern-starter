<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="pagination__btn"
      :disabled="current === 1"
      @click="$emit('change', current - 1)"
      aria-label="Назад"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>

    <template v-for="p in visiblePages" :key="p">
      <span v-if="p === '...'" class="pagination__dots">…</span>
      <button
        v-else
        class="pagination__btn"
        :class="{ active: p === current }"
        @click="$emit('change', p)"
      >{{ p }}</button>
    </template>

    <button
      class="pagination__btn"
      :disabled="current === totalPages"
      @click="$emit('change', current + 1)"
      aria-label="Вперёд"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>

    <span class="pagination__info">
      {{ (current - 1) * perPage + 1 }}–{{ Math.min(current * perPage, total) }}
      из {{ total }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current:  { type: Number, required: true },
  total:    { type: Number, required: true },
  perPage:  { type: Number, default: 10 },
})

defineEmits(['change'])

const totalPages = computed(() => Math.ceil(props.total / props.perPage))

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = props.current
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = []
  pages.push(1)
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) {
    pages.push(i)
  }
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})
</script>

<style scoped>
.pagination { display:flex; align-items:center; gap:4px; padding:4px 0; }
.pagination__btn { min-width:34px; height:34px; padding:0 8px; border-radius:8px; border:1.5px solid #e5e7eb; background:white; font-size:13px; font-weight:500; color:#374151; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:background .15s, border-color .15s, color .15s; line-height:1; }
.pagination__btn:hover:not(:disabled):not(.active) { border-color:#93c5fd; color:#3b82f6; background:#eff6ff; }
.pagination__btn.active { background:#3b82f6; border-color:#3b82f6; color:white; font-weight:700; cursor:default; }
.pagination__btn:disabled { opacity:.35; cursor:not-allowed; }
.pagination__dots { color:#9ca3af; font-size:14px; padding:0 2px; line-height:34px; user-select:none; }
.pagination__info { margin-left:8px; font-size:12px; color:#9ca3af; white-space:nowrap; }
@media (max-width:480px) { .pagination__info { display:none; } }
</style>
