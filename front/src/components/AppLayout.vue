<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-layout style="min-height:100vh;background:var(--ss-bg)">

        <!-- HEADER -->
        <header class="ss-header">
          <div class="ss-header-inner">
            <!-- Logo -->
            <div class="ss-logo" @click="router.push('/')">
              <div class="ss-logo-mark">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect width="22" height="22" rx="5" fill="#0057B8"/>
                  <path d="M6 6.5C6 5.12 7.12 4 8.5 4H14a1 1 0 010 2H8.5A.5.5 0 008 6.5v2a.5.5 0 00.5.5h5A3.5 3.5 0 0117 12.5v3a2.5 2.5 0 01-2.5 2.5H8a1 1 0 010-2h6.5a.5.5 0 00.5-.5v-3a1.5 1.5 0 00-1.5-1.5h-5A2.5 2.5 0 016 9V6.5z" fill="white"/>
                </svg>
              </div>
              <span class="ss-logo-name">Simbir<span style="color:#F5A623">Store</span></span>
            </div>

            <!-- Nav -->
            <nav class="ss-nav">
              <span class="ss-nav-link" :class="{active: $route.path==='/'}"
                @click="router.push('/')">&#1050;&#1072;&#1090;&#1072;&#1083;&#1086;&#1075;</span>
            </nav>

            <!-- Actions -->
            <div class="ss-actions">
              <template v-if="auth.isLoggedIn">
                <div class="ss-coin-badge" @click="router.push('/profile')" title="&#1052;&#1086;&#1081; &#1073;&#1072;&#1083;&#1072;&#1085;&#1089;">
                  <span>&#129689;</span>
                  <span>{{ auth.user?.coins?.toLocaleString('ru') ?? '&#8212;' }}</span>
                </div>
                <div class="ss-cart-btn" @click="router.push('/cart')" title="&#1050;&#1086;&#1088;&#1079;&#1080;&#1085;&#1072;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  <span v-if="cart.count" class="ss-cart-count">{{ cart.count }}</span>
                </div>
                <div class="ss-nav-link" @click="router.push('/orders')">&#1047;&#1072;&#1082;&#1072;&#1079;&#1099;</div>
                <div v-if="auth.user?.role==='admin'" class="ss-nav-link" @click="router.push('/admin')">&#1040;&#1076;&#1084;&#1080;&#1085;</div>

                <!-- &#1040;&#1074;&#1072;&#1090;&#1072;&#1088; + &#1080;&#1084;&#1103; + &#1074;&#1099;&#1093;&#1086;&#1076; -->
                <div class="ss-user-block" @click="router.push('/profile')" :title="auth.user?.name">
                  <div class="ss-avatar">{{ firstLetter }}</div>
                  <span class="ss-username">{{ displayName }}</span>
                </div>
                <button class="ss-logout-btn" @click.stop="handleLogout">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  &#1042;&#1099;&#1081;&#1090;&#1080;
                </button>
              </template>
              <template v-else>
                <n-button type="primary" size="small" @click="router.push('/login')">&#1042;&#1086;&#1081;&#1090;&#1080;</n-button>
              </template>
            </div>
          </div>
        </header>

        <!-- CONTENT -->
        <main style="max-width:1200px;margin:0 auto;padding:0 24px 48px">
          <slot />
        </main>

        <!-- FOOTER -->
        <footer class="ss-footer">
          <div class="ss-footer-inner">
            <div>
              <div class="ss-footer-logo">
                <div class="ss-logo-mark">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect width="22" height="22" rx="5" fill="#0057B8"/>
                    <path d="M6 6.5C6 5.12 7.12 4 8.5 4H14a1 1 0 010 2H8.5A.5.5 0 008 6.5v2a.5.5 0 00.5.5h5A3.5 3.5 0 0117 12.5v3a2.5 2.5 0 01-2.5 2.5H8a1 1 0 010-2h6.5a.5.5 0 00.5-.5v-3a1.5 1.5 0 00-1.5-1.5h-5A2.5 2.5 0 016 9V6.5z" fill="white"/>
                  </svg>
                </div>
                <span class="ss-footer-logo-text">Simbir<span style="color:#F5A623">Store</span></span>
              </div>
              <p style="margin-top:8px;font-size:13px;opacity:.7;max-width:260px">&#1042;&#1085;&#1091;&#1090;&#1088;&#1077;&#1085;&#1085;&#1080;&#1081; &#1082;&#1086;&#1088;&#1087;&#1086;&#1088;&#1072;&#1090;&#1080;&#1074;&#1085;&#1099;&#1081; &#1084;&#1072;&#1075;&#1072;&#1079;&#1080;&#1085; SimbirSoft. &#1058;&#1086;&#1083;&#1100;&#1082;&#1086; &#1076;&#1083;&#1103; &#1089;&#1086;&#1090;&#1088;&#1091;&#1076;&#1085;&#1080;&#1082;&#1086;&#1074;.</p>
            </div>
            <div>
              <div class="ss-footer-heading">&#1050;&#1072;&#1090;&#1072;&#1083;&#1086;&#1075;</div>
              <div class="ss-footer-links">
                <span class="ss-footer-link" @click="router.push('/category/clothes')">&#1054;&#1076;&#1077;&#1078;&#1076;&#1072;</span>
                <span class="ss-footer-link" @click="router.push('/category/accessories')">&#1040;&#1082;&#1089;&#1077;&#1089;&#1089;&#1091;&#1072;&#1088;&#1099;</span>
                <span class="ss-footer-link" @click="router.push('/category/dishes')">&#1055;&#1086;&#1089;&#1091;&#1076;&#1072;</span>
                <span class="ss-footer-link" @click="router.push('/category/stationery')">&#1050;&#1072;&#1085;&#1094;&#1077;&#1083;&#1103;&#1088;&#1080;&#1103;</span>
              </div>
            </div>
            <div>
              <div class="ss-footer-heading">&#1055;&#1086;&#1084;&#1086;&#1097;&#1100;</div>
              <div class="ss-footer-links">
                <span class="ss-footer-link" @click="router.push('/how-to-buy')">&#1050;&#1072;&#1082; &#1082;&#1091;&#1087;&#1080;&#1090;&#1100;</span>
                <span class="ss-footer-link" @click="router.push('/delivery')">&#1044;&#1086;&#1089;&#1090;&#1072;&#1074;&#1082;&#1072; &#1080; &#1074;&#1099;&#1076;&#1072;&#1095;&#1072;</span>
                <span class="ss-footer-link" @click="router.push('/returns')">&#1042;&#1086;&#1079;&#1074;&#1088;&#1072;&#1090; &#1090;&#1086;&#1074;&#1072;&#1088;&#1072;</span>
              </div>
            </div>
            <div>
              <div class="ss-footer-heading">&#1056;&#1072;&#1079;&#1088;&#1072;&#1073;&#1086;&#1090;&#1095;&#1080;&#1082;&#1072;&#1084;</div>
              <div class="ss-footer-links">
                <a
                  class="ss-footer-link"
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="color:inherit;text-decoration:none"
                >
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink:0">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    API &#1076;&#1086;&#1082;&#1091;&#1084;&#1077;&#1085;&#1090;&#1072;&#1094;&#1080;&#1103;
                  </span>
                </a>
                <a
                  class="ss-footer-link"
                  href="/api/docs/swagger.yaml"
                  download="swagger.yaml"
                  style="color:inherit;text-decoration:none"
                >
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="flex-shrink:0">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    &#1057;&#1082;&#1072;&#1095;&#1072;&#1090;&#1100; OpenAPI YAML
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div class="ss-footer-bottom">&#169; 2026 SimbirStore. &#1058;&#1086;&#1083;&#1100;&#1082;&#1086; &#1076;&#1083;&#1103; &#1089;&#1086;&#1090;&#1088;&#1091;&#1076;&#1085;&#1080;&#1082;&#1086;&#1074; SimbirSoft.</div>
        </footer>

      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NLayout, NButton, NConfigProvider, NMessageProvider } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

