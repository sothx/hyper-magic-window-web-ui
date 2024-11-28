<script setup lang="tsx">
import { ref, reactive, watch, type CSSProperties, h, type Component, computed, onMounted } from 'vue';
import { useDotBlackListStore } from '@/stores/dotBlackList';
import { useGameBoosterStore } from '@/stores/gameBooster';
import * as deviceApi from '@/apis/deviceApi';
import * as dotBlackListApi from '@/apis/dotBlackListApi';
import { Cog6ToothIcon } from '@heroicons/vue/24/solid';
import { useAutoUIStore } from '@/stores/autoui';
import * as xmlFormat from '@/utils/xmlFormat';
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
import {
	ArrowPathIcon,
	FunnelIcon,
	PlusIcon,
	ShareIcon,
	TrashIcon,
	SquaresPlusIcon,
	XCircleIcon,
	WindowIcon,
	StopIcon,
	MagnifyingGlassIcon,
	CircleStackIcon,
} from '@heroicons/vue/24/outline';
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import { useRouter, useRoute } from 'vue-router';
import { FunnelIcon as FunnelSolidIcon } from '@heroicons/vue/24/solid';
import { useLogsStore } from '@/stores/logs';
import { useAutoUI } from '@/hooks/useAutoUI';
import * as validateFun from '@/utils/validateFun';
import DotBlackListAppDrawer from '@/components/DotBlackListAppDrawer.vue';
import { findBase64InString, renderApplicationName } from '@/utils/common';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/format';
import pako from 'pako';
import { useInstalledAppNames } from '@/hooks/useInstalledAppNames';
import type DotBlackListMergeItem from '@/types/DotBlackListMergeItem';
import type GameBoosterTableItem from '@/types/GameBoosterTableItem';
import { gameGravityOptions, gameRatioOptions } from '@/constant/gameBooster';
import { mapKeys } from 'lodash-es';
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
type DotBlackListAppDrawerInstance = InstanceType<typeof DotBlackListAppDrawer>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const columns = createColumns();
const deviceStore = useDeviceStore();
const autoUIStore = useAutoUIStore();
const installedAppNames = useInstalledAppNames();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const dotBlackListStore = useDotBlackListStore();
const gameBoosterStore = useGameBoosterStore();
const GAME_RATIO_OPTIONS = gameRatioOptions();
const GAME_RATIO_VALUE_MAP = mapKeys(GAME_RATIO_OPTIONS, item => item.value);
const GAME_GRAVITY_OPTIONS = gameGravityOptions();
const GAME_GRAVITY_VALUE_MAP = mapKeys(GAME_GRAVITY_OPTIONS, item => item.value);
const hotReloadLoading = ref(false);
const autoUI = useAutoUI();
const addDotBlackListApp = ref<DotBlackListAppDrawerInstance | null>(null);
const router = useRouter();
const logsStore = useLogsStore();
const route = useRoute();
const shareRuleTextarea = ref('');

function renderIcon(icon: Component) {
	return () => {
		return h(NIcon, null, {
			default: () => h(icon),
		});
	};
}

const handleDropdown = async (
	type: 'game_ratio' | 'game_gravity',
	key: string | number,
	option: DropdownOption,
	row: GameBoosterTableItem,
	index: number,
) => {};

const reloadPage = async () => {
	if (!deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					该功能尚处于测试阶段，预估最快2024-12-21后正式上线，可能存在较多不稳定性，需要有一定的玩机知识和问题解决能力，如需参与测试请通过做梦书的酷安动态获取新功能内测的激活口令！(动态内容就有，无需私信，新功能不同口令也不相同)
				</p>
			),
		});
		return;
	}
	if (!dotBlackListStore.systemDotBlackList.length || !dotBlackListStore.hasHTMLViewerCloudData) {
		modal.create({
			title: '获取云控失败',
			type: 'error',
			preset: 'dialog',
			content: () => (
				<div>
					<p>无法获取到HTML查看器的云控，请检查是否禁用云控或者清除HTML查看器的数据再重启平板尝试操作~</p>
					{deviceStore.currentRootManager !== 'Magisk' && (
						<p>
							部分{deviceStore.currentRootManager}版本内置的Web
							UI存在异常，如仍然无法正常获取云控数据库，请单独安装模块网盘内提供的KsuWebUI。
						</p>
					)}
				</div>
			),
		});
		return;
	}
	await deviceStore.getAndroidApplicationPackageNameList();
	await dotBlackListStore.initDefault();
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

