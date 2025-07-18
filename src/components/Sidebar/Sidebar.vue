<script setup lang="tsx">
import {
	computed,
	onBeforeUnmount,
	onMounted,
	reactive,
	ref,
	type FunctionalComponent,
	type HTMLAttributes,
	type VNodeProps,
} from 'vue';
import { RouterLink } from 'vue-router';
import { useGameBoosterStore } from '@/stores/gameBooster';
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue';
import {
	Bars3Icon,
	ChartPieIcon,
	Cog6ToothIcon,
	DeviceTabletIcon,
	DocumentDuplicateIcon,
	BanknotesIcon,
	Squares2X2Icon,
	CubeIcon,
	CubeTransparentIcon,
	ComputerDesktopIcon,
	SquaresPlusIcon,
	WindowIcon,
	BuildingStorefrontIcon,
	XMarkIcon,
	FireIcon,
	NewspaperIcon,
	Square2StackIcon,
	LifebuoyIcon,
	Square3Stack3DIcon,
	PaintBrushIcon,
} from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import { useGameMode } from '@/hooks/useGameMode';
import { useDeviceStore } from '@/stores/device';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import * as deviceApi from '@/apis/deviceApi';
import { useMIUIContentExtension } from '@/hooks/useMIUIContentExtension';
import { useSidebar } from '@/hooks/useSidebar';
import { useNavigation } from '@/hooks/useNavigation';
import type { JSX } from 'vue/jsx-runtime';
const route = useRoute();
const gameMode = useGameMode();
const deviceStore = useDeviceStore();
const gameBoosterStore = useGameBoosterStore();
const useSidebarHook = useSidebar();
const navigationHook = useNavigation();
const MIUIContentExtension = useMIUIContentExtension();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
export interface NavigationItem {
	name: string; // 导航项的名称
	routeName?: string; // Vue Router 中的路由名称
	href?: string; // 导航的链接地址
	icon?: FunctionalComponent | string | (() => JSX.Element); // 图标：Vue 组件、字符串路径或 JSX 函数
	isShow?: () => boolean | Promise<boolean> | Function; // 是否显示，支持同步、异步、或普通函数
	click?: () => Promise<void> | Function; // 点击事件，支持同步、异步、或普通函数
}
const teams = [
	{
		id: 1,
		name: '模块首页',
		href: '/embedded-webview?url=https://hyper-magic-window.sothx.com',
		initial: 'H',
		current: false,
	},
	{
		id: 2,
		name: '打赏',
		href: '/embedded-webview?url=https://hyper-magic-window.sothx.com/donation.html',
		initial: 'D',
		current: false,
	},
	// { id: 3, name: '感谢', href: '/embedded-webview?url=https://hyper-magic-window.sothx.com/thanks.html', initial: 'W', current: false },
	// {
	// 	id: 3,
	// 	name: '许可协议',
	// 	href: '/embedded-webview?url=https://hyper-magic-window.sothx.com/license-agreement.html',
	// 	initial: 'L',
	// 	current: false,
	// },
	// {
	//	id: 3,
	//	name: '问题合集',
	//	href: '/embedded-webview?url=https://hyper-magic-window.sothx.com/FAQ.html',
	//	initial: 'F',
	//	current: false,
	//},
];
const userNavigation = [
	{ name: '个人资料', href: '#' },
	{ name: '退出', href: '#' },
];

const sidebarOpen = ref(false);

const updateWindowWidth = () => {
	deviceStore.windowWidth = window.innerWidth;
};

// 组件挂载后，监听窗口变化
onMounted(() => {
	window.addEventListener('resize', updateWindowWidth);
});

