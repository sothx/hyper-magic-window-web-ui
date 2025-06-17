<script setup lang="tsx">
import { ref, reactive, watch, type CSSProperties, h, type Component, computed, onMounted, nextTick } from 'vue';
import { useGameBoosterStore } from '@/stores/gameBooster';
import * as deviceApi from '@/apis/deviceApi';
import {
	BoltIcon,
	Cog6ToothIcon,
	CpuChipIcon,
	ChatBubbleLeftEllipsisIcon,
	RocketLaunchIcon,
} from '@heroicons/vue/24/solid';
import * as gameBoosterApi from '@/apis/gameBoosterApi';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import { useRouter } from 'vue-router';
import {
	NButton,
	NIcon,
	NInput,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
	type DataTableColumns,
	type DropdownOption,
} from 'naive-ui';
import { ArrowPathIcon, XCircleIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { useGameMode } from '@/hooks/useGameMode';
import GameBoosterAppDrawer from '@/components/GameBoosterAppDrawer.vue';
import { useInstalledAppNames } from '@/hooks/useInstalledAppNames';
import type GameBoosterTableItem from '@/types/GameBoosterTableItem';
import { gameGravityOptions, gameRatioOptions } from '@/constant/gameBooster';
import { keyBy, mapKeys } from 'lodash-es';
import { useDisplayModeRecord, type DisplayModeItem } from '@/hooks/useDisplayModeRecord';
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
type GameBoosterAppDrawerInstance = InstanceType<typeof GameBoosterAppDrawer>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const columns = createColumns();
const deviceStore = useDeviceStore();
const router = useRouter();
const installedAppNames = useInstalledAppNames();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const gameBoosterStore = useGameBoosterStore();
const displayModeRecordHook = useDisplayModeRecord();
const GAME_RATIO_OPTIONS = gameRatioOptions();
const GAME_RATIO_VALUE_MAP = mapKeys(GAME_RATIO_OPTIONS, item => item.value);
const GAME_GRAVITY_OPTIONS = gameGravityOptions();
const GAME_GRAVITY_VALUE_MAP = mapKeys(GAME_GRAVITY_OPTIONS, item => item.value);
const gameModeHook = useGameMode();
const updateGameBoosterAppDrawer = ref<GameBoosterAppDrawerInstance | null>(null);

const openAddGame = async () => {
	const [vaildModuleVersionErr] = await $to(gameModeHook.vaildModuleVersion());
	if (vaildModuleVersionErr) {
		return;
	}
	if (!gameModeHook.isSupportGameMode.value) {
		modal.create({
			title: '未开启游戏显示布局',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>未开启游戏显示布局，请先前往模块设置进行开启~</p>,
			positiveText: '立即前往',
			negativeText: '取消',
			onPositiveClick() {
				router.push({ name: 'settings', hash: '#gameModeSettings' }).then(() => {
					const observer = new MutationObserver(() => {
						const target = document.getElementById('gameModeSettings');
						if (target) {
							setTimeout(() => {
								target.scrollIntoView({ behavior: 'smooth', block: 'center' });
								observer.disconnect(); // 停止观察
							},0)
						}
					});

					observer.observe(document.body, {
						childList: true,
						subtree: true,
					});
				});
			},
		});
		return;
	}
	const [openAddGameErr, openAddGameRes] = await $to(gameBoosterApi.openAddGame());
	if (openAddGameErr) {
		modal.create({
			title: '操作失败',
			type: 'error',
			preset: 'dialog',
			content: () => <p>发生异常错误，详细错误请查看日志~</p>,
		});
	}
};

const getAppDownload = async () => {
	modal.create({
		title: '获取手机/平板管家',
		type: 'info',
		preset: 'dialog',
		content: () => (
			<div>
				<p>
					如果规则无法生效，还需要安装修改版的手机/平板管家才会生效，安装后如出现崩溃等异常，推荐清空管家数据并重启设备再尝试~
				</p>
				<p>(Tips:需搭配核心破解并通过MT管理器安装)</p>
				<p>下载地址:https://caiyun.139.com/m/i?135Cm3g2XOMGs</p>
			</div>
		),
		positiveText: '复制下载链接到剪切板',
		negativeText: '取消',
		onPositiveClick: () => {
			navigator.clipboard.writeText(`https://caiyun.139.com/m/i?135Cm3g2XOMGs`);
			deviceApi.openChinaMobileMCloud()
		},
		onNegativeClick: () => {},
	});
};

const goToDisplayModeSettings = () => {
	router.push({ name: 'display-mode-record' });
};

const handleClickSetting = async (row: GameBoosterTableItem, index: number) => {
	const [vaildModuleVersionErr] = await $to(gameModeHook.vaildModuleVersion());
	if (vaildModuleVersionErr) {
		return;
	}
	if (!gameModeHook.isSupportGameMode.value) {
		modal.create({
			title: '未开启游戏显示布局',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>未开启游戏显示布局，请先前往模块设置进行开启~</p>,
			positiveText: '立即前往',
			negativeText: '取消',
			onPositiveClick() {
				router.push({ name: 'settings', hash: '#gameModeSettings' }).then(() => {
					const observer = new MutationObserver(() => {
						const target = document.getElementById('gameModeSettings');
						if (target) {
							setTimeout(() => {
								target.scrollIntoView({ behavior: 'smooth', block: 'center' });
								observer.disconnect(); // 停止观察
							},0)
						}
					});

					observer.observe(document.body, {
						childList: true,
						subtree: true,
					});
				});
			},
		});
		return;
	}
	if (updateGameBoosterAppDrawer.value) {
		const [updateGameBoosterAppDrawerCancel, updateGameBoosterAppDrawerRes] = await $to(
			updateGameBoosterAppDrawer.value.openDrawer({
				appName: row.app_name,
				packageName: row.package_name,
				gameRatio: row.game_ratio,
				gameGravity: row.game_gravity,
			}),
		);
		if (updateGameBoosterAppDrawerCancel) {
			console.log('操作取消:', updateGameBoosterAppDrawerCancel);
		} else {
			if (updateGameBoosterAppDrawerRes) {
				gameBoosterStore.loading = true;
				const [updateGameRatioSettingError, updateGameRatioSettingRes] = await $to(
					gameBoosterApi.updateGameRatioSetting(
						updateGameBoosterAppDrawerRes.packageName,
						updateGameBoosterAppDrawerRes.gameRatio,
						updateGameBoosterAppDrawerRes.gameGravity,
					),
				);
				if (updateGameRatioSettingError) {
					modal.create({
						title: '更新设置失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
					});
					gameBoosterStore.loading = false;
				}
				if (updateGameRatioSettingRes) {
					gameBoosterStore.loading = false;
					modal.create({
						title: '更新设置成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，已经成功配置{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{updateGameBoosterAppDrawerRes.appName}
								</span>{' '}
								的游戏显示布局了OwO~实际生效还需要重启{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{updateGameBoosterAppDrawerRes.appName}
								</span>{' '}
								和{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平板/手机管家
								</span>{' '}
								的作用域，确定要继续吗？
							</p>
						),
						positiveText: '确定重启作用域',
						negativeText: '稍后手动重启',
						onPositiveClick() {
							deviceApi
								.killGameBoosterApp(row.package_name)
								.then(async res => {
									await gameBoosterStore.initDefault();
									modal.create({
										title: '重启作用域成功',
										type: 'success',
										preset: 'dialog',
										content: () => <p>已经成功为你重启对应的作用域，请查看是否生效~</p>,
									});
								})
								.catch(err => {
									modal.create({
										title: '重启作用域失败',
										type: 'error',
										preset: 'dialog',
										content: () => (
											<p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>
										),
									});
								});
						},
					});
				}
			}
		}
	}
};

const reloadPage = async () => {
	await gameBoosterStore.initDefault();
};
const pagination = reactive({
	page: 1,
	pageSize: 10,
	simple: true,
	showSizePicker: true,
	onChange: (page: number) => {
		pagination.page = page;
	},
	onUpdatePageSize: (pageSize: number) => {
		pagination.pageSize = pageSize;
		pagination.page = 1;
	},
});


function createColumns(): DataTableColumns<GameBoosterTableItem> {
	return [
		{
			title: '游戏名称',
			minWidth: 250,
			key: 'name',
			render(row, index) {
				return (
					<div>
						{row.app_name && <p>{row.app_name}</p>}
						{row.app_name && (
							<p>
								<span class={{ hidden: !row.app_name }}>(</span>
								{row.package_name}
								<span class={{ hidden: !row.app_name }}>)</span>
							</p>
						)}
					</div>
				);
			},
		},
		{
			title: '游戏显示比例',
			minWidth: 150,
			key: 'game_ratio',
			render(row, index) {
				return GAME_RATIO_VALUE_MAP[row.game_ratio] && GAME_RATIO_VALUE_MAP[row.game_ratio].label ? (
					<n-tag
						dashed
						type={GAME_RATIO_VALUE_MAP[row.game_ratio].type}
						color={GAME_RATIO_VALUE_MAP[row.game_ratio].color}>
						{GAME_RATIO_VALUE_MAP[row.game_ratio].label}
					</n-tag>
				) : (
					<n-tag
						dashed
						color={{
							color: 'rgba(155, 89, 182, 0.1)',
							borderColor: 'rgba(155, 89, 182, 0.3)',
							textColor: '#9b59b6',
						}}>
						自定义
					</n-tag>
				);
			},
		},
		{
			title: '游戏显示位置',
			minWidth: 150,
			key: 'game_gravity',
			render(row, index) {
				return (
					<n-tag dashed type={GAME_GRAVITY_VALUE_MAP[row.game_gravity].color}>
						{GAME_GRAVITY_VALUE_MAP[row.game_gravity].label}
					</n-tag>
				);
			},
		},
		{
			title: '操作',
			minWidth: 100,
			key: 'setting',
			render(row, index) {
				const slots = {
					icon: Cog6ToothIcon,
				};
				return (
					<n-button
						onClick={() => handleClickSetting(row, index)}
						v-slots={slots}
						size='small'
						strong
						dashed
						type='info'>
						管理
					</n-button>
				);
			},
		},
	];
}
</script>
<template>
	<main class="autoui-view mb-10">
		<div class="mt-3">
			<div class="mb-3 px-4 sm:px-0">
				<h3 :class="`text-base font-semibold leading-7`">
					<span
						class="animated-bg bg-clip-text font-semibold text-transparent"
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
						>游戏显示布局</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					游戏显示布局，改变游戏比例，获得更大的游戏视野。
				</p>
			</div>
		</div>
		<n-card size="small">
			<div class="mb-3 flex flex-wrap">
				<n-alert v-if="deviceStore.deviceType === 'tablet'" :show-icon="true" type="info">
					<p>请添加需要管理的游戏应用到游戏工具箱，Hyper OS 2.0+还需要安装修改版的手机/平板管家才会生效。</p>
					<p>修改版的手机/平板管家支持Hyper OS 2.0/1.0和MIUI 14:</p>
					<p>[Tips:修改版手机管家支持在小米平板使用全局侧边栏]</p>
					<n-button strong secondary type="info" @click="() => getAppDownload()"
						>获取修改版手机/平板管家</n-button
					>
				</n-alert>
			</div>
			<div class="flex flex-wrap">
				<n-button
					class="mb-3 mr-3"
					type="info"
					:loading="deviceStore.loading || gameBoosterStore.loading"
					@click="() => openAddGame()">
					<template #icon>
						<n-icon>
							<PlusIcon />
						</n-icon>
					</template>
					添加游戏
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="success"
					:loading="deviceStore.loading || gameBoosterStore.loading"
					@click="() => reloadPage()">
					<template #icon>
						<n-icon>
							<ArrowPathIcon />
						</n-icon>
					</template>
					刷新游戏列表
				</n-button>
			</div>
			<div class="flex flex-wrap">
				<n-dropdown
					size="large"
					v-if="
						!deviceStore.MIOSVersion ||
						(deviceStore.MIOSVersion && deviceStore.MIOSVersion < 2) ||
						deviceStore.androidTargetSdk < 35
					"
					trigger="click"
					:options="[
						{ label: '打开性能监视器', key: 'start' },
						{ label: '关闭性能监视器', key: 'stop' },
					]"
					@select="(key: 'start' | 'stop') => { deviceApi.frameRateService(key) }">
					<n-button
						class="mb-3 mr-3"
						color="#8a2be2"
						type="info"
						secondary
						:loading="deviceStore.loading || gameBoosterStore.loading">
						<template #icon>
							<n-icon>
								<CpuChipIcon />
							</n-icon>
						</template>
						性能监视器
					</n-button>
				</n-dropdown>
				<n-dropdown
					size="large"
					trigger="click"
					:options="[
						{ label: '打开刷新率监视器', key: 'open' },
						{ label: '关闭刷新率监视器', key: 'close' },
					]"
					@select="(key: string) => { key === 'open' ? deviceApi.setFpsFrameService(true) : deviceApi.setFpsFrameService(false) }">
					<n-button
						class="mb-3 mr-3"
						type="info"
						secondary
						:loading="deviceStore.loading || gameBoosterStore.loading">
						<template #icon>
							<n-icon>
								<BoltIcon />
							</n-icon>
						</template>
						刷新率监视器
					</n-button>
				</n-dropdown>
				<n-button
					class="mb-3 mr-3"
					type="success"
					secondary
					:loading="deviceStore.loading || gameBoosterStore.loading"
					v-if="displayModeRecordHook.formatDisplayModeList.value.length"
					@click="goToDisplayModeSettings">
					<template #icon>
						<n-icon>
							<RocketLaunchIcon />
						</n-icon>
					</template>
					分辨率及刷新率
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="warning"
					secondary
					:loading="deviceStore.loading || gameBoosterStore.loading"
					@click="() => deviceApi.openAllAppList()">
					<template #icon>
						<n-icon>
							<img src="/images/icons/all_app.png" />
						</n-icon>
					</template>
					应用抽屉
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="error"
					secondary
					:loading="deviceStore.loading || gameBoosterStore.loading"
					@click="() => deviceApi.openVoiceAssistant()">
					<template #icon>
						<n-icon>
							<img src="/images/icons/ai_icon.png" />
						</n-icon>
					</template>
					超级小爱
				</n-button>
				<!-- <n-button
					class="mb-3 mr-3"
					type="info"
					secondary
					:loading="deviceStore.loading || gameBoosterStore.loading"
					@click="
						() =>
							router.push({
								name: 'embedded-webview',
								query: {
									url: 'https://dhfs.heytapimage.com/userfiles/cms/ai_search/index.html?__pf__=detail&__barStyle__=3_2&immersive=0&enter_id=browser&enterMod=viewcard#/',
								},
							})
					">
					<template #icon>
						<n-icon size="24">
							<svg class="icon" aria-hidden="true">
								<use xlink:href="#icon-deepseek"></use>
							</svg>
						</n-icon>
					</template>
					DeepSeek
				</n-button> -->
			</div>
			<n-input-group>
				<n-input
					size="large"
					clearable
					v-model:value="gameBoosterStore.searchKeyWord"
					ref="searchKeyWordInput"
					placeholder="搜索游戏名称/游戏包名"
					:style="{ width: '80%' }" />
				<n-button
					size="large"
					type="primary"
					@click="
						() => {
							searchKeyWordInput?.blur();
						}
					">
					<template #icon>
						<n-icon>
							<MagnifyingGlassIcon />
						</n-icon>
					</template>
					<span class="hidden sm:inline-block">搜索</span>
				</n-button>
				<n-button
					size="large"
					bordered
					@click="
						() => {
							gameBoosterStore.searchKeyWord = '';
						}
					">
					<template #icon>
						<n-icon>
							<XCircleIcon />
						</n-icon>
					</template>
					<span class="hidden sm:inline-block">清空</span>
				</n-button>
			</n-input-group>
		</n-card>
		<n-data-table
			size="small"
			:loading="deviceStore.loading || gameBoosterStore.loading"
			:columns="columns"
			class="mt-3"
			:data="gameBoosterStore.filterGameBoosterList"
			:pagination="pagination" />
	</main>
	<GameBoosterAppDrawer ref="updateGameBoosterAppDrawer" type="update" title="更新设置" />
</template>
