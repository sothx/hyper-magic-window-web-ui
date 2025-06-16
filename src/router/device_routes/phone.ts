
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../../views/SystemExperienceEnhance.vue'),
  },
  {
    path: '/embedded-webview',
    name: 'embedded-webview',
    component: () => import('../../views/EmbeddedWebView.vue'),
  },
  {
    path: '/memory-health',
    name: 'memory-health',
    component: () => import('../../views/MemoryHealth.vue'),
  },
  {
    path: '/battery-health',
    name: 'battery-health',
    component: () => import('../../views/BatteryHealth.vue'),
  },
  {
    path: '/appStore',
    name: 'appStore',
    component: () => import('../../views/AppStoreView.vue'),
  },
  {
    path: '/display-mode-record',
    name: 'display-mode-record',
    component: () => import('../../views/DisplayModeRecordView.vue'),
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('../../views/LogView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../../views/SettingsView.vue'),
  },
  {
    path: '/update-msg',
    name: 'update-msg',
    component: () => import('../../views/UpdateMsg.vue'),
  },
  {
    path: '/:pathMatch(.*)*', // 捕获所有未匹配的路由
    component: () => import('../../views/NotFoundView.vue'),
  },
]

export default routes