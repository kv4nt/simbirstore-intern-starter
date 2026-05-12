import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Catalog',
    component: () => import('@/views/CatalogView.vue')
  },
  {
    path: '/category/:code',
    name: 'Category',
    component: () => import('@/views/CategoryView.vue')
  },
  {
    path: '/product/:id',
    name: 'Product',
    component: () => import('@/views/ProductView.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/CartView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/how-to-buy',
    name: 'HowToBuy',
    component: () => import('@/views/HowToBuyView.vue')
  },
  {
    path: '/delivery',
    name: 'Delivery',
    component: () => import('@/views/DeliveryView.vue')
  },
  {
    path: '/returns',
    name: 'Returns',
    component: () => import('@/views/ReturnsView.vue')
  },
  {
    path: '/api-docs',
    name: 'Docs',
    component: () => import('@/views/DocsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
  if (to.meta.guest      && auth.isLoggedIn)   return '/'
  if (to.meta.requiresAdmin && auth.user?.role !== 'admin') return '/'
})

export default router
