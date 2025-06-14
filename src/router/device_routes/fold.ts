import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
	{
		path: '/',
		redirect: '/home',
	},
	{
		path: '/home',
		name: 'home',
		component: () => import('../../views/EmbeddedActivityView.vue'),
	},
	{
		path: '/autoui',
		name: 'autoui',
		// route level code-splitting
		// this generates a separate chunk (About.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import('../../views/AutoUIView.vue'),
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
		path: '/system-experience-enhance',
		name: 'system-experience-enhance',
		// route level code-splitting
		// this generates a separate chunk (About.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
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
		path: '/game-booster',
		name: 'game-booster',
		component: () => import('../../views/GameBooster.vue'),
	},
	{
		path: '/game-turbo-config',
		name: 'game-turbo-config',
		component: () => import('../../views/GameTurboConfig.vue'),
	},
	{
		path: '/dot-black-list',
		name: 'dot-black-list',
		component: () => import('../../views/DotBlackListView.vue'),
	},
	{
		path: '/magic-control',
		name: 'magic-control',
		component: () => import('../../views/MagicControlView.vue'),
	},
	{
		path: '/display-mode-record',
		name: 'display-mode-record',
		component: () => import('../../views/DisplayModeRecordView.vue'),
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
];

export default routes;
