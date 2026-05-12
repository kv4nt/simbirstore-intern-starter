<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#0B6ED0',
    primaryColorHover: '#1a7de0',
    primaryColorPressed: '#0958b0',
    primaryColorSuppl: '#0B6ED0'
  }
}
</script>
