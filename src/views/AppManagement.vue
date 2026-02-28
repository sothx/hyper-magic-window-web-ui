<script setup lang="tsx">
import { ref, reactive, watch, type CSSProperties, h, type Component, computed } from 'vue';
import { useAutoUIStore } from '@/stores/autoui';
import * as deviceApi from '@/apis/deviceApi';
import * as autouiApi from '@/apis/autouiApi';
import * as xmlFormat from '@/utils/xmlFormat';
import { useDeviceStore } from '@/stores/device';
import { useQQDoc } from '@/hooks/useQQDoc';
import $to from 'await-to-js';
import { exec, getPackagesInfo } from '@/utils/kernelsu/index.js';
import * as autoUIFun from '@/utils/autoUIFun';
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
	MagnifyingGlassIcon,
	CircleStackIcon,
} from '@heroicons/vue/24/outline';
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import { useRouter, useRoute } from 'vue-router';
import {
	Cog6ToothIcon,
	FunnelIcon as FunnelSolidIcon,
	EllipsisHorizontalCircleIcon,
	QuestionMarkCircleIcon,
	ChatBubbleLeftEllipsisIcon,
} from '@heroicons/vue/24/solid';
import { useLogsStore } from '@/stores/logs';
import { useAutoUI } from '@/hooks/useAutoUI';
import * as validateFun from '@/utils/validateFun';
import AutoUIAppDrawer from '@/components/AutoUIAppDrawer.vue';
import { findBase64InString, getAppLabelToPackageInfo, renderApplicationName } from '@/utils/common';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/format';
import pako from 'pako';
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
type AutoUIAppDrawerInstance = InstanceType<typeof AutoUIAppDrawer>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const columns = createColumns();
const deviceStore = useDeviceStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const autoUIStore = useAutoUIStore();
const QQDocHook = useQQDoc();
const importShareRuleLoading = ref(false);
const hotReloadLoading = ref(false);
const autoUI = useAutoUI();
const addAutoUIApp = ref<AutoUIAppDrawerInstance | null>(null);
const updateAutoUIApp = ref<AutoUIAppDrawerInstance | null>(null);
const router = useRouter();
const logsStore = useLogsStore();
const route = useRoute();
const shareRuleTextarea = ref('');

function renderIcon(icon: Component, size?: number) {
	return () => {
		return h(
			NIcon,
			size
				? {
						size,
					}
				: null,
			{
				default: () => h(icon),
			},
		);
	};
}

const reloadPage = async () => {
	await deviceStore.getAndroidApplicationPackageNameList();
	await autoUIStore.initDefault();
};

const filterHasBeenInstalledApp = () => {
	autoUIStore.filterInstalledApps = !autoUIStore.filterInstalledApps;
};

const hotReloadApplicationData = async () => {
	hotReloadLoading.value = true;
	await reloadPage();
	const [updateRuleErr, updateRuleRes] = await $to(deviceApi.updateRule('miui_auto_ui'));
	if (updateRuleErr) {
		modal.create({
			title: '热重载应用数据失败',
			type: 'error',
			preset: 'dialog',
			content: () => <p>热重载应用数据失败了QwQ，详情请查看错误日志~</p>,
			positiveText: '确定',
		});
		hotReloadLoading.value = false;
	}

	if (updateRuleRes) {
		modal.create({
			title: '热重载应用数据成功',
			type: 'success',
			preset: 'dialog',
			content: () => <p>好耶w，已经重新为你载入包括自定义规则在内的应用数据~</p>,
			positiveText: '确定',
		});
		hotReloadLoading.value = false;
	}
};