// 组件卸载前，清除事件监听
onBeforeUnmount(() => {
	window.removeEventListener('resize', updateWindowWidth);
});
</script>
<template>
	<div>
		<TransitionRoot as="template" :show="sidebarOpen">
			<Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
				<TransitionChild
					as="template"
					enter="transition-opacity ease-linear duration-300"
					enter-from="opacity-0"
					enter-to="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leave-from="opacity-100"
					leave-to="opacity-0">
					<div class="fixed inset-0 bg-zinc-900/80" />
				</TransitionChild>

				<div class="fixed inset-0 flex">
					<TransitionChild
						as="template"
						enter="transition ease-in-out duration-300 transform"
						enter-from="-translate-x-full"
						enter-to="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leave-from="translate-x-0"
						leave-to="-translate-x-full">
						<DialogPanel
							:class="[
								'relative mr-16 flex w-full max-w-xs flex-1',
								deviceStore.isDarkMode ? 'bg-zinc-900' : 'bg-white',
							]">
							<TransitionChild
								as="template"
								enter="ease-in-out duration-300"
								enter-from="opacity-0"
								enter-to="opacity-100"
								leave="ease-in-out duration-300"
								leave-from="opacity-100"
								leave-to="opacity-0">
								<div class="absolute left-full top-0 flex w-16 justify-center pt-[calc(1.25rem+var(--window-inset-top,0rem))]">
									<button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
										<span class="sr-only">Close sidebar</span>
										<XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
									</button>
								</div>
							</TransitionChild>
							<div
								:class="[
									'flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4',
									deviceStore.isDarkMode ? 'bg-[#151515]' : 'bg-[#f6f6f6]',
								]">
								<div class="flex h-[calc(var(--window-inset-top,1.5rem)-1rem)] shrink-0 items-center"></div>
								<nav class="flex flex-1 flex-col">
									<ul role="list" class="flex flex-1 flex-col gap-y-7">
										<li>
											<ul role="list" class="-mx-2 space-y-1">
												<li v-for="item in navigationHook.sidebarList.value" :key="item.name">
													<component
														v-show="item.isShow ? item.isShow() : true"
														:is="item.href && item.routeName ? 'RouterLink' : 'a'"
														v-bind="
															item.href && item.routeName
																? { to: item.href }
																: { href: 'javascript:void(0)' }
														"
														@click="
															() => {
																sidebarOpen = false;
																item.click && item.click();
																deviceStore.lastVisitedPath = item.routeName;
															}
														"
														:class="[
															item.routeName === route.name
																? deviceStore.isDarkMode
																	? 'bg-[#232323] text-teal-400'
																	: 'bg-[#E8E8E8] text-teal-600'
																: deviceStore.isDarkMode
																	? 'text-gray-300 hover:bg-[#232323] hover:text-teal-400'
																	: 'text-gray-700 hover:bg-[#E8E8E8] hover:text-teal-600',
															'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
														]">
														<component
															:is="item.icon"
															:class="[
																item.routeName === route.name
																	? deviceStore.isDarkMode
																		? 'text-teal-400'
																		: 'text-teal-600'
																	: deviceStore.isDarkMode
																		? 'text-gray-500 group-hover:text-teal-400'
																		: 'text-gray-400 group-hover:text-teal-600',
																'h-6 w-6 shrink-0',
															]"
															aria-hidden="true" />
														{{ item.name }}
													</component>
												</li>
											</ul>
										</li>
										<li v-if="deviceStore.deviceType">
											<div
												class="text-xs font-semibold leading-6"
												:class="deviceStore.isDarkMode ? 'text-gray-500' : 'text-gray-400'"
												>快捷入口</div
											>
											<ul role="list" class="-mx-2 mt-2 space-y-1">
												<li v-for="team in teams" :key="team.name">
													<RouterLink
														:to="team.href"
														@click="() => {
															sidebarOpen = false;
															deviceStore.lastVisitedPath = undefined;
														}"
														:class="[
															team.href === route.fullPath
																? deviceStore.isDarkMode
																	? 'bg-[#232323] text-teal-400'
																	: 'bg-[#E8E8E8] text-teal-600'
																: deviceStore.isDarkMode
																	? 'text-gray-300 hover:bg-[#232323] hover:text-teal-400'
																	: 'text-gray-700 hover:bg-[#E8E8E8] hover:text-teal-600',
															'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
														]">
														<span
															:class="[
																team.href === route.fullPath
																	? deviceStore.isDarkMode
																		? 'border-teal-400 text-teal-400'
																		: 'border-teal-600 text-teal-600'
																	: deviceStore.isDarkMode
																		? 'border-gray-700 text-gray-500 group-hover:border-teal-400 group-hover:text-teal-400'
																		: 'border-gray-200 text-gray-400 group-hover:border-teal-600 group-hover:text-teal-600',
																'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium',
															]"
															>{{ team.initial }}</span
														>
														<span class="truncate">{{ team.name }}</span>
													</RouterLink>
												</li>
											</ul>
										</li>
										<li class="mt-auto">
											<RouterLink
												to="/settings"
												@click="() => {
													sidebarOpen = false;
													deviceStore.lastVisitedPath = 'settings';
												}"
												:class="[
													route.name === 'settings'
														? deviceStore.isDarkMode
															? 'bg-[#232323] text-teal-400'
															: 'bg-[#E8E8E8] text-teal-600'
														: deviceStore.isDarkMode
															? 'text-gray-300 hover:bg-[#232323] hover:text-teal-400'
															: 'text-gray-700 hover:bg-[#E8E8E8] hover:text-teal-600',
													'group-mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
												]">
												<svg class="icon h-6 w-6 shrink-0" aria-hidden="true">
													<use xlink:href="#icon-shezhi"></use>
												</svg>
												模块设置
											</RouterLink>
										</li>
									</ul>
								</nav>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</TransitionRoot>

		<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
			<div
				:class="[
					'flex grow flex-col gap-y-5 overflow-y-auto border-r',
					deviceStore.isDarkMode ? 'border-gray-700 bg-[#151515]' : 'border-gray-200 bg-[#f6f6f6]',
					'px-6 pb-4',
				]">
				<div class="flex h-2 shrink-0 items-center"></div>
				<nav class="flex flex-1 flex-col">
					<ul role="list" class="flex flex-1 flex-col gap-y-7">
						<li>
							<ul role="list" class="-mx-2 space-y-1">
								<li v-for="item in navigationHook.sidebarList.value" :key="item.name">
									<component
										:is="item.href && item.routeName ? 'RouterLink' : 'a'"
										v-if="item.isShow ? item.isShow() : true"
										v-bind="
											item.href && item.routeName
												? { to: item.href }
												: { href: 'javascript:void(0)' }
										"
										@click="
											() => {
												sidebarOpen = false;
												item.click && item.click();
												deviceStore.lastVisitedPath = item.routeName;
												console.log(deviceStore.lastVisitedPath,'deviceStore.lastVisitedPath')
											}
										"
										:class="[
											item.routeName === route.name
												? deviceStore.isDarkMode
													? 'bg-[#232323] text-teal-400'
													: 'bg-[#E8E8E8] text-teal-600'
												: deviceStore.isDarkMode
													? 'text-gray-300 hover:bg-[#232323] hover:text-teal-400'
													: 'text-gray-700 hover:bg-[#E8E8E8] hover:text-teal-600',
											'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
										]">
										<component
											:is="item.icon"
											:class="[
												item.routeName === route.name
													? deviceStore.isDarkMode
														? 'text-teal-400'
														: 'text-teal-600'
													: deviceStore.isDarkMode
														? 'text-gray-500 group-hover:text-teal-400'
														: 'text-gray-400 group-hover:text-teal-600',
												'h-6 w-6 shrink-0',
											]"
											aria-hidden="true" />
										{{ item.name }}
									</component>
								</li>
							</ul>
						</li>
						<li v-if="deviceStore.deviceType">
							<div
								class="text-xs font-semibold leading-6"
								:class="deviceStore.isDarkMode ? 'text-gray-500' : 'text-gray-400'"
								>快捷入口</div
							>
							<ul role="list" class="-mx-2 mt-2 space-y-1">
								<li v-for="team in teams" :key="team.name">
									<RouterLink
									    @click="() => {
											sidebarOpen = false;
											deviceStore.lastVisitedPath = undefined;
										}"
										:to="team.href"
										:class="[
											team.href === route.fullPath
												? deviceStore.isDarkMode
													? 'bg-[#232323] text-teal-400'
													: 'bg-[#E8E8E8] text-teal-600'
												: deviceStore.isDarkMode
													? 'text-gray-300 hover:bg-[#232323] hover:text-teal-400'
													: 'text-gray-700 hover:bg-[#E8E8E8] hover:text-teal-600',
											'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
										]">
										<span
											:class="[
												team.href === route.fullPath
													? deviceStore.isDarkMode
														? 'border-teal-400 text-teal-400'
														: 'border-teal-600 text-teal-600'
													: deviceStore.isDarkMode
														? 'border-gray-700 text-gray-500 group-hover:border-teal-400 group-hover:text-teal-400'
														: 'border-gray-200 text-gray-400 group-hover:border-teal-600 group-hover:text-teal-600',
												'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium',
											]"
											>{{ team.initial }}</span
										>
										<span class="truncate">{{ team.name }}</span>
									</RouterLink>
								</li>
							</ul>
						</li>
						<li class="mt-auto">
							<RouterLink
								to="/settings"
								@click="() => {
									sidebarOpen = false;
									deviceStore.lastVisitedPath = 'settings';
								}"
								:class="[
									route.name === 'settings'
										? deviceStore.isDarkMode
											? 'bg-[#232323] text-teal-400'
											: 'bg-[#E8E8E8] text-teal-600'
										: deviceStore.isDarkMode
											? 'text-gray-300 hover:bg-[#232323] hover:text-teal-400'
											: 'text-gray-700 hover:bg-[#E8E8E8] hover:text-teal-600',
									'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
								]">
								<svg class="icon h-6 w-6 shrink-0" aria-hidden="true">
									<use xlink:href="#icon-shezhi"></use>
								</svg>
								模块设置
							</RouterLink>
						</li>
					</ul>
				</nav>
			</div>
		</div>

		<div class="min-h-screen lg:pl-72">
			<div class="sticky top-0 z-40 backdrop-blur-md lg:mx-auto">
				<div
					class="flex h-[calc(3.5rem+var(--window-inset-top,0rem))] pt-[var(--window-inset-top,0rem)] items-center gap-x-4 border-b"
					:class="deviceStore.isDarkMode ? 'border-gray-700 bg-zinc-900/50' : 'border-gray-200 bg-white/50'">
					<button type="button" class="m-2.5 p-2.5 text-gray-700 lg:hidden" @click="sidebarOpen = true">
						<span class="sr-only">Open sidebar</span>
						<Bars3Icon class="h-6 w-6" aria-hidden="true" />
					</button>
					<div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
						<div class="flex h-full w-full content-center items-center justify-center">
							<h1
								:class="[
									deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-600',
									'text-lg font-bold',
									'text-h1 animated-bg bg-clip-text text-center text-transparent',
								]"
								style="
									background-image: linear-gradient(
										101.22deg,
										rgb(255, 182, 133) -18.32%,
										rgb(255, 111, 29) 7.01%,
										rgb(252, 181, 232) 41.59%,
										rgb(135, 148, 255) 70.98%,
										rgb(60, 112, 255) 91.35%,
										rgb(60, 112, 255) 110.17%
									);
								"
								>完美横屏应用计划</h1
							>
							<n-badge v-if="false" value="发现新版本" type="info" :offset="[40, -8]"> </n-badge>
						</div>
						<div class="flex items-center gap-x-4 lg:gap-x-6">
							<n-dropdown
								trigger="click"
								:options="useSidebarHook.MESSAGE_CENTER_OPTIONS"
								@select="useSidebarHook.handleMessageCenterOptionClick">
								<button type="button" class="m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
									<span class="sr-only">消息中心</span>
									<svg class="icon h-7 w-7" aria-hidden="true">
										<use xlink:href="#icon-xiaoxi"></use>
									</svg>
								</button>
							</n-dropdown>
						</div>
					</div>
				</div>
			</div>
			<main>
				<div class="mx-auto max-w-7xl px-4 pb-1 sm:px-6 lg:px-8">
					<!-- <n-alert class="mt-5" title="发现模块新版本" type="success">
					Leave it till tomorrow to unpack my case
					</n-alert> -->
					<slot></slot>
				</div>
			</main>
		</div>
	</div>
</template>
