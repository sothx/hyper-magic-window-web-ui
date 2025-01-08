import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AutoUIView from '../views/AutoUIView.vue';
import SettingsView from '../views/SettingsView.vue';

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/autoui',
      name: 'autoui',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: AutoUIView,
    },
    {
      path: '/settings',
      name: 'settings',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: SettingsView,
    },
    {
      path: '/embedded-webview',
      name: 'embedded-webview',
      component: () => import('../views/EmbeddedWebView.vue'),
    },
    {
      path: '/appStore',
      name: 'appStore',
      component: () => import('../views/AppStore.vue'),
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('../views/LogView.vue'),
    },
    {
      path: '/game-booster',
      name: 'game-booster',
      component: () => import('../views/GameBooster.vue'),
    },
    {
      path: '/game-turbo-config',
      name: 'game-turbo-config',
      component: () => import('../views/GameTurboConfig.vue'),
    },
    {
      path: '/dot-black-list',
      name: 'dot-black-list',
      component: () => import('../views/DotBlackListView.vue'),
    },
    {
      path: '/magic-control',
      name: 'magic-control',
      component: () => import('../views/MagicControlView.vue'),
    },
    {
      path: '/eggs',
      name: 'eggs',
      component: () => import('../views/HappyNewYearEgg.vue'),
    },
  ],
  scrollBehavior(to, from, next) {
    return {
      top: 0,
    };
  },
});

export default router;
