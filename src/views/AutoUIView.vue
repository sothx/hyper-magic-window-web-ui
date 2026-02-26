<script setup lang="tsx">
import { ref, reactive, watch, type CSSProperties, h, type Component, computed } from 'vue';
import { useAutoUIStore } from '@/stores/autoui';
import * as deviceApi from '@/apis/deviceApi';
import * as autouiApi from '@/apis/autouiApi';
import * as xmlFormat from '@/utils/xmlFormat';
import { useDeviceStore } from '@/stores/device';
import { useQQDoc } from '@/hooks/useQQDoc';
import $to from 'await-to-js';
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
import { findBase64InString, renderApplicationName } from '@/utils/common';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/format';
import pako from 'pako';
import { useInstalledAppNames } from '@/hooks/useInstalledAppNames';
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
type AutoUIAppDrawerInstance = InstanceType<typeof AutoUIAppDrawer>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const columns = createColumns();
const deviceStore = useDeviceStore();
const installedAppNamesHook = useInstalledAppNames();
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

const getInstalledAppNameList = async () => {
	const [getListErr, getListRes] = await $to(installedAppNamesHook.getList());
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
			negativeText: '确定',
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
				negativeText: '确定',
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
					negativeText: '确定',
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
					negativeText: '确定',
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
									deviceStore.installedAppNameList[importRuleContent.name] ||
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
				negativeText: '确定',
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

const openAddDrawer = async () => {
	if (addAutoUIApp.value) {
		const [addAutoUiAppCancel, addAutoUiAppRes] = await $to(addAutoUIApp.value.openDrawer());
		if (addAutoUiAppCancel) {
			console.log('操作取消:', addAutoUiAppCancel);
		} else {
			autoUIStore.customConfigAutoUIList[addAutoUiAppRes.name] = {
				name: addAutoUiAppRes.name,
				enable: true,
				...(addAutoUiAppRes?.modePayload.skippedAppConfigChange ? { skippedAppConfigChange: true } : {}),
				...(addAutoUiAppRes?.modePayload.optimizeWebView ? { optimizeWebView: true } : {}),
				...(addAutoUiAppRes?.modePayload.hasOwnProperty('activityRule')
					? { activityRule: addAutoUiAppRes?.modePayload.activityRule }
					: {}),
				...(addAutoUiAppRes?.modePayload.hasOwnProperty('skippedActivityRule')
					? {
							skippedActivityRule: addAutoUiAppRes?.modePayload.skippedActivityRule,
						}
					: {}),
			};
			autoUIStore.autoUISettingConfig[addAutoUiAppRes.name] = {
				name: addAutoUiAppRes.name,
				enable: true,
			};
			const [submitAddAutoUIAppErr, submitAddAutoUIAppRes] = await $to(
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
						name: addAutoUiAppRes.name,
						action: 'enable',
					},
				}),
			);
			if (submitAddAutoUIAppErr) {
				modal.create({
					title: '应用添加失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，添加失败了QwQ，详细错误请查看错误日志~</p>,
				});
				addAutoUiAppRes.loadingCallback && addAutoUiAppRes.loadingCallback();
			} else {
				modal.create({
					title: '应用添加成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>
							好耶w，{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(
									addAutoUiAppRes.name,
									deviceStore.installedAppNameList[addAutoUiAppRes.name] ||
										autoUIStore.applicationName[addAutoUiAppRes.name],
								)}
							</span>{' '}
							的应用配置添加成功了OwO~应用布局优化仅在应用全屏场景下生效，如果应用添加后的规则不生效，可以尝试重启平再做尝试~
						</p>
					),
				});
				autoUIStore.updateMergeRuleList();
				addAutoUiAppRes.loadingCallback && addAutoUiAppRes.loadingCallback();
				addAutoUiAppRes.closeCallback && addAutoUiAppRes.closeCallback();
			}
		}
	}
};

