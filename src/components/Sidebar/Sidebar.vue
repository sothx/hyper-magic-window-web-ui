<script setup lang="tsx">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
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
} from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import { useGameMode } from '@/hooks/useGameMode';
import { useDeviceStore } from '@/stores/device';
import handlePromiseWithLogging from '@/utils/handlePromiseWithLogging';
import * as deviceApi from '@/apis/deviceApi';
import { useMIUIContentExtension } from '@/hooks/useMIUIContentExtension';
const route = useRoute();
const gameMode = useGameMode();
const deviceStore = useDeviceStore();
const gameBoosterStore = useGameBoosterStore();
const MIUIContentExtension = useMIUIContentExtension();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
const navigation = reactive([
	{ name: '应用横屏布局', routeName: 'home', href: '/', icon: Squares2X2Icon },
	{
		name: '应用布局优化',
		routeName: 'autoui',
		isShow() {
			return deviceStore.androidTargetSdk && deviceStore.androidTargetSdk >= 33;
		},
		href: '/autoui',
		icon: Square3Stack3DIcon,
	},
	{
		name: '游戏显示布局(内测)',
		routeName: 'game-booster',
		href: '/game-booster',
		isShow() {
			return (
				deviceStore.androidTargetSdk &&
				deviceStore.androidTargetSdk >= 32 &&
				gameBoosterStore.hasGameBoosterDataBase
			);
		},
		icon: LifebuoyIcon,
	},
	{
		name: '传送门',
		async click() {
			if (!MIUIContentExtension.isInstallMIUIContentExtension.value) {
				await navigator.clipboard.writeText(`https://caiyun.139.com/m/i?135CdxVMTx4nf`);
				modal.create({
					title: '无法打开传送门',
					type: 'error',
					preset: 'dialog',
					content: () => (
						<div>
							<p>未检测到系统存在传送门，请先通过模块修补传送门再进入~</p>
							<p>已经复制模块下载链接到剪切板了，请务必选择固化并修复传送门~</p>
						</div>
					),
					negativeText: '确定',
				});
				return;
			}
			modal.create({
				title: '确认打开传送门吗？',
				type: 'info',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							即将打开{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								传送门
							</span>{' '}
							管理界面，确定要继续吗？
						</p>
					</div>
				),
				positiveText: '确定打开',
				negativeText: '我再想想',
				onPositiveClick: async () => {
					deviceApi.openMIUIContentExtension().then(
						res => {
							modal.create({
								title: '已开启',
								type: 'success',
								preset: 'dialog',
								content: () => (
									<div>
										<p>好耶OwO~</p>
										<p>
											已经成功开启{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												传送门
											</span>{' '}
											的管理界面了~
										</p>
									</div>
								),
								positiveText: '确定',
							});
						},
						err => {
							modal.create({
								title: '无法打开传送门',
								type: 'error',
								preset: 'dialog',
								content: () => <p>出现异常，无法正常打开传送门QwQ，详细问题可浏览日志记录~</p>,
								negativeText: '确定',
							});
						},
					);
				},
			});
		},
		icon: NewspaperIcon,
	},
	{
		name: '窗口控制器',
		routeName: 'dot-black-list',
		href: '/dot-black-list',
		isShow() {
			return (
				deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER &&
				deviceStore.MIOSVersion &&
				deviceStore.MIOSVersion >= 1 &&
				deviceStore.deviceCharacteristics === 'tablet'
			);
		},
		icon: WindowIcon,
	},
	{ name: '日志记录', routeName: 'logs', href: '/logs', icon: DocumentDuplicateIcon },
	{
		name: '精选应用',
		routeName: 'appStore',
		href: '/appStore',
		icon: BuildingStorefrontIcon,
		isShow() {
			return false
			// return import.meta.env.MODE === 'development';
		},
	},
]);
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
	{
		id: 3,
		name: '许可协议',
		href: '/embedded-webview?url=https://hyper-magic-window.sothx.com/license-agreement.html',
		initial: 'L',
		current: false,
	},
	{
		id: 4,
		name: '问题合集',
		href: '/embedded-webview?url=https://hyper-magic-window.sothx.com/FAQ.html',
		initial: 'F',
		current: false,
	},
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
								<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
									<button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
										<span class="sr-only">Close sidebar</span>
										<XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
									</button>
								</div>
							</TransitionChild>
							<div
								:class="[
									'flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4',
									deviceStore.isDarkMode ? 'bg-zinc-900' : 'bg-white',
								]">
								<div class="flex h-2 shrink-0 items-center"></div>
								<nav class="flex flex-1 flex-col">
									<ul role="list" class="flex flex-1 flex-col gap-y-7">
										<li>
											<ul role="list" class="-mx-2 space-y-1">
												<li v-for="item in navigation" :key="item.name">
													<component
														v-show="item.isShow ? item.isShow() : true"
														:is="item.href && item.routeName ? 'RouterLink' : 'a'"
														v-bind="
															item.href && item.routeName
																? { to: item.href }
																: { href: 'javascript:void(0)' }
														"
														@click="item.click && item.click()"
														:class="[
															item.routeName === route.name
																? deviceStore.isDarkMode
																	? 'bg-gray-700 text-teal-400'
																	: 'bg-gray-50 text-teal-600'
																: deviceStore.isDarkMode
																	? 'text-gray-300 hover:bg-gray-700 hover:text-teal-400'
																	: 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
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
										<li>
											<div
												class="text-xs font-semibold leading-6"
												:class="deviceStore.isDarkMode ? 'text-gray-500' : 'text-gray-400'"
												>快捷入口</div
											>
											<ul role="list" class="-mx-2 mt-2 space-y-1">
												<li v-for="team in teams" :key="team.name">
													<RouterLink
														:to="team.href"
														:class="[
															team.href === route.fullPath
																? deviceStore.isDarkMode
																	? 'bg-gray-700 text-teal-400'
																	: 'bg-gray-50 text-teal-600'
																: deviceStore.isDarkMode
																	? 'text-gray-300 hover:bg-gray-700 hover:text-teal-400'
																	: 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
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
											<router-link
												to="/settings"
												:class="[
													route.name === 'settings'
														? deviceStore.isDarkMode
															? 'bg-gray-700 text-teal-400'
															: 'bg-gray-50 text-teal-600'
														: deviceStore.isDarkMode
															? 'text-gray-300 hover:bg-gray-700 hover:text-teal-400'
															: 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
													'group-mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
												]">
												<Cog6ToothIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
												模块设置
											</router-link>
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
					deviceStore.isDarkMode ? 'border-gray-700 bg-zinc-900' : 'border-gray-200 bg-white',
					'px-6 pb-4',
				]">
				<div class="flex h-10 shrink-0 items-center"></div>
				<nav class="flex flex-1 flex-col">
					<ul role="list" class="flex flex-1 flex-col gap-y-7">
						<li>
							<ul role="list" class="-mx-2 space-y-1">
								<li v-for="item in navigation" :key="item.name">
									<component
										:is="item.href && item.routeName ? 'RouterLink' : 'a'"
										v-if="item.isShow ? item.isShow() : true"
										v-bind="
											item.href && item.routeName
												? { to: item.href }
												: { href: 'javascript:void(0)' }
										"
										@click="item.click && item.click()"
										:class="[
											item.routeName === route.name
												? deviceStore.isDarkMode
													? 'bg-gray-700 text-teal-400'
													: 'bg-gray-50 text-teal-600'
												: deviceStore.isDarkMode
													? 'text-gray-300 hover:bg-gray-700 hover:text-teal-400'
													: 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
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
						<li>
							<div
								class="text-xs font-semibold leading-6"
								:class="deviceStore.isDarkMode ? 'text-gray-500' : 'text-gray-400'"
								>快捷入口</div
							>
							<ul role="list" class="-mx-2 mt-2 space-y-1">
								<li v-for="team in teams" :key="team.name">
									<RouterLink
										:to="team.href"
										:class="[
											team.href === route.fullPath
												? deviceStore.isDarkMode
													? 'bg-gray-700 text-teal-400'
													: 'bg-gray-50 text-teal-600'
												: deviceStore.isDarkMode
													? 'text-gray-300 hover:bg-gray-700 hover:text-teal-400'
													: 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
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
							<router-link
								to="/settings"
								:class="[
									route.name === 'settings'
										? deviceStore.isDarkMode
											? 'bg-gray-700 text-teal-400'
											: 'bg-gray-50 text-teal-600'
										: deviceStore.isDarkMode
											? 'text-gray-300 hover:bg-gray-700 hover:text-teal-400'
											: 'text-gray-700 hover:bg-gray-50 hover:text-teal-600',
									'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
								]">
								<Cog6ToothIcon class="h-6 w-6 shrink-0" aria-hidden="true" />
								模块设置
							</router-link>
						</li>
					</ul>
				</nav>
			</div>
		</div>

		<div class="min-h-screen lg:pl-72">
			<div class="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
				<div
					class="flex h-16 items-center gap-x-4 border-b"
					:class="deviceStore.isDarkMode ? 'border-gray-700 bg-zinc-900' : 'border-gray-200 bg-white'">
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
								]"
								>完美横屏应用计划 For Web UI</h1
							>
						</div>
						<div class="flex items-center gap-x-4 lg:gap-x-6"></div>
					</div>
				</div>
			</div>
			<main>
				<div class="mx-auto max-w-7xl px-4 pb-1 sm:px-6 lg:px-8">
					<slot></slot>
				</div>
			</main>
		</div>
	</div>
</template>
