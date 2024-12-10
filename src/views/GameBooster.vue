<script setup lang="tsx">
import { ref, reactive, watch, type CSSProperties, h, type Component, computed, onMounted } from 'vue';
import { useGameBoosterStore } from '@/stores/gameBooster';
import * as deviceApi from '@/apis/deviceApi';
import { Cog6ToothIcon } from '@heroicons/vue/24/solid';
import * as gameBoosterApi from '@/apis/gameBoosterApi';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
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
import { mapKeys } from 'lodash-es';
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
type GameBoosterAppDrawerInstance = InstanceType<typeof GameBoosterAppDrawer>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const columns = createColumns();
const deviceStore = useDeviceStore();
const installedAppNames = useInstalledAppNames();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const gameBoosterStore = useGameBoosterStore();
const GAME_RATIO_OPTIONS = gameRatioOptions();
const GAME_RATIO_VALUE_MAP = mapKeys(GAME_RATIO_OPTIONS, item => item.value);
const GAME_GRAVITY_OPTIONS = gameGravityOptions();
const GAME_GRAVITY_VALUE_MAP = mapKeys(GAME_GRAVITY_OPTIONS, item => item.value);
const gameMode = useGameMode();
const updateGameBoosterAppDrawer = ref<GameBoosterAppDrawerInstance | null>(null);

const openAddGame = async () => {
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
				<p>如果规则无法生效，还需要安装修改版的手机/平板管家才会生效~</p>
				<p>下载地址:https://caiyun.139.com/m/i?135CeBMHACC6p</p>
			</div>
		),
		positiveText: '复制下载链接到剪切板',
		negativeText: '取消',
		onPositiveClick: () => {
			navigator.clipboard.writeText(`https://caiyun.139.com/m/i?135CeBMHACC6p`);
		},
		onNegativeClick: () => {},
	});
};

const handleClickSetting = async (row: GameBoosterTableItem, index: number) => {
	if (!deviceStore.ABTestInfo.GAME_BOOSTER_RADIO_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					该功能尚处于测试阶段，预估最快2024-12-29后正式上线，可能存在较多不稳定性，需要有一定的玩机知识和问题解决能力，如需参与测试请通过做梦书的酷安动态获取新功能内测的激活口令！(动态内容就有，无需私信，新功能不同口令也不相同)
				</p>
			),
		});
		return;
	}
	if (!gameMode.isSupportGameMode.value) {
		modal.create({
			title: '未开启游戏显示布局',
			type: 'error',
			preset: 'dialog',
			content: () => <p>未开启游戏显示布局，请先前往模块设置进行开启~</p>,
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

const getInstalledAppNameList = async () => {
	const [getListErr, getListRes] = await $to(installedAppNames.getList());
	if (getListErr) {
		modal.create({
			title: '获取失败',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>您的系统环境暂不支持该功能，获取失败~</p>,
			negativeText: '确定',
		});
	}
	if (getListRes) {
		modal.create({
			title: '获取成功',
			type: 'success',
			preset: 'dialog',
			content: () => <p>好耶OwO，已重新获取当前已安装的应用名称~</p>,
			negativeText: '确定',
		});
	}
};

const pagination = reactive({
	page: 1,
	pageSize: 10,
	showSizePicker: true,
	onChange: (page: number) => {
		pagination.page = page;
	},
	onUpdatePageSize: (pageSize: number) => {
		pagination.pageSize = pageSize;
		pagination.page = 1;
	},
});

const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
	const style: CSSProperties = {};
	if (checked) {
		style.background = '#2080f0';
		if (focused) {
			style.boxShadow = '0 0 0 2px #2080f040';
		}
	} else {
		style.background = '#d03050';
		if (focused) {
			style.boxShadow = '0 0 0 2px #d0305040';
		}
	}
	return style;
};

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
		<div class="mt-5">
			<div class="mb-5 px-4 sm:px-0">
				<h3
					:class="`text-base font-semibold leading-7 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
					游戏显示布局
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					游戏显示布局，让沉浸的画面在宽广中自由延展。
				</p>
			</div>
		</div>
		<n-card title="操作区" size="small">
			<div class="mb-3 flex flex-wrap">
				<n-alert v-if="deviceStore.deviceCharacteristics === 'tablet'" :show-icon="true" type="info">
					<p>请添加需要管理的游戏应用到游戏工具箱，Hyper OS 2.0+还需要安装修改版的手机/平板管家才会生效。</p>
					<p>修改版的手机/平板管家支持Hyper OS 2.0/1.0和MIUI 14:</p>
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
			<n-input-group>
				<n-input
					size="large"
					clearable
					v-model:value="gameBoosterStore.searchKeyWord"
					ref="searchKeyWordInput"
					placeholder="搜索游戏名称/游戏包名"
					autosize
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
					搜索
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
					清空
				</n-button>
			</n-input-group>
		</n-card>
		<n-data-table
			:loading="deviceStore.loading || gameBoosterStore.loading"
			:columns="columns"
			:data="gameBoosterStore.filterGameBoosterList"
			:pagination="pagination" />
	</main>
	<GameBoosterAppDrawer ref="updateGameBoosterAppDrawer" type="update" title="更新设置" />
</template>