const openUpdateDrawer = async (row: AutoUIMergeRuleItem, index: number) => {
	if (updateAutoUIApp && updateAutoUIApp.value) {
		const [updateAutoUiAppCancel, updateAutoUiAppRes] = await $to(updateAutoUIApp.value.openDrawer(row));
		if (updateAutoUiAppCancel) {
			console.log('操作取消:', updateAutoUiAppCancel);
		} else {
			if (autoUIStore.customConfigAutoUIList[row.name]) {
				autoUIStore.customConfigAutoUIList[row.name].enable = true;
				autoUIStore.customConfigAutoUIList[row.name].name = row.name;
				if (updateAutoUiAppRes?.modePayload.hasOwnProperty('activityRule')) {
					autoUIStore.customConfigAutoUIList[row.name].activityRule =
						updateAutoUiAppRes?.modePayload.activityRule;
				}
				if (updateAutoUiAppRes?.modePayload.hasOwnProperty('skippedActivityRule')) {
					autoUIStore.customConfigAutoUIList[row.name].skippedActivityRule =
						updateAutoUiAppRes?.modePayload.skippedActivityRule;
				}
				if (updateAutoUiAppRes?.modePayload.hasOwnProperty('optimizeWebView')) {
					autoUIStore.customConfigAutoUIList[row.name].optimizeWebView =
						updateAutoUiAppRes?.modePayload.optimizeWebView;
				}
				if (updateAutoUiAppRes?.modePayload.hasOwnProperty('skippedAppConfigChange')) {
					autoUIStore.customConfigAutoUIList[row.name].skippedAppConfigChange =
						updateAutoUiAppRes?.modePayload.skippedAppConfigChange;
				}
			} else {
				autoUIStore.customConfigAutoUIList[row.name] = {
					name: row.name,
					enable: true,
					...(updateAutoUiAppRes?.modePayload.skippedAppConfigChange ? { skippedAppConfigChange: true } : {}),
					...(updateAutoUiAppRes?.modePayload.optimizeWebView ? { optimizeWebView: true } : {}),
					...(updateAutoUiAppRes?.modePayload.hasOwnProperty('activityRule')
						? { activityRule: updateAutoUiAppRes?.modePayload.activityRule }
						: {}),
					...(updateAutoUiAppRes?.modePayload.hasOwnProperty('skippedActivityRule')
						? {
								skippedActivityRule: updateAutoUiAppRes?.modePayload.skippedActivityRule,
							}
						: {}),
				};
			}
			if (autoUIStore.autoUISettingConfig[row.name]) {
				autoUIStore.autoUISettingConfig[row.name].enable = true;
			} else {
				autoUIStore.autoUISettingConfig[row.name] = {
					name: row.name,
					enable: true,
				};
			}
			console.log('loadingCallback:', updateAutoUiAppRes.loadingCallback);
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
						action: 'enable',
					},
				}),
			);
			if (submitUpdateAutoUIAppErr) {
				modal.create({
					title: '应用更新失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，添加失败了QwQ，详细错误请查看错误日志~</p>,
				});
				updateAutoUiAppRes.loadingCallback && updateAutoUiAppRes.loadingCallback();
			} else {
				modal.create({
					title: '应用更新成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>
							好耶w，{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(row.name, row.applicationName)}
							</span>{' '}
							的应用配置更新成功了OwO~，如果应用更新后的规则不生效，可以尝试重启
							{deviceStore.deviceType === 'tablet' ? '平板' : '手机'}再做尝试~
						</p>
					),
				});
				autoUIStore.updateMergeRuleList();
				updateAutoUiAppRes.loadingCallback && updateAutoUiAppRes.loadingCallback();
				updateAutoUiAppRes.closeCallback && updateAutoUiAppRes.closeCallback();
			}
		}
	}
};