const handleCustomRuleDropdown = async (
	key: string | number,
	option: DropdownOption,
	row: DotBlackListMergeItem,
	index: number,
) => {
	if (!deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					该功能尚处于测试阶段，预估最快2024-12-21后正式上线，可能存在较多不稳定性，需要有一定的玩机知识和问题解决能力，如需参与测试请通过做梦书的酷安动态获取新功能内测的激活口令！(动态内容就有，无需私信，新功能不同口令也不相同)
				</p>
			),
		});
		return;
	}
	if (!dotBlackListStore.systemDotBlackList.length || !dotBlackListStore.hasHTMLViewerCloudData) {
		modal.create({
			title: '获取云控失败',
			type: 'error',
			preset: 'dialog',
			content: () => (
				<div>
					<p>无法获取到HTML查看器的云控，请检查是否禁用云控或者清除HTML查看器的数据再重启平板尝试操作~</p>
					{deviceStore.currentRootManager !== 'Magisk' && (
						<p>
							部分{deviceStore.currentRootManager}版本内置的Web
							UI存在异常，如仍然无法正常获取云控数据库，请单独安装模块网盘内提供的KsuWebUI。
						</p>
					)}
				</div>
			),
		});
		return;
	}
	if (key === 'cleanCustomRule') {
		const cleanCustomModal = modal.create({
			title: '想清除自定义规则吗？',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					清除自定义规则后，将恢复{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					的窗口控制器显示效果。确定要继续吗？
				</p>
			),
			positiveText: '确定清除',
			negativeText: '我再想想',
			onPositiveClick: async () => {
				cleanCustomModal.loading = true;
				dotBlackListStore.customDotBlackList = dotBlackListStore.customDotBlackList.filter(
					item => item !== row.name,
				);
				dotBlackListStore.sourceDotBlackList = dotBlackListStore.sourceDotBlackList.map(item => {
					item.dataList = item.dataList.filter((item: string) => item !== row.name);
					return item;
				});
				const currentDotBlackList = dotBlackListStore.mergeDotBlackList.map(item => {
					return item.name;
				});
				const [submitCleanCustomRuleErr, submitCleanCustomRuleRes] = await $to(
					dotBlackListApi.updateDotBlackList({
						dotBlackList: currentDotBlackList,
						sourceDotBlackList: dotBlackListStore.sourceDotBlackList,
						customDotBlackList: dotBlackListStore.customDotBlackList,
					}),
				);
				if (submitCleanCustomRuleErr) {
					modal.create({
						title: '清除自定义规则失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>发生异常错误，清除失败了QwQ，详细错误请查看错误日志~</p>,
					});
					cleanCustomModal.loading = false;
				} else {
					cleanCustomModal.loading = false;
					modal.create({
						title: '清除自定义规则成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，清除自定义规则成功了OwO~实际生效还需要重启{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									系统界面
								</span>{' '}
								的作用域，确定要继续吗？
							</p>
						),
						positiveText: '确定重启作用域',
						negativeText: '稍后手动重启',
						onPositiveClick() {
							deviceApi
								.killAndroidSystemUI()
								.then(async res => {
									await reloadPage();
									modal.create({
										title: '重启作用域成功',
										type: 'success',
										preset: 'dialog',
										content: () => (
											<p>
												已经成功为你重启系统界面的作用域，请查看是否生效，如不生效请手动重启平板再查看效果~
											</p>
										),
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
					cleanCustomModal.loading = false;
					await reloadPage();
				}
			},
		});
	}
	if (key === 'shareCustomRule') {
		const shareContent = {
			name: row.name,
			cmpt: 1,
			rules: {
				name: row.name,
			},
			type: 'dot_black_list',
			device: deviceStore.deviceCharacteristics === 'tablet' ? 'pad' : 'fold',
		};
		const jsonString = JSON.stringify(shareContent);
		const deflate = pako.deflate(jsonString, {
			level: 9,
			memLevel: 9,
			windowBits: 15,
		});
		const compressedData = new Uint8Array(deflate);
		const base64String: string = arrayBufferToBase64(compressedData);
		const [writeClipboardErr] = await $to(
			navigator.clipboard.writeText(
				`我分享了一个[窗口控制器]的自定义规则，可以前往[完美横屏应用计划 For Web UI]导入：\n${base64String}`,
			),
		);
		if (writeClipboardErr) {
			modal.create({
				title: '复制分享口令失败',
				type: 'error',
				preset: 'dialog',
				content: () => (
					<p>
						复制{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							{renderApplicationName(row.name, row.applicationName)}
						</span>{' '}
						的分享口令失败了QwQ，可能由于没有读取/写入剪切板的权限或{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							自定义规则
						</span>{' '}
						长度过大。
					</p>
				),
				negativeText: '确定',
			});
			return;
		} else {
			modal.create({
				title: '复制分享口令成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							好耶w，复制{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(row.name, row.applicationName)}
							</span>{' '}
							分享口令成功了~
						</p>
						<p>
							如果没有复制成功，请确认是否给予了读取/写入剪切板的权限或{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								自定义规则
							</span>{' '}
							长度过大。
						</p>
						<p>
							分享口令导入入口位于{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								窗口控制器- 从分享口令导入
							</span>{' '}
							。
						</p>
					</div>
				),
				positiveText: '确定',
			});
		}
	}
};

const handleSystemRuleMode = (row: DotBlackListMergeItem, index: number) => {
	modal.create({
		title: '系统规则说明',
		type: 'warning',
		preset: 'dialog',
		content: () => (
			<p>
				系统已对{' '}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					{renderApplicationName(row.name, row.applicationName)}
				</span>{' '}
				配置了窗口控制器的隐藏，且不可被移除，仅有自定义规则可以被移除哦~
			</p>
		),
	});
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
					<n-button v-slots={slots} size='small' strong dashed type='info'>
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
					在这里可以快速管理有关游戏显示布局的配置
				</p>
			</div>
		</div>
		<n-card title="操作区" size="small">
			<div class="flex flex-wrap mb-3">
				<n-alert :show-icon="true" type="info">
					<p>请添加需要管理的游戏应用到游戏工具箱！</p>
					<p>Hyper OS 2.0+ 还需要安装修改版的手机/平板管家才会生效</p>
				</n-alert>
			</div>
			<div class="flex flex-wrap">
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
					v-model:value="dotBlackListStore.searchKeyWord"
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
							dotBlackListStore.searchKeyWord = '';
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
</template>