const firstLetter = computed(() => {
  const src = auth.user?.login ?? auth.user?.email ?? auth.user?.name ?? ''
  return src.charAt(0).toUpperCase() || '?'
})

const displayName = computed(() => {
  return auth.user?.login ?? auth.user?.email?.split('@')[0] ?? auth.user?.name ?? ''
})

function handleLogout() {
  auth.logout()
  router.push('/')
}

const themeOverrides = {
  common: {
    primaryColor: '#0057B8',
    primaryColorHover: '#0047A0',
    primaryColorPressed: '#003880',
    primaryColorSuppl: '#0057B8'
  }
}
</script>

<style>
:root {
  --ss-bg:       #F5F7FA;
  --ss-surface:  #FFFFFF;
  --ss-border:   #C4D2E4;
  --ss-text:     #0D1A2E;
  --ss-muted:    #4A607A;
  --ss-faint:    #8EA4BC;
  --ss-primary:  #0057B8;
  --ss-accent:   #F5A623;
  --ss-success:  #1A8C4E;
  --ss-error:    #C0392B;
  --ss-radius:   10px;
  --ss-shadow:   0 2px 12px rgba(0,87,184,.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', 'Segoe UI', sans-serif; background: var(--ss-bg); color: var(--ss-text); font-size: 15px; }

/* HEADER */
.ss-header {
  background: var(--ss-surface);
  border-bottom: 1px solid var(--ss-border);
  position: sticky; top: 0; z-index: 100;
  box-shadow: 0 2px 8px rgba(0,87,184,.06);
}
.ss-header-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 0 24px; height: 64px;
  display: flex; align-items: center; gap: 32px;
}
.ss-logo {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; text-decoration: none; flex-shrink: 0;
}
.ss-logo-mark { width: 32px; height: 32px; border-radius: 8px; overflow: hidden; }
.ss-logo-name { font-weight: 700; font-size: 18px; color: var(--ss-text); letter-spacing: -.3px; }
.ss-nav { display: flex; gap: 4px; flex: 1; }
.ss-nav-link {
  padding: 6px 14px; border-radius: 7px; cursor: pointer;
  font-size: 14px; font-weight: 500; color: var(--ss-muted);
  transition: background .15s, color .15s;
  user-select: none;
}
.ss-nav-link:hover, .ss-nav-link.active { background: #EFF4FF; color: var(--ss-primary); }
.ss-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.ss-coin-badge {
  display: flex; align-items: center; gap: 6px;
  background: #FFF3DB; border: 1px solid #F5C060;
  border-radius: 20px; padding: 5px 12px;
  font-size: 14px; font-weight: 600; color: #7A5000;
  cursor: pointer; transition: background .15s;
}
.ss-coin-badge:hover { background: #FFE9BB; }
.ss-cart-btn {
  position: relative; width: 40px; height: 40px;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--ss-muted); transition: background .15s, color .15s;
}
.ss-cart-btn:hover { background: #EFF4FF; color: var(--ss-primary); }
.ss-cart-count {
  position: absolute; top: 4px; right: 4px;
  background: var(--ss-primary); color: #fff;
  border-radius: 10px; font-size: 10px; font-weight: 700;
  min-width: 16px; height: 16px; display: flex;
  align-items: center; justify-content: center; padding: 0 4px;
}

.ss-user-block {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 10px 4px 4px; border-radius: 20px;
  border: 1.5px solid var(--ss-border); background: white;
  cursor: pointer; transition: border-color .15s, background .15s; flex-shrink: 0;
}
.ss-user-block:hover { border-color: var(--ss-primary); background: #EFF4FF; }
.ss-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--ss-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.ss-username {
  font-size: 13px; font-weight: 600; color: var(--ss-text);
  max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.ss-logout-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  border: 1.5px solid #FFD5D0; background: white;
  font-size: 13px; font-weight: 600; color: var(--ss-error);
  cursor: pointer; transition: background .15s, border-color .15s; flex-shrink: 0;
}
.ss-logout-btn:hover { background: #FFE5E2; border-color: #FFAAA2; }

/* CARDS */
.ss-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.ss-product-card {
  background: var(--ss-surface); border-radius: var(--ss-radius);
  border: 1px solid var(--ss-border); overflow: hidden;
  display: flex; flex-direction: column;
  transition: box-shadow .2s, transform .15s;
  cursor: pointer; position: relative;
}
.ss-product-card:hover { box-shadow: 0 8px 28px rgba(0,87,184,.13); transform: translateY(-2px); }
.ss-product-img {
  height: 160px; background: linear-gradient(135deg,#EFF4FF,#E0EDFF);
  display: flex; align-items: center; justify-content: center;
  font-size: 56px; flex-shrink: 0;
}
.ss-product-body { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
.ss-product-tag { font-size: 11px; font-weight: 600; color: var(--ss-primary); text-transform: uppercase; letter-spacing: .5px; }
.ss-product-name { font-size: 14px; font-weight: 600; color: var(--ss-text); line-height: 1.35; }
.ss-product-footer { margin-top: auto; padding-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ss-price { font-size: 16px; font-weight: 700; color: var(--ss-text); }
.ss-price-old { font-size: 12px; color: var(--ss-faint); text-decoration: line-through; }

.ss-add-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 0 12px; height: 34px; border-radius: 8px;
  background: var(--ss-primary); color: #fff; border: none;
  font-size: 13px; font-weight: 600; white-space: nowrap;
  cursor: pointer; transition: background .15s, transform .1s; flex-shrink: 0;
}
.ss-add-btn:hover  { background: #0047A0; }
.ss-add-btn:active { transform: scale(.96); }

.ss-badge {
  position: absolute; top: 10px; left: 10px;
  border-radius: 6px; font-size: 11px; font-weight: 700;
  padding: 3px 8px; pointer-events: none;
}
.ss-badge-new { background: var(--ss-primary); color: #fff; }
.ss-badge-hot { background: var(--ss-accent); color: #fff; }
.ss-badge-sale { background: var(--ss-error); color: #fff; }

/* HERO */
.ss-hero {
  background: linear-gradient(135deg, #0047A0 0%, #0057B8 50%, #1a7acc 100%);
  color: #fff; border-radius: 0 0 24px 24px;
  padding: 56px 48px 48px; margin: 0 -24px 40px; position: relative; overflow: hidden;
}
.ss-hero::before {
  content: ''; position: absolute; right: -60px; top: -60px;
  width: 340px; height: 340px; border-radius: 50%;
  background: rgba(255,255,255,.06);
}
.ss-hero-eyebrow { font-size: 13px; font-weight: 600; opacity: .8; margin-bottom: 12px; }
.ss-hero-title { font-size: clamp(28px,4vw,44px); font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
.ss-hero-title .accent { color: #F5A623; }
.ss-hero-desc { font-size: 16px; opacity: .85; max-width: 520px; line-height: 1.6; margin-bottom: 28px; }
.ss-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
.ss-btn-white {
  background: #fff; color: var(--ss-primary); border: none;
  padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;
  cursor: pointer; transition: background .15s;
}
.ss-btn-white:hover { background: #e8f0ff; }
.ss-btn-ghost {
  background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3);
  padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;
  cursor: pointer; transition: background .15s;
}
.ss-btn-ghost:hover { background: rgba(255,255,255,.25); }
.ss-hero-stats { display: flex; gap: 32px; flex-wrap: wrap; }
.ss-hero-stat-value { font-size: 22px; font-weight: 800; }
.ss-hero-stat-label { font-size: 12px; opacity: .7; margin-top: 2px; }

/* SECTION */
.ss-section { margin-bottom: 48px; }
.ss-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.ss-section-title { font-size: 20px; font-weight: 700; }
.ss-section-link { font-size: 14px; color: var(--ss-primary); cursor: pointer; }
.ss-section-link:hover { text-decoration: underline; }

/* CATEGORIES */
.ss-cat-grid { display: flex; gap: 12px; flex-wrap: wrap; }
.ss-cat-card {
  background: var(--ss-surface); border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius); padding: 16px 20px;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: box-shadow .15s, border-color .15s;
  font-size: 14px; font-weight: 600;
}
.ss-cat-card:hover, .ss-cat-card.active { border-color: var(--ss-primary); box-shadow: 0 0 0 3px rgba(0,87,184,.1); color: var(--ss-primary); }
.ss-cat-icon { font-size: 24px; }

/* PROMO BANNER */
.ss-promo {
  background: linear-gradient(135deg,#0047A0,#0057B8);
  color: #fff; border-radius: 16px; padding: 32px 40px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap; margin-bottom: 48px;
}
.ss-promo-eyebrow { font-size: 12px; font-weight: 700; opacity: .75; margin-bottom: 8px; }
.ss-promo-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; }
.ss-promo-desc { font-size: 14px; opacity: .85; max-width: 480px; }

/* CART TABLE */
.ss-cart-item {
  background: var(--ss-surface); border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius); padding: 16px 20px; margin-bottom: 12px;
  display: grid; grid-template-columns: 56px 1fr auto auto; gap: 16px; align-items: center;
}
.ss-cart-thumb {
  width: 56px; height: 56px; border-radius: 8px;
  background: linear-gradient(135deg,#EFF4FF,#E0EDFF);
  display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.ss-qty-ctrl { display: flex; align-items: center; gap: 8px; }
.ss-qty-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--ss-border);
  background: var(--ss-bg); cursor: pointer; font-size: 16px; display: flex;
  align-items: center; justify-content: center; transition: background .15s;
}
.ss-qty-btn:hover { background: #EFF4FF; border-color: var(--ss-primary); }

/* ORDER CARD */
.ss-order-card {
  background: var(--ss-surface); border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius); padding: 20px 24px; margin-bottom: 12px;
}
.ss-order-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }

/* STATUS BADGES */
.ss-status {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
}
.ss-status-pending { background: #FFF3DB; color: #7A5000; }
.ss-status-confirmed { background: #C8DEFF; color: #003880; }
.ss-status-ready { background: #D2F0E0; color: #0A4A26; }
.ss-status-done { background: #E4ECF7; color: #2A4A7A; }
.ss-status-cancelled { background: #FFE5E2; color: #7A1010; }

/* PROFILE */
.ss-profile-card {
  background: var(--ss-surface); border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius); padding: 24px;
}
.ss-balance-card {
  background: linear-gradient(135deg,#0047A0,#1a7acc);
  color: #fff; border-radius: var(--ss-radius); padding: 24px;
  text-align: center;
}
.ss-balance-value { font-size: 40px; font-weight: 800; margin: 8px 0; }

/* ADMIN TABLE */
.ss-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ss-table th { text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--ss-muted); border-bottom: 2px solid var(--ss-border); }
.ss-table td { padding: 12px 14px; border-bottom: 1px solid var(--ss-border); vertical-align: middle; }
.ss-table tr:last-child td { border-bottom: none; }
.ss-table tr:hover td { background: #F5F8FF; }

/* FOOTER */
.ss-footer { background: var(--ss-text); color: var(--ss-surface); margin-top: 64px; padding: 40px 0 0; }
.ss-footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px 32px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; }
.ss-footer-heading { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; opacity: .6; margin-bottom: 12px; }
.ss-footer-links { display: flex; flex-direction: column; gap: 8px; font-size: 14px; opacity: .8; }
.ss-footer-link { cursor: pointer; transition: opacity .15s; }
.ss-footer-link:hover { opacity: 1; text-decoration: underline; }
.ss-footer-bottom { border-top: 1px solid rgba(255,255,255,.1); padding: 16px 24px; max-width: 1200px; margin: 0 auto; font-size: 13px; opacity: .5; }

.ss-footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.ss-footer-logo-text { font-weight: 700; font-size: 18px; color: #ffffff; letter-spacing: -.3px; }

@media (max-width: 768px) {
  .ss-footer-inner { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .ss-footer-inner { grid-template-columns: 1fr; }
}
</style>
