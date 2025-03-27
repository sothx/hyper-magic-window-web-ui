
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
    path: '/appStore',
    name: 'appStore',
    component: () => import('../../views/AppStore.vue'),
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
]

export default routes