const importShareRule = async () => {
	shareRuleTextarea.value = '';
	const [, showShareRuleTextareaModalRes] = await $to(
		new Promise((resolve, reject) => {
			modal.create({
				title: '请粘贴分享口令',
				preset: 'dialog',
				style: 'min-width:500px; width:50%;',
				class: 'responsive-modal',
				content: () =>
					h(NInput, {
						type: 'textarea',
						value: shareRuleTextarea.value,
						'onUpdate:value': newValue => {
							shareRuleTextarea.value = newValue;
						},
						autosize: { minRows: 8, maxRows: 8 },
						placeholder: '在此处粘贴分享规则口令',
					}),
				positiveText: '确定提交',
				negativeText: '取消导入',
				onPositiveClick() {
					resolve('positiveClick');
				},
			});
		}),
	);
	if (showShareRuleTextareaModalRes) {
		importShareRuleLoading.value = true;
		const base64StringFromClipboard: string = shareRuleTextarea.value;
		const getBase64String = findBase64InString(base64StringFromClipboard);
		if (!getBase64String?.length) {
			modal.create({
				title: '导入分享规则失败',
				type: 'error',
				preset: 'dialog',
				content: () => (
					<p>
						导入分享规则失败了QwQ，解析{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							自定义规则
						</span>{' '}
						口令发生错误，无法正常解析。
					</p>
				),
				positiveText: '确定',
			});
			importShareRuleLoading.value = false;
			return;
		}
		console.log(getBase64String, 'getBase64String');
		try {
			const uint8Array: Uint8Array = base64ToArrayBuffer(getBase64String);
			const inflate = pako.inflate(uint8Array, {
				to: 'string',
			});
			const importRuleContent = JSON.parse(inflate);
			if (importRuleContent.type !== 'autoui') {
				modal.create({
					title: '导入分享规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => (
						<p>
							导入分享规则失败了QwQ，该{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								自定义规则
							</span>{' '}
							不适用于应用布局优化。
						</p>
					),
					positiveText: '确定',
				});
				importShareRuleLoading.value = false;
				return;
			}
			if (
				(importRuleContent.device === 'pad' && deviceStore.deviceType !== 'tablet') ||
				(importRuleContent.device === 'fold' && deviceStore.deviceType === 'tablet')
			) {
				modal.create({
					title: '导入分享规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>导入分享规则失败了QwQ，平板和折叠屏的适配规则不能混用哦~</p>,
					positiveText: '确定',
				});
				importShareRuleLoading.value = false;
				return;
			}
			autoUIStore.customConfigAutoUIList[importRuleContent.name] = importRuleContent.rules;
			autoUIStore.autoUISettingConfig[importRuleContent.name] = {
				name: importRuleContent.name,
				enable: true,
			};
			const [submitUpdateAutoUIAppErr, submitUpdateAutoUIAppRes] = await $to(
				autouiApi.updateAutoUIApp({
					customAutoUIListXML: xmlFormat.objectToXML(
						autoUIStore.customConfigAutoUIList,
						'package',
						undefined,
					),
					settingConfigXML: xmlFormat.objectToXML(
						autoUIStore.autoUISettingConfig,
						'setting',
						'setting_config',
					),
					reloadRuleAction: {
						name: importRuleContent.name,
						action: 'enable',
					},
				}),
			);
			if (submitUpdateAutoUIAppErr) {
				modal.create({
					title: '导入分享规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，导入失败了QwQ，详细错误请查看错误日志~</p>,
				});
				importShareRuleLoading.value = false;
			} else {
				autoUIStore.updateMergeRuleList();
				await reloadPage();
				importShareRuleLoading.value = false;
				modal.create({
					title: '导入分享规则成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>
							好耶w，{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(
									importRuleContent.name,
									deviceStore.installedAppPackageInfoMap[importRuleContent.name]?.appLabel ||
										autoUIStore.applicationName[importRuleContent.name],
								)}
							</span>{' '}
							的应用配置成功了OwO~如果应用更新后的规则不生效，可以尝试重启
							{deviceStore.deviceType === 'tablet' ? '平板' : '手机'}再做尝试~
						</p>
					),
					positiveText: '确定',
				});
			}
			// 解析成功，可以使用 data
		} catch (error) {
			console.log(error, 'error');
			// 解析失败，处理错误
			modal.create({
				title: '导入分享规则失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>解析分享规则失败了QwQ，请检查导入口令是否有误</p>,
				positiveText: '确定',
			});
			importShareRuleLoading.value = false;
		}
	}
};

