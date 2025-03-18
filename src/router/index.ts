import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { createApp, defineAsyncComponent, defineComponent } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import SettingsView from '../views/SettingsView.vue';

const { loadingBar } = createDiscreteApi(['loadingBar']);

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/autoui',
    name: 'autoui',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AutoUIView.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/SettingsView.vue'),
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
]

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, next) {
    return {
      top: 0,
    };
  },
});

// 进入路由前，显示 loadingBar
router.beforeEach((to, from, next) => {
  loadingBar.start();
  next();
});

// 进入路由后，结束 loadingBar
router.afterEach(() => {
  loadingBar.finish();
});

export default router;
