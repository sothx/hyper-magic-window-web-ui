import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import { createApp, defineAsyncComponent, defineComponent } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import SettingsView from '../views/SettingsView.vue';

const { loadingBar } = createDiscreteApi(['loadingBar']);

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [],
	scrollBehavior(to, from, savedPosition) {
		if (to.hash) {
			return {
				el: to.hash,
				behavior: 'smooth',
				block: 'center',
			};
		}
		return savedPosition || { top: 0 };
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