const handleCustomRuleDropdown = async (
	key: string | number,
	option: DropdownOption,
	row: AutoUIMergeRuleItem,
	index: number,
) => {
	if (key === 'cleanCustomRule') {
		const cleanCustomModal = modal.create({
			title: '想清除自定义规则吗？',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					清除自定义规则后，你对{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					所做的所有自定义配置将丢失，如果该应用同时还存在{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						模块规则
					</span>{' '}
					，将会还原回模块自身的适配规则。确定要继续吗？
				</p>
			),
			positiveText: '确定清除',
			negativeText: '我再想想',
			onPositiveClick: async () => {
				cleanCustomModal.loading = true;
				if (autoUIStore.customConfigAutoUIList[row.name]) {
					delete autoUIStore.customConfigAutoUIList[row.name];
				}
				const [submitUpdateAutoUIAppErr, submitUpdateAutoUIAppRes] = await $to(
					autouiApi.updateAutoUIApp({
						customAutoUIListXML: xmlFormat.objectToXML(
							autoUIStore.customConfigAutoUIList,
							'package',
							undefined,
						),
						settingConfigXML: xmlFormat.objectToXML(
							autoUIStore.autoUISettingConfig,
							'setting',
							'setting_config',
						),
					}),
				);
				if (submitUpdateAutoUIAppErr) {
					modal.create({
						title: '清除自定义规则失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
					});
					cleanCustomModal.loading = false;
				} else {
					modal.create({
						title: '清除自定义规则成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，清除自定义规则成功了OwO~如果应用更新后的规则不生效，可以尝试重启
								{deviceStore.deviceType === 'tablet' ? '平板' : '手机'}再试试~
							</p>
						),
					});
					cleanCustomModal.loading = false;
					autoUIStore.updateMergeRuleList();
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
				...row.autoUIRule,
			},
			type: 'autoui',
			device: deviceStore.deviceType === 'tablet' ? 'pad' : 'fold',
			mode: row.settingMode,
		};
		console.log(shareContent, 'shareContent');
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
				`我分享了一个[应用布局优化]的自定义规则，可以前往[完美横屏应用计划 For Web UI]导入：\n${base64String}`,
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
				positiveText: '确定',
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
								应用布局优化- 从分享口令导入
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

const handleModuleRuleMode = (row: AutoUIMergeRuleItem, index: number) => {
	if (row.ruleMode === 'module') {
		modal.create({
			title: '模块规则说明',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					模块已对{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					配置了合适的适配规则，且不可被移除，仅有自定义规则可以被移除哦~
				</p>
			),
		});
	}
};

const handleSwitchAction = async (row: AutoUIMergeRuleItem, index: number, value: boolean) => {
	const switchCustomModal = modal.create({
		title: `想${value ? '开启' : '关闭'}该应用的应用布局优化吗？`,
		type: 'warning',
		preset: 'dialog',
		content: () => (
			<p>
				即将{value ? '开启' : '关闭'}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					{renderApplicationName(row.name, row.applicationName)}
				</span>{' '}
				的应用布局优化适配规则。确定要继续吗？
			</p>
		),
		positiveText: '确定',
		negativeText: '我再想想',
		onPositiveClick: async () => {
			switchCustomModal.loading = true;
			if (autoUIStore.autoUISettingConfig[row.name]) {
				autoUIStore.autoUISettingConfig[row.name].enable = value;
			} else {
				autoUIStore.autoUISettingConfig[row.name] = {
					name: row.name,
					enable: value,
				};
			}
			const [submitUpdateAutoUIAppErr, submitUpdateAutoUIAppRes] = await $to(
				autouiApi.updateAutoUIApp({
					customAutoUIListXML: xmlFormat.objectToXML(
						autoUIStore.customConfigAutoUIList,
						'package',
						undefined,
					),
					settingConfigXML: xmlFormat.objectToXML(
						autoUIStore.autoUISettingConfig,
						'setting',
						'setting_config',
					),
					reloadRuleAction: {
						name: row.name,
						action: value ? 'enable' : 'disable',
					},
				}),
			);
			if (submitUpdateAutoUIAppErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
				});
				switchCustomModal.loading = false;
			} else {
				modal.create({
					title: '操作成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>
							好耶w，操作成功了OwO~如果应用更新后的规则不生效，可以尝试重启
							{deviceStore.deviceType === 'tablet' ? '平板' : '手机'}再试试~
						</p>
					),
				});
				switchCustomModal.loading = false;
				autoUIStore.updateMergeRuleList();
			}
		},
	});
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

function createColumns(): DataTableColumns<AutoUIMergeRuleItem> {
	return [
		{
			title: '应用名称',
			width: 250,
			key: 'name',
			render(row, index) {
				const isInstalled = new Set(deviceStore.installedAndroidApplicationPackageNameList);

				return (
					<div>
						<div class='flex'>
							{isInstalled.has(row.name) && (
								<img
									class='mr-1 w-[28px] h-[28px] rounded-full object-cover'
									src={`ksu://icon/${row.name}`}
									onError={e => {
										(e.currentTarget as HTMLImageElement).style.display = 'none';
									}}
								/>
							)}
							{deviceStore.canUsePackageInfoApi && row.name && (
								<p class='mt-1'>{getAppLabelToPackageInfo(row.name)}</p>
							)}
							{!deviceStore.canUsePackageInfoApi && row.applicationName && (
								<p class='mt-1'>{row.applicationName}</p>
							)}
						</div>
						{row.name && (
							<p>
								<span>(</span>
								{row.name}
								<span>)</span>
							</p>
						)}
					</div>
				);
			},
		},
		{
			title: '应用类型',
			key: 'ruleMode',
			render(row, index) {
				const slots = {
					icon: row.ruleMode === 'custom' ? EllipsisHorizontalCircleIcon : QuestionMarkCircleIcon,
				};
				if (row.ruleMode === 'custom') {
					const rule = [
						{
							label: '分享自定义规则',
							key: 'shareCustomRule',
							icon: renderIcon(
								<svg class='icon' aria-hidden='true'>
									<use xlinkHref='#icon-fenxiang'></use>
								</svg>,
								20,
							),
						},
						{
							label: '清除自定义规则',
							key: 'cleanCustomRule',
							icon: renderIcon(
								<svg class='icon' aria-hidden='true'>
									<use xlinkHref='#icon-qingchu'></use>
								</svg>,
								20,
							),
						},
					];
					return (
						<n-dropdown
							onSelect={(key: string | number, option: DropdownOption) =>
								handleCustomRuleDropdown(key, option, row, index)
							}
							size='large'
							trigger='click'
							options={rule}>
							<n-button size='small' v-slots={slots} dashed type='info'>
								自定义规则
							</n-button>
						</n-dropdown>
					);
				}
				return (
					<n-button
						size='small'
						dashed
						type='error'
						v-slots={slots}
						onClick={() => handleModuleRuleMode(row, index)}>
						模块规则
					</n-button>
				);
			},
		},
		// {
		// 	title: '操作',
		// 	minWidth: 100,
		// 	key: 'setting',
		// 	render(row, index) {
		// 		const slots = {
		// 			checked: () => <span>开启</span>,
		// 			unchecked: () => <span>关闭</span>,
		// 		};
		// 		const isOpen = (inputRow: AutoUIMergeRuleItem) => {
		// 			if (inputRow.settingRule && inputRow.settingRule.hasOwnProperty('enable')) {
		// 				return inputRow.settingRule.enable;
		// 			} else if (inputRow.autoUIRule && inputRow.autoUIRule.hasOwnProperty('enable')) {
		// 				return inputRow.autoUIRule.enable;
		// 			} else {
		// 				return true;
		// 			}
		// 		};
		// 		return (
		// 			<n-switch
		// 				railStyle={railStyle}
		// 				onUpdateValue={(value: boolean) => handleSwitchAction(row, index, value)}
		// 				size='medium'
		// 				value={isOpen && isOpen(row)}
		// 				v-slots={slots}></n-switch>
		// 		);
		// 	},
		// },
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
						>应用管理增强</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					支持调整应用启用状态与权限管理能力，实现更灵活的应用控制，提升系统管理效率与使用体验。
				</p>
			</div>
		</div>
		<n-card size="small">
			<div class="flex flex-wrap">
				<n-button
					class="mb-3 mr-3"
					type="success"
					:loading="deviceStore.loading || autoUIStore.loading"
					@click="async () => {
						await exec(`echo '${JSON.stringify(deviceStore.installedAppPackageInfoList)}' > /data/adb/Hyper_MagicWindow/config/test.json`);
						console.log('已经完成写入')
					}">
					<template #icon>
						<n-icon>
							<ArrowPathIcon />
						</n-icon>
					</template>
					测试按钮
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="success"
					:loading="deviceStore.loading || autoUIStore.loading"
					@click="() => reloadPage()">
					<template #icon>
						<n-icon>
							<ArrowPathIcon />
						</n-icon>
					</template>
					刷新应用列表
				</n-button>
			</div>
			<n-input-group>
				<n-input
					size="large"
					clearable
					v-model:value="autoUIStore.searchKeyWord"
					ref="searchKeyWordInput"
					placeholder="搜索应用名称/应用包名"
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
							autoUIStore.searchKeyWord = '';
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
			:loading="deviceStore.loading || autoUIStore.loading"
			:columns="columns"
			class="mt-3"
			:data="autoUIStore.filterMergeRuleList"
			:pagination="pagination" />
	</main>
</template>