const modeMap = reactive({
	UNDEFINED_VIEW_POLICY: {
		type: 'default',
		color: '',
		name: '空白规则',
	},
	VIEW_POLICY_DEFAULT: {
		type: 'success',
		color: '',
		name: '全局缩放',
		onClick(row: AutoUIMergeRuleItem, index: number) {},
	},
	VIEW_POLICY_STRETCH: {
		type: 'info',
		color: '',
		name: '全局拉伸',
		onClick(row: AutoUIMergeRuleItem, index: number) {},
	},
	VIEW_POLICY_AUTO_COLUMNS: {
		type: 'warning',
		color: '',
		name: '全局栅格',
		onClick(row: AutoUIMergeRuleItem, index: number) {},
	},
	VIEW_POLICY_FLOAT: {
		type: 'error',
		color: '',
		name: '全局浮动',
		onClick(row: AutoUIMergeRuleItem, index: number) {},
	},
	CUSTOM_VIEW_POLICY: {
		type: '',
		color: '#8a2be2',
		name: '详细适配',
		onClick(row: AutoUIMergeRuleItem, index: number) {},
	},
});

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
				const imgSrc =
					deviceStore.canShowApplicationIcon && isInstalled.has(row.name) ? `ksu://icon/${row.name}` : '';
				return (
					<div>
						<div class='flex'>
							{deviceStore.canShowApplicationIcon && (
								<n-avatar object-fit='cover' round bordered class='mr-2' size='small' src={imgSrc}>
									{row.applicationName?.charAt(0)}
								</n-avatar>
							)}
							{row.applicationName && <p class='mt-1'>{row.applicationName}</p>}
							{deviceStore.canShowApplicationIcon && !row.applicationName && (
								<p class='mt-1'>{row.name}</p>
							)}
						</div>
						{row.name && (
							<p>
								<span>(</span>
								{row.name}
								<span>)</span>
							</p>
						)}
						{deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 3 && (
							<n-tag class='mr-1 mt-1' size='small' type='info'>
								1.0 规则
							</n-tag>
						)}
					</div>
				);
			},
		},
		{
			title: '规则来源',
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
		{
			title: 'WebView优化',
			minWidth: 110,
			key: 'isOptimizeWebView',
			render(row, index) {
				if (row.autoUIRule?.optimizeWebView) {
					return (
						<n-tag bordered={false} dashed type='success'>
							已启用
						</n-tag>
					);
				}
				return (
					<n-tag bordered={false} dashed type='info'>
						未启用
					</n-tag>
				);
			},
		},
		{
			title: '布局规则',
			key: 'settingMode',
			render(row, index) {
				const slots = {
					icon: Cog6ToothIcon,
				};
				return (
					<n-button
						size='small'
						strong
						dashed
						v-slots={slots}
						type={modeMap[row.settingMode].type}
						color={modeMap[row.settingMode].color}
						onClick={() => openUpdateDrawer(row, index)}>
						{modeMap[row.settingMode].name}
					</n-button>
				);
			},
		},
		{
			title: '操作',
			minWidth: 100,
			key: 'setting',
			render(row, index) {
				const slots = {
					checked: () => <span>开启</span>,
					unchecked: () => <span>关闭</span>,
				};
				const isOpen = (inputRow: AutoUIMergeRuleItem) => {
					if (inputRow.settingRule && inputRow.settingRule.hasOwnProperty('enable')) {
						return inputRow.settingRule.enable;
					} else if (inputRow.autoUIRule && inputRow.autoUIRule.hasOwnProperty('enable')) {
						return inputRow.autoUIRule.enable;
					} else {
						return true;
					}
				};
				return (
					<n-switch
						railStyle={railStyle}
						onUpdateValue={(value: boolean) => handleSwitchAction(row, index, value)}
						size='medium'
						value={isOpen && isOpen(row)}
						v-slots={slots}></n-switch>
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
						>应用布局优化</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					应用布局优化，自动优化应用内图文布局，提升视觉体验。
				</p>
			</div>
		</div>
		<n-tabs class="sm:px-0" type="card" animated>
			<n-tab-pane class="!py-0 !by-0" name="autoui1" tab="应用布局优化 1.0" display-directive="show">
				<n-card size="small">
					<div class="flex flex-wrap">
						<n-button
							class="mb-3 mr-3"
							type="info"
							:loading="deviceStore.loading || autoUIStore.loading"
							@click="openAddDrawer">
							<template #icon>
								<n-icon>
									<PlusIcon />
								</n-icon>
							</template>
							添加应用
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
						<n-button
							class="mb-3 mr-3"
							color="#8a2be2"
							:loading="deviceStore.loading || autoUIStore.loading"
							@click="() => hotReloadApplicationData()">
							<template #icon>
								<n-icon>
									<SquaresPlusIcon />
								</n-icon>
							</template>
							热重载应用数据
						</n-button>
						<n-button
							class="mb-3 mr-3"
							color="#69b2b6"
							:loading="deviceStore.loading || autoUIStore.loading || installedAppNamesHook.loading.value"
							@click="getInstalledAppNameList()">
							<template #icon>
								<n-icon>
									<CircleStackIcon />
								</n-icon>
							</template>
							获取已安装应用名称
						</n-button>
						<n-button
							class="mb-3 mr-3"
							type="warning"
							:loading="deviceStore.loading || autoUIStore.loading || importShareRuleLoading"
							@click="importShareRule()">
							<template #icon>
								<n-icon>
									<ShareIcon />
								</n-icon>
							</template>
							从分享口令导入
						</n-button>
					</div>
					<div class="flex flex-wrap">
						<n-button
							class="mb-3 mr-3"
							:type="autoUIStore.filterInstalledApps ? 'success' : 'info'"
							strong
							:loading="deviceStore.loading || autoUIStore.loading"
							secondary
							@click="filterHasBeenInstalledApp">
							<template #icon>
								<n-icon>
									<FunnelSolidIcon v-if="autoUIStore.filterInstalledApps" />
									<FunnelIcon v-else />
								</n-icon>
							</template>
							{{ autoUIStore.filterInstalledApps ? '已安装应用' : '全部应用' }}
						</n-button>
						<n-button
							class="mb-3 mr-3"
							type="warning"
							secondary
							:loading="deviceStore.loading || autoUIStore.loading"
							@click="() => deviceApi.openAllAppList()">
							<template #icon>
								<n-icon>
									<img src="/images/icons/all_app.png" />
								</n-icon>
							</template>
							应用抽屉
						</n-button>
						<!-- <n-button
					class="mb-3 mr-3"
					type="error"
					secondary
					:loading="deviceStore.loading || autoUIStore.loading"
					@click="() => deviceApi.openVoiceAssistant()">
					<template #icon>
						<n-icon>
							<img src="/images/icons/ai_icon.png" />
						</n-icon>
					</template>
					超级小爱
				</n-button> -->
						<n-button
							class="mb-3 mr-3"
							type="info"
							secondary
							:loading="deviceStore.loading || autoUIStore.loading"
							@click="QQDocHook.getModal()">
							<template #icon>
								<n-icon size="16">
									<img src="/images/icons/qq_doc.png" />
								</n-icon>
							</template>
							应用适配收集表
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
				<AutoUIAppDrawer ref="addAutoUIApp" type="add" title="添加应用" />
				<AutoUIAppDrawer ref="updateAutoUIApp" type="update" title="更新应用" />
			</n-tab-pane>
			<n-tab-pane class="!py-0 !by-0" name="autoui2" :disabled="deviceStore.androidTargetSdk < 35" :tab="`应用布局优化 2.0 ${(deviceStore.androidTargetSdk < 35)  ? `(不支持)` : ''}`" display-directive="show">
				<n-card size="small">
					<n-alert
						type="info"
						title="功能开发中，未上线"
						class="mb-3">
						应用布局优化2.0规则将直接内置进模块内，目前暂不支持展示或进行任何修改，应用布局优化1.0规则不受此影响。
					</n-alert>
					<div class="flex flex-wrap">
						<!--按钮区预留-->
					</div>
					<div class="flex flex-wrap">
						<n-button
							class="mb-3 mr-3"
							:type="autoUIStore.filterInstalledApps ? 'success' : 'info'"
							strong
							:loading="deviceStore.loading || autoUIStore.loading"
							secondary
							@click="filterHasBeenInstalledApp">
							<template #icon>
								<n-icon>
									<FunnelSolidIcon v-if="autoUIStore.filterInstalledApps" />
									<FunnelIcon v-else />
								</n-icon>
							</template>
							{{ autoUIStore.filterInstalledApps ? '已安装应用' : '全部应用' }}
						</n-button>
						<n-button
							class="mb-3 mr-3"
							type="warning"
							secondary
							:loading="deviceStore.loading || autoUIStore.loading"
							@click="() => deviceApi.openAllAppList()">
							<template #icon>
								<n-icon>
									<img src="/images/icons/all_app.png" />
								</n-icon>
							</template>
							应用抽屉
						</n-button>
						<!-- <n-button
					class="mb-3 mr-3"
					type="error"
					secondary
					:loading="deviceStore.loading || autoUIStore.loading"
					@click="() => deviceApi.openVoiceAssistant()">
					<template #icon>
						<n-icon>
							<img src="/images/icons/ai_icon.png" />
						</n-icon>
					</template>
					超级小爱
				</n-button> -->
						<n-button
							class="mb-3 mr-3"
							type="info"
							secondary
							:loading="deviceStore.loading || autoUIStore.loading"
							@click="QQDocHook.getModal()">
							<template #icon>
								<n-icon size="16">
									<img src="/images/icons/qq_doc.png" />
								</n-icon>
							</template>
							应用适配收集表
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
			</n-tab-pane>
		</n-tabs>
	</main>
</template>
