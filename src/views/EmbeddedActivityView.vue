<script setup lang="tsx">
import { ref, reactive, watch, type Component, h, onMounted, computed, watchEffect, nextTick } from 'vue';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
import $to from 'await-to-js';
import pako from 'pako';
import ErrorModal from '@/components/ErrorModal.vue';
import { useEmbedded } from '@/hooks/useEmbedded';
import EmbeddedAppDrawer from '@/components/EmbeddedAppDrawer.vue';
import { useAutoUIStore } from '@/stores/autoui';
const autoUIStore = useAutoUIStore();
import { useInstalledAppNames } from '@/hooks/useInstalledAppNames';
import {
	NButton,
	NDataTable,
	NIcon,
	NInput,
	NTable,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
	type DataTableColumns,
	type DropdownOption,
} from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';
import * as embeddedApi from '@/apis/embeddedApi';
import { useDeviceStore } from '@/stores/device';
import * as xmlFormat from '@/utils/xmlFormat';
import { useEmbeddedStore } from '@/stores/embedded';
import { useLogsStore } from '@/stores/logs';
import { useQQDoc } from '@/hooks/useQQDoc';
import eventBus from '@/utils/eventBus';
import {
	ArrowPathIcon,
	FunnelIcon,
	PlusIcon,
	MagnifyingGlassIcon,
	CircleStackIcon,
	ShareIcon,
	XCircleIcon,
	TrashIcon,
	SquaresPlusIcon,
	ScissorsIcon,
} from '@heroicons/vue/24/outline';
import {
	FunnelIcon as FunnelSolidIcon,
	Cog6ToothIcon,
	EllipsisHorizontalCircleIcon,
	MinusCircleIcon,
	QuestionMarkCircleIcon,
	XCircleIcon as XCircleIconSolid,
	MicrophoneIcon,
	ChatBubbleLeftEllipsisIcon,
} from '@heroicons/vue/24/solid';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/format';
import { findBase64InString, renderApplicationName } from '@/utils/common';
import {
	getAppMode,
	getAppModeCode,
	getSettingEnableMode,
	getSettingMode,
	thirdPartyAppOptimizeJSONFormatToProp,
	thirdPartyAppOptimizeJSONFormatToRunnerShell,
} from '@/utils/embeddedFun';
import { cloneDeep, isEqual } from 'lodash-es';
import { incompatibleApplicationList } from '@/config/blacklistApplications';
import { embeddedPerceptionApplications } from '@/config/rulePerceptionApplications';
import { useRouter } from 'vue-router';
import { useDisabledOS2SystemAppOptimize } from '@/hooks/useDisabledOS2SystemAppOptimize';
type EmbeddedAppDrawerInstance = InstanceType<typeof EmbeddedAppDrawer>;
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
type NDataTabletInstance = InstanceType<typeof NDataTable>;
const shareRuleTextarea = ref('');
const router = useRouter();
const disabledOS2SystemAppOptimizeHook = useDisabledOS2SystemAppOptimize();
const installedAppNamesHook = useInstalledAppNames();
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();
const logsStore = useLogsStore();
const QQDocHook = useQQDoc();
const importShareRuleLoading = ref(false);
const hotReloadLoading = ref(false);
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const addEmbeddedApp = ref<EmbeddedAppDrawerInstance | null>(null);
const updateEmbeddedApp = ref<EmbeddedAppDrawerInstance | null>(null);
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const columns = createColumns();
const showErrorModal = ref(false);
const embeddedTableRef = ref<NDataTabletInstance | null>(null);

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

const getInstalledAppNameList = async () => {
	// notification.info({
	// 	content: '已加入任务队列',
	// 	meta: '正在获取已安装应用名称，请不要关闭模块的 Web UI，完成后会弹出通知，请稍等~',
	// 	duration: 2500,
	// });
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
	embeddedStore.filterInstalledApps = !embeddedStore.filterInstalledApps;
};

watch(
	() => embeddedStore.isNeedShowErrorModal, // 监听的值
	(newValue, oldValue) => {
		// 回调函数，值变化时执行
		if (newValue) {
			showErrorModal.value = true;
		}
	},
	{ immediate: false }, // 默认是 false，不需要设置，确保不会在初始时执行
);

const reloadPage = async () => {
	await deviceStore.getAndroidApplicationPackageNameList();
	await embeddedStore.initDefault();
};

const importShareRule = async () => {
	shareRuleTextarea.value = '';
	const [, showShareRuleTextareaModalRes] = await $to(
		new Promise((resolve, reject) => {
			modal.create({
				title: '请粘贴分享规则口令',
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
		try {
			const uint8Array: Uint8Array = base64ToArrayBuffer(getBase64String);
			const inflate = pako.inflate(uint8Array, {
				to: 'string',
			});
			const importRuleContent = JSON.parse(inflate);
			if (importRuleContent.type !== 'embedded') {
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
							不适用于应用横屏布局。
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
			// Android 15 以下的处理逻辑
			if (importRuleContent.comp === 1 && deviceStore.MIOSVersion && deviceStore.MIOSVersion > 1) {
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
							仅兼容Android 13 - 14 的小米机型。
						</p>
					),
					negativeText: '确定',
				});
				importShareRuleLoading.value = false;
				return;
			}
			// Android 15 以上机型处理逻辑
			if (
				importRuleContent.comp === 2 &&
				(!deviceStore.MIOSVersion || deviceStore.MIOSVersion < 2 || deviceStore.androidTargetSdk < 35)
			) {
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
							仅兼容Android 15+的小米机型。
						</p>
					),
					negativeText: '确定',
				});
				importShareRuleLoading.value = false;
				return;
			}
			embeddedStore.customConfigEmbeddedRulesList[importRuleContent.name] = importRuleContent.em;
			embeddedStore.customConfigFixedOrientationList[importRuleContent.name] = importRuleContent.fo;
			if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
				if (importRuleContent.thirdPartyAppOptimize) {
					embeddedStore.customThirdPartyAppOptimizeConfig[importRuleContent.name] = getAppModeCode(
						importRuleContent.mode,
					);
				} else {
					if (embeddedStore.sourceThirdPartyAppOptimizeConfig[importRuleContent.name]) {
						embeddedStore.customThirdPartyAppOptimizeConfig[importRuleContent.name] = -1;
					} else {
						delete embeddedStore.customThirdPartyAppOptimizeConfig[importRuleContent.name];
					}
				}
				embeddedStore.customConfigEmbeddedSettingConfig[importRuleContent.name] = {
					name: importRuleContent.name,
					...getSettingEnableMode(
						embeddedStore.customConfigEmbeddedRulesList[importRuleContent.name],
						embeddedStore.customConfigFixedOrientationList[importRuleContent.name],
						importRuleContent.mode,
					),
				};
			} else {
				embeddedStore.systemEmbeddedSettingConfig[importRuleContent.name] = {
					name: importRuleContent.name,
					embeddedEnable: ['embedded', 'fullScreen'].includes(importRuleContent.mode) ? true : false,
				};
			}
			const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(
				embeddedApi.updateEmbeddedApp({
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? {
								setAppMode: {
									name: importRuleContent.name,
									action: getAppModeCode(importRuleContent.mode),
								},
							}
						: {
								switchAction: {
									name: importRuleContent.name,
									action: ['embedded', 'fullScreen'].includes(importRuleContent.mode)
										? 'enable'
										: 'disable',
								},
							}),
				}),
			);
			if (submitUpdateEmbeddedAppErr) {
				modal.create({
					title: '导入分享规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，导入失败了QwQ，详细错误请查看错误日志~</p>,
				});
				importShareRuleLoading.value = false;
			} else {
				embeddedStore.updateMergeRuleList();
				await reloadPage();
				importShareRuleLoading.value = false;
				modal.create({
					title: '导入分享规则成功',
					type: 'success',
					preset: 'dialog',
					content: () =>
						deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35 ? (
							<p>
								好耶w，{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(
										importRuleContent.name,
										deviceStore.installedAppNameList[importRuleContent.name] ||
											embeddedStore.applicationName[importRuleContent.name],
									)}
								</span>{' '}
								的应用导入成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板再做尝试~
							</p>
						) : (
							<p>
								好耶w，{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(
										importRuleContent.name,
										deviceStore.installedAppNameList[importRuleContent.name] ||
											embeddedStore.applicationName[importRuleContent.name],
									)}
								</span>{' '}
								的应用导入成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板并且在{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平板专区-平行窗口
								</span>{' '}
								内{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{['embedded', 'fullScreen'].includes(importRuleContent.mode) ? '打开' : '关闭'}
								</span>{' '}
								该应用的开关再做尝试~
							</p>
						),
					positiveText: '确定',
				});
			}
			// 解析成功，可以使用 data
		} catch (error) {
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

const reloadPatchModeConfigLoading = ref<boolean>(false);

const hotReloadApplicationData = async () => {
	hotReloadLoading.value = true;
	await reloadPage();
	const [updateRuleErr, updateRuleRes] = await $to(deviceApi.updateRule('miui_embedding_window'));
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

const reloadPatchModeConfigList = async () => {
	await deviceStore.getAndroidApplicationPackageNameList();
	reloadPatchModeConfigLoading.value = true;
	const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(
		embeddedApi.updateEmbeddedApp(),
	);
	if (submitUpdateEmbeddedAppErr) {
		modal.create({
			title: '操作失败',
			type: 'error',
			preset: 'dialog',
			content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
		});
		reloadPatchModeConfigLoading.value = false;
	} else {
		embeddedStore.updateMergeRuleList();
		reloadPatchModeConfigLoading.value = false;
		modal.create({
			title: '操作成功',
			type: 'success',
			preset: 'dialog',
			content: () => (
				<div>
					{embeddedStore.isDeepPatchMode && (<p>好耶w，检测到您已启用{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							深度定制模式
						</span>{' '}，已根据您当前已安装应用列表重新{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							修剪模块应用适配列表
						</span>{' '}
						，后续每次更新模块或者安装新的应用后，均需要重新操作{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							生成定制应用数据
						</span>{' '}
						。</p>)}
					{!embeddedStore.isDeepPatchMode && (<p>好耶w，已根据您设备当前的整体应用情况重新{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							修剪模块应用适配列表
						</span>{' '}
						，后续每次更新模块或者安装新的应用后，建议重新操作{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							生成定制应用数据
						</span>{' '}
						。
					</p>)}
				</div>
			),
			negativeText: '确定',
		});
	}
};

const openAddEmbeddedApp = async () => {
	if (deviceStore.deviceType !== 'tablet') {
		modal.create({
			title: '不兼容说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>,
		});
		logsStore.info('应用横屏布局-添加应用', '该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！');
		return;
	}
	if (addEmbeddedApp.value) {
		const [addEmbeddedAppCancel, addEmbeddedAppRes] = await $to(addEmbeddedApp.value.openDrawer());
		if (addEmbeddedAppCancel) {
			console.log('操作取消:', addEmbeddedAppCancel);
		} else {
			if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
				if (addEmbeddedAppRes.thirdPartyAppOptimize) {
					embeddedStore.customThirdPartyAppOptimizeConfig[addEmbeddedAppRes.name] = getAppModeCode(
						addEmbeddedAppRes.settingMode,
					);
				} else {
					if (embeddedStore.sourceThirdPartyAppOptimizeConfig[addEmbeddedAppRes.name]) {
						embeddedStore.customThirdPartyAppOptimizeConfig[addEmbeddedAppRes.name] = -1;
					} else {
						delete embeddedStore.customThirdPartyAppOptimizeConfig[addEmbeddedAppRes.name];
					}
				}
			}
			if (addEmbeddedAppRes.settingMode === 'fullScreen') {
				if (addEmbeddedAppRes.modePayload.fullRule) {
					embeddedStore.customConfigEmbeddedRulesList[addEmbeddedAppRes.name] = {
						name: addEmbeddedAppRes.name,
						fullRule: addEmbeddedAppRes.modePayload.fullRule,
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { skipSelfAdaptive: true }
							: {}),
					};
				}
				embeddedStore.customConfigFixedOrientationList[addEmbeddedAppRes.name] = {
					name: addEmbeddedAppRes.name,
					...(addEmbeddedAppRes.modePayload.isShowDivider ? { isShowDivider: true } : {}),
					...(addEmbeddedAppRes.modePayload.skipSelfAdaptive &&
					(!deviceStore.MIOSVersion || deviceStore.MIOSVersion < 2 || deviceStore.androidTargetSdk < 35)
						? { disable: true }
						: {}),
					...(addEmbeddedAppRes.modePayload.supportFullSize ? { supportFullSize: true } : {}),
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? { supportModes: 'full,fo' }
						: {}),
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? { defaultSettings: 'full' }
						: {}),
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? { skipSelfAdaptive: true }
						: {}),
				};
			}
			if (addEmbeddedAppRes.settingMode === 'fixedOrientation') {
				embeddedStore.customConfigFixedOrientationList[addEmbeddedAppRes.name] = {
					name: addEmbeddedAppRes.name,
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? { supportModes: 'full,fo' }
						: {}),
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? { defaultSettings: 'fo' }
						: {}),
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? { skipSelfAdaptive: true }
						: {}),
					...(addEmbeddedAppRes.modePayload.ratio !== undefined
						? {
								ratio: addEmbeddedAppRes.modePayload.ratio,
							}
						: {}),
					...(addEmbeddedAppRes.modePayload.foRelaunch !== undefined
						? {
								relaunch: addEmbeddedAppRes.modePayload.foRelaunch,
							}
						: {}),
				};
			}
			if (addEmbeddedAppRes.settingMode === 'disabled') {
				embeddedStore.customConfigFixedOrientationList[addEmbeddedAppRes.name] = {
					name: addEmbeddedAppRes.name,
					disable: true,
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? { skipSelfAdaptive: true }
						: {}),
					...(addEmbeddedAppRes.modePayload.foRelaunch !== undefined
						? {
								relaunch: addEmbeddedAppRes.modePayload.foRelaunch,
							}
						: {}),
					...(addEmbeddedAppRes.modePayload.supportFullSize ? { supportFullSize: true } : {}),
					...(addEmbeddedAppRes.modePayload.isShowDivider ? { isShowDivider: true } : {}),
				};
			}
			if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
				embeddedStore.customConfigEmbeddedSettingConfig[addEmbeddedAppRes.name] = {
					name: addEmbeddedAppRes.name,
					...getSettingEnableMode(
						embeddedStore.customConfigEmbeddedRulesList[addEmbeddedAppRes.name],
						embeddedStore.customConfigFixedOrientationList[addEmbeddedAppRes.name],
						addEmbeddedAppRes.settingMode,
					),
				};
			} else {
				embeddedStore.systemEmbeddedSettingConfig[addEmbeddedAppRes.name] = {
					name: addEmbeddedAppRes.name,
					embeddedEnable: ['embedded', 'fullScreen'].includes(addEmbeddedAppRes.settingMode) ? true : false,
				};
			}
			const [submitAddEmbeddedAppErr, submitAddEmbeddedAppRes] = await $to(
				embeddedApi.updateEmbeddedApp({
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? {
								setAppMode: {
									name: addEmbeddedAppRes.name,
									action: getAppModeCode(addEmbeddedAppRes.settingMode),
								},
							}
						: {
								switchAction: {
									name: addEmbeddedAppRes.name,
									action: ['embedded', 'fullScreen'].includes(addEmbeddedAppRes.settingMode)
										? 'enable'
										: 'disable',
								},
							}),
				}),
			);
			if (submitAddEmbeddedAppErr) {
				modal.create({
					title: '应用添加失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
				});
				addEmbeddedAppRes.loadingCallback && addEmbeddedAppRes.loadingCallback();
			} else {
				modal.create({
					title: '应用添加成功',
					type: 'success',
					preset: 'dialog',
					content: () =>
						deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35 ? (
							<p>
								好耶w，{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(
										addEmbeddedAppRes.name,
										deviceStore.installedAppNameList[addEmbeddedAppRes.name] ||
											embeddedStore.applicationName[addEmbeddedAppRes.name],
									)}
								</span>{' '}
								的应用配置添加成功了OwO~如果应用添加后的规则不生效，可以尝试重启平板再做尝试~
							</p>
						) : (
							<p>
								好耶w，{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(
										addEmbeddedAppRes.name,
										deviceStore.installedAppNameList[addEmbeddedAppRes.name] ||
											embeddedStore.applicationName[addEmbeddedAppRes.name],
									)}
								</span>{' '}
								的应用配置添加成功了OwO~如果应用添加后的规则不生效，可以尝试重启平板并且在{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平板专区-平行窗口
								</span>{' '}
								内{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{['embedded', 'fullScreen'].includes(addEmbeddedAppRes.settingMode)
										? '打开'
										: '关闭'}
								</span>{' '}
								该应用的开关再做尝试~
							</p>
						),
				});
				embeddedStore.updateMergeRuleList();
				addEmbeddedAppRes.loadingCallback && addEmbeddedAppRes.loadingCallback();
				addEmbeddedAppRes.closeCallback && addEmbeddedAppRes.closeCallback();
			}
		}
	}
};

const openUpdateEmbeddedApp = async (row: EmbeddedMergeRuleItem, index: number) => {
	if (deviceStore.deviceType !== 'tablet') {
		modal.create({
			title: '不兼容说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！</p>,
		});
		logsStore.info('应用横屏布局-添加应用', '该功能仅兼容平板设备，暂时不兼容折叠屏设备，请等待后续更新情况！');
		return;
	}
	if (
		embeddedStore.systemAppOptimizeConfig[row.name] &&
		deviceStore.MIOSVersion &&
		deviceStore.MIOSVersion >= 2 &&
		deviceStore.androidTargetSdk >= 35 &&
		!deviceStore.isDisabledOS2SystemAppOptimize
	) {
		modal.create({
			title: '该应用已受模块保护',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					为确保{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					正常横屏工作，模块已保护该应用不允许修改任何配置，如需修改请先前往{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						模块设置
					</span>{' '}
					禁用{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						系统应用横屏优化
					</span>{' '}
					。
				</p>
			),
		});
		return;
	}
	if (incompatibleApplicationList[row.name]) {
		incompatibleApplicationList[row.name] && incompatibleApplicationList[row.name](row);
	}
	if (updateEmbeddedApp.value) {
		const [updateEmbeddedAppCancel, updateEmbeddedAppRes] = await $to(updateEmbeddedApp.value.openDrawer(row));
		if (updateEmbeddedAppCancel) {
			console.log('操作取消:', updateEmbeddedAppCancel);
		} else {
			if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
				if (updateEmbeddedAppRes.thirdPartyAppOptimize) {
					embeddedStore.customThirdPartyAppOptimizeConfig[updateEmbeddedAppRes.name] = getAppModeCode(
						updateEmbeddedAppRes.settingMode,
					);
				} else {
					if (embeddedStore.sourceThirdPartyAppOptimizeConfig[updateEmbeddedAppRes.name]) {
						embeddedStore.customThirdPartyAppOptimizeConfig[updateEmbeddedAppRes.name] = -1;
					} else {
						delete embeddedStore.customThirdPartyAppOptimizeConfig[updateEmbeddedAppRes.name];
					}
				}
			}
			if (updateEmbeddedAppRes.settingMode === 'fullScreen') {
				const { moduleEmbeddedRules, currentEmbeddedRules, moduleFixedOrientation, currentFixedOrientation } =
					useEmbedded(row.name);
				if (currentEmbeddedRules.value) {
					if (updateEmbeddedAppRes.modePayload.fullRule) {
						currentEmbeddedRules.value.fullRule = updateEmbeddedAppRes.modePayload.fullRule;
						currentEmbeddedRules.value.skipSelfAdaptive = true;
					}
					if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
						if (!updateEmbeddedAppRes.modePayload.fullRule && currentEmbeddedRules.value.fullRule) {
							delete currentEmbeddedRules.value.fullRule;
						}
					}
					if (!isEqual(moduleEmbeddedRules.value, currentEmbeddedRules.value)) {
						embeddedStore.customConfigEmbeddedRulesList[row.name] = {
							...{ name: row.name },
							...currentEmbeddedRules.value,
						};
					}
				} else {
					if (updateEmbeddedAppRes.modePayload.fullRule) {
						embeddedStore.customConfigEmbeddedRulesList[row.name] = {
							name: row.name,
							fullRule: updateEmbeddedAppRes.modePayload.fullRule,
							...(deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
								? { skipSelfAdaptive: true }
								: {}),
						};
					} else {
						if (
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
						) {
							embeddedStore.customConfigEmbeddedRulesList[row.name] = {
								name: row.name,
								skipSelfAdaptive: true,
							};
						}
					}
				}
				if (currentFixedOrientation.value) {
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('isShowDivider')) {
						currentFixedOrientation.value.isShowDivider = updateEmbeddedAppRes.modePayload.isShowDivider;
					}
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('supportFullSize')) {
						currentFixedOrientation.value.supportFullSize =
							updateEmbeddedAppRes.modePayload.supportFullSize;
					}
					if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
						const hasDisable = currentFixedOrientation.value.hasOwnProperty('disable');
						if (hasDisable) {
							delete currentFixedOrientation.value.disable;
						}
						const hasCompatChange = currentFixedOrientation.value.hasOwnProperty('compatChange');
						if (hasCompatChange) {
							delete currentFixedOrientation.value.compatChange;
						}
						currentFixedOrientation.value.supportModes = 'full,fo';
						currentFixedOrientation.value.defaultSettings = 'full';
					} else {
						if (updateEmbeddedAppRes.modePayload.hasOwnProperty('skipSelfAdaptive')) {
							currentFixedOrientation.value.disable = updateEmbeddedAppRes.modePayload.skipSelfAdaptive;
						}
					}
					if (!isEqual(moduleFixedOrientation.value, currentFixedOrientation.value)) {
						embeddedStore.customConfigFixedOrientationList[row.name] = {
							...{ name: row.name },
							...currentFixedOrientation.value,
						};
					}
				} else {
					embeddedStore.customConfigFixedOrientationList[row.name] = {
						name: row.name,
						...(updateEmbeddedAppRes.modePayload.isShowDivider ? { isShowDivider: true } : {}),
						...(updateEmbeddedAppRes.modePayload.skipSelfAdaptive &&
						(!deviceStore.MIOSVersion ||
							(deviceStore.MIOSVersion && deviceStore.MIOSVersion < 2) ||
							deviceStore.androidTargetSdk < 35)
							? { disable: true }
							: {}),
						...(updateEmbeddedAppRes.modePayload.supportFullSize ? { supportFullSize: true } : {}),
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { supportModes: 'full,fo' }
							: {}),
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { defaultSettings: 'full' }
							: {}),
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { skipSelfAdaptive: true }
							: {}),
					};
				}
			}
			if (updateEmbeddedAppRes.settingMode === 'fixedOrientation') {
				const { moduleEmbeddedRules, currentEmbeddedRules, moduleFixedOrientation, currentFixedOrientation } =
					useEmbedded(row.name);
				if (currentEmbeddedRules.value) {
					if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
						const hasFullRule = currentEmbeddedRules.value.hasOwnProperty('fullRule');
						if (hasFullRule) {
							delete currentEmbeddedRules.value.fullRule;
							if (embeddedStore.customConfigEmbeddedRulesList[row.name]) {
								delete embeddedStore.customConfigEmbeddedRulesList[row.name].fullRule
							}
						}
					}
					if (!isEqual(moduleEmbeddedRules.value, currentEmbeddedRules.value)) {
						embeddedStore.customConfigEmbeddedRulesList[row.name] = {
							...{ name: row.name },
							...currentEmbeddedRules.value,
						};
					}
				}
				if (currentFixedOrientation.value) {
					const hasDisable = currentFixedOrientation.value.hasOwnProperty('disable');
					if (hasDisable) {
						delete currentFixedOrientation.value.disable;
					}
					const hasIsScale = currentFixedOrientation.value.hasOwnProperty('isScale');
					if (hasIsScale) {
						delete currentFixedOrientation.value.isScale;
					}
					if (updateEmbeddedAppRes.modePayload.ratio !== undefined) {
						currentFixedOrientation.value.ratio = updateEmbeddedAppRes.modePayload.ratio;
					} else {
						delete currentFixedOrientation.value.ratio;
					}
					if (updateEmbeddedAppRes.modePayload.foRelaunch !== undefined) {
						currentFixedOrientation.value.relaunch = updateEmbeddedAppRes.modePayload.foRelaunch;
					} else {
						delete currentFixedOrientation.value.relaunch;
					}
					if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
						currentFixedOrientation.value.supportModes = 'full,fo';
						currentFixedOrientation.value.defaultSettings = 'fo';
						currentFixedOrientation.value.skipSelfAdaptive = true;
						if (
							updateEmbeddedAppRes.modePayload.hasOwnProperty('forceFixedOrientation') &&
							updateEmbeddedAppRes.modePayload.forceFixedOrientation
						) {
							if (currentFixedOrientation.value.compatChange) {
								const compatSet = new Set(currentFixedOrientation.value.compatChange?.split(','));
								compatSet.add('OVERRIDE_UNDEFINED_ORIENTATION_TO_PORTRAIT');
								currentFixedOrientation.value.compatChange = [...compatSet].join(',');
							} else {
								currentFixedOrientation.value.compatChange =
									'OVERRIDE_UNDEFINED_ORIENTATION_TO_PORTRAIT';
							}
						} else {
							const hasCompatChange = currentFixedOrientation.value.hasOwnProperty('compatChange');
							if (hasCompatChange) {
								delete currentFixedOrientation.value.compatChange;
							}
						}
					}
					if (!isEqual(moduleFixedOrientation.value, currentFixedOrientation.value)) {
						embeddedStore.customConfigFixedOrientationList[row.name] = {
							...{ name: row.name },
							...currentFixedOrientation.value,
						};
					}
				} else {
					embeddedStore.customConfigFixedOrientationList[row.name] = {
						name: row.name,
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { supportModes: 'full,fo' }
							: {}),
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { defaultSettings: 'fo' }
							: {}),
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { skipSelfAdaptive: true }
							: {}),
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35 &&
						updateEmbeddedAppRes.modePayload.forceFixedOrientation
							? {
									compatChange: 'OVERRIDE_UNDEFINED_ORIENTATION_TO_PORTRAIT',
								}
							: {}),
						...(updateEmbeddedAppRes.modePayload.ratio !== undefined
							? {
									ratio: updateEmbeddedAppRes.modePayload.ratio,
								}
							: {}),
						...(updateEmbeddedAppRes.modePayload.foRelaunch !== undefined
							? {
									relaunch: updateEmbeddedAppRes.modePayload.foRelaunch,
								}
							: {}),
					};
				}
			}
			if (
				updateEmbeddedAppRes.settingMode === 'disabled' &&
				row.settingMode !== updateEmbeddedAppRes.settingMode
			) {
				const { moduleEmbeddedRules, currentEmbeddedRules, moduleFixedOrientation, currentFixedOrientation } =
					useEmbedded(row.name);
				if (currentFixedOrientation.value) {
					currentFixedOrientation.value.skipSelfAdaptive = true;
					currentFixedOrientation.value.disable = true;
					const hasCompatChange = currentFixedOrientation.value.hasOwnProperty('compatChange');
					if (hasCompatChange) {
						delete currentFixedOrientation.value.compatChange;
					}
					const hasIsScale = currentFixedOrientation.value.hasOwnProperty('isScale');
					if (hasIsScale) {
						delete currentFixedOrientation.value.isScale;
					}
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('isShowDivider')) {
						currentFixedOrientation.value.isShowDivider = updateEmbeddedAppRes.modePayload.isShowDivider;
					}
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('supportFullSize')) {
						currentFixedOrientation.value.supportFullSize =
							updateEmbeddedAppRes.modePayload.supportFullSize;
					}
					if (!isEqual(moduleFixedOrientation.value, currentFixedOrientation.value)) {
						embeddedStore.customConfigFixedOrientationList[row.name] = {
							...{ name: row.name },
							...currentFixedOrientation.value,
						};
					}
				} else {
					embeddedStore.customConfigFixedOrientationList[row.name] = {
						name: row.name,
						disable: true,
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? { skipSelfAdaptive: true }
							: {}),
					};
				}
			}
			if (updateEmbeddedAppRes.settingMode === 'embedded') {
				// 如果 `row.settingMode` 不同且规则是自定义且模块规则支持平行窗口，则删除自定义规则
				// if (row.settingMode !== updateEmbeddedAppRes.settingMode) {
				// 	if (row.ruleMode === 'custom' && row.isSupportEmbedded) {
				// 		delete embeddedStore.customConfigEmbeddedRulesList[row.name];
				// 	}
				// }
				// 如果自定义规则存在，更新 `splitRatio`
				if (embeddedStore.customConfigEmbeddedRulesList[row.name]) {
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('splitRatio')) {
						embeddedStore.customConfigEmbeddedRulesList[row.name].splitRatio =
							updateEmbeddedAppRes.modePayload.splitRatio;
					}
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('emRelaunch')) {
						embeddedStore.customConfigEmbeddedRulesList[row.name].relaunch =
							updateEmbeddedAppRes.modePayload.emRelaunch;
					}
					if (
						updateEmbeddedAppRes.modePayload.hasOwnProperty('emIsDisabledPlaceholder') &&
						updateEmbeddedAppRes.modePayload.emIsDisabledPlaceholder
					) {
						delete embeddedStore.customConfigEmbeddedRulesList[row.name].placeholder;
					}
					if (embeddedStore.customConfigEmbeddedRulesList[row.name].hasOwnProperty('fullRule')) {
						delete embeddedStore.customConfigEmbeddedRulesList[row.name].fullRule;
					}
				} else {
					// 如果不存在自定义规则，但有 `splitRatio` 需要补充
					let isNeedPatchOrigin = false;
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('splitRatio')) {
						isNeedPatchOrigin = true;
					}
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('emRelaunch')) {
						isNeedPatchOrigin = true;
					}
					if (updateEmbeddedAppRes.modePayload.hasOwnProperty('placeholder')) {
						isNeedPatchOrigin = true;
					}
					if (isNeedPatchOrigin) {
						embeddedStore.customConfigEmbeddedRulesList[row.name] = {
							...(embeddedStore.isPatchMode
								? embeddedStore.patchEmbeddedRulesList[row.name]
								: embeddedStore.sourceEmbeddedRulesList[row.name]),
							...(updateEmbeddedAppRes.modePayload.hasOwnProperty('splitRatio') && {
								splitRatio: updateEmbeddedAppRes.modePayload.splitRatio,
							}),
							...(updateEmbeddedAppRes.modePayload.hasOwnProperty('emRelaunch') && {
								relaunch: updateEmbeddedAppRes.modePayload.emRelaunch,
							}),
						};
						if (
							updateEmbeddedAppRes.modePayload.hasOwnProperty('emIsDisabledPlaceholder') &&
							updateEmbeddedAppRes.modePayload.emIsDisabledPlaceholder
						) {
							delete embeddedStore.customConfigEmbeddedRulesList[row.name].placeholder;
						}

						if (embeddedStore.customConfigEmbeddedRulesList[row.name].hasOwnProperty('fullRule')) {
							delete embeddedStore.customConfigEmbeddedRulesList[row.name].fullRule;
						}
					}
				}
				if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
					const {
						moduleEmbeddedRules,
						currentEmbeddedRules,
						moduleFixedOrientation,
						currentFixedOrientation,
					} = useEmbedded(row.name);
					if (currentFixedOrientation.value) {
						const hasDisable = currentFixedOrientation.value.hasOwnProperty('disable');
						if (hasDisable) {
							delete currentFixedOrientation.value.disable;
						}
						const hasDefaultSettings = currentFixedOrientation.value.hasOwnProperty('defaultSettings');
						if (hasDefaultSettings) {
							delete currentFixedOrientation.value.defaultSettings;
						}
						const hasFoSkipSelfAdaptive = currentFixedOrientation.value.hasOwnProperty('skipSelfAdaptive');
						if (!hasFoSkipSelfAdaptive) {
							currentFixedOrientation.value.skipSelfAdaptive = true;
						}
						const hasCompatChange = currentFixedOrientation.value.hasOwnProperty('compatChange');
						if (hasCompatChange) {
							delete currentFixedOrientation.value.compatChange;
						}
					}
					if (currentEmbeddedRules.value) {
						const hasEmSkipSelfAdaptive = currentEmbeddedRules.value.hasOwnProperty('skipSelfAdaptive');
						if (!hasEmSkipSelfAdaptive) {
							currentEmbeddedRules.value.skipSelfAdaptive = true;
						}
					}
					if (!isEqual(moduleEmbeddedRules.value, currentEmbeddedRules.value)) {
						embeddedStore.customConfigFixedOrientationList[row.name] = {
							...{ name: row.name },
							...currentFixedOrientation.value,
						};
					}
					if (!isEqual(moduleFixedOrientation.value, currentFixedOrientation.value)) {
						embeddedStore.customConfigEmbeddedRulesList[row.name] = {
							...{ name: row.name },
							...currentEmbeddedRules.value,
						};
					}
				}
			}
			// settings 配置
			if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
				const { moduleEmbeddedRules, currentEmbeddedRules, moduleFixedOrientation, currentFixedOrientation } =
					useEmbedded(row.name);
				if (row.settingMode !== updateEmbeddedAppRes.settingMode) {
					embeddedStore.customConfigEmbeddedSettingConfig[row.name] = {
						name: row.name,
						...getSettingEnableMode(
							currentEmbeddedRules.value,
							currentFixedOrientation.value,
							updateEmbeddedAppRes.settingMode,
						),
					};
				}
			} else {
				embeddedStore.systemEmbeddedSettingConfig[row.name] = {
					name: row.name,
					embeddedEnable: ['embedded', 'fullScreen'].includes(updateEmbeddedAppRes.settingMode)
						? true
						: false,
				};
			}
			const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(
				embeddedApi.updateEmbeddedApp({
					...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? {
								setAppMode: {
									name: row.name,
									action: getAppModeCode(updateEmbeddedAppRes.settingMode),
								},
							}
						: {
								switchAction: {
									name: row.name,
									action: ['embedded', 'fullScreen'].includes(updateEmbeddedAppRes.settingMode)
										? 'enable'
										: 'disable',
								},
							}),
				}),
			);
			if (submitUpdateEmbeddedAppErr) {
				modal.create({
					title: '应用更新失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
				});
				updateEmbeddedAppRes.loadingCallback && updateEmbeddedAppRes.loadingCallback();
			} else {
				modal.create({
					title: '应用更新成功',
					type: 'success',
					preset: 'dialog',
					content: () =>
						deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35 ? (
							<p>
								好耶w，{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								的应用配置更新成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板再做尝试~
							</p>
						) : (
							<p>
								好耶w，{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								的应用配置更新成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板并且在{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平板专区-平行窗口
								</span>{' '}
								内{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{['embedded', 'fullScreen'].includes(updateEmbeddedAppRes.settingMode)
										? '打开'
										: '关闭'}
								</span>{' '}
								该应用的开关再做尝试~
							</p>
						),
				});
				embeddedStore.updateMergeRuleList();
				updateEmbeddedAppRes.loadingCallback && updateEmbeddedAppRes.loadingCallback();
				updateEmbeddedAppRes.closeCallback && updateEmbeddedAppRes.closeCallback();
			}
		}
	}
};

const handleCustomRuleDropdown = async (
	key: string | number,
	option: DropdownOption,
	row: EmbeddedMergeRuleItem,
	index: number,
) => {
	if (deviceStore.deviceType !== 'tablet') {
		modal.create({
			title: '不兼容说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能仅兼容平板设备，不兼容折叠屏设备！</p>,
		});
		logsStore.info('应用横屏布局-自定义规则', '该功能仅兼容平板设备，不兼容折叠屏设备！');
		return;
	}
	if (key === 'switchToSystemEmbedded') {
		handleModuleRuleSwitchToSystemEmbedded(row, index);
	}
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
				if (embeddedStore.customConfigEmbeddedRulesList[row.name]) {
					delete embeddedStore.customConfigEmbeddedRulesList[row.name];
				}
				if (embeddedStore.customConfigFixedOrientationList[row.name]) {
					delete embeddedStore.customConfigFixedOrientationList[row.name];
				}
				if (embeddedStore.customConfigEmbeddedSettingConfig[row.name]) {
					delete embeddedStore.customConfigEmbeddedSettingConfig[row.name];
				}
				if (embeddedStore.customThirdPartyAppOptimizeConfig[row.name]) {
					delete embeddedStore.customThirdPartyAppOptimizeConfig[row.name];
				}

				const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(
					embeddedApi.updateEmbeddedApp({
						...(deviceStore.MIOSVersion &&
						deviceStore.MIOSVersion >= 2 &&
						deviceStore.androidTargetSdk >= 35
							? {
									setAppMode: {
										name: row.name,
										action: getAppModeCode(
											getSettingMode(
												embeddedStore.isPatchMode
													? embeddedStore.patchEmbeddedRulesList[row.name]
													: embeddedStore.sourceEmbeddedRulesList[row.name],
												embeddedStore.isPatchMode
													? embeddedStore.patchFixedOrientationList[row.name]
													: embeddedStore.sourceFixedOrientationList[row.name],
											),
										),
									},
								}
							: {
									switchAction: {
										name: row.name,
										action: (
											embeddedStore.isPatchMode
												? embeddedStore.patchEmbeddedRulesList[row.name]
												: embeddedStore.sourceEmbeddedRulesList[row.name]
										)
											? 'enable'
											: 'disable',
									},
								}),
					}),
				);
				if (submitUpdateEmbeddedAppErr) {
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
							<p>好耶w，清除自定义规则成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板再试试~</p>
						),
					});
					cleanCustomModal.loading = false;
					embeddedStore.updateMergeRuleList();
				}
			},
		});
	}
	if (key === 'shareCustomRule') {
		const shareContent = {
			name: row.name,
			cmpt: deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35 ? 2 : 1,
			em: {
				name: row.name,
				...row.embeddedRules,
			},
			fo: {
				name: row.name,
				...row.fixedOrientationRule,
			},
			type: 'embedded',
			device: deviceStore.deviceType === 'tablet' ? 'pad' : 'fold',
			mode: row.settingMode,
			...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
				? {
						thirdPartyAppOptimize: row.thirdPartyAppOptimize,
					}
				: undefined),
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
				`我分享了一个[应用横屏布局]的自定义规则，可以前往[完美横屏应用计划 For Web UI]导入：\n${base64String}`,
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
								应用横屏布局- 从分享口令导入
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

const handleCanUseAutoUIRuleExplain = (row: EmbeddedMergeRuleItem, index: number) => {
	modal.create({
		title: '应用布局优化说明',
		type: 'success',
		preset: 'dialog',
		content: () => (
			<p>
				{' '}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					{renderApplicationName(row.name, row.applicationName)}
				</span>{' '}
				已存在应用布局优化的规则，规则仅在应用横屏冷启动全屏场景下才会生效，如果规则未生效，请检查应用布局优化规则是否{' '}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>启用</span>{' '}，并建议将应用的横屏配置修改为{' '}
            <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>全屏</span>
            ，规则效果以应用个体差异而异，建议多多尝试。
			</p>
		),
	});
};

const handleModuleRuleModeExplain = (row: EmbeddedMergeRuleItem, index: number, canUseSystemEmbedded?: boolean) => {
	if (deviceStore.deviceType !== 'tablet') {
		modal.create({
			title: '不兼容说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能仅兼容平板设备，不兼容折叠屏设备！</p>,
		});
		return;
	}
	modal.create({
		title: '模块规则说明',
		type: 'warning',
		preset: 'dialog',
		content: () =>
			canUseSystemEmbedded ? (
				<div>
					<p>
						模块已对{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							{renderApplicationName(row.name, row.applicationName)}
						</span>{' '}
						配置了合适的适配规则，且不可被移除，仅有自定义规则可以被移除哦~
					</p>
					<p>
						由于小米也对{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							{renderApplicationName(row.name, row.applicationName)}
						</span>{' '}
						提供了系统规则，您可以选择切换系统规则作为{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							{renderApplicationName(row.name, row.applicationName)}
						</span>{' '}
						的自定义规则~
					</p>
				</div>
			) : (
				<p>
					模块已对{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					配置了合适的适配规则，且不可被移除，仅有自定义规则可以被移除哦~
				</p>
			),
	});
};

const handleModuleRuleDropdown = async (
	key: string | number,
	option: DropdownOption,
	row: EmbeddedMergeRuleItem,
	index: number,
) => {
	if (deviceStore.deviceType !== 'tablet') {
		modal.create({
			title: '不兼容说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能仅兼容平板设备，不兼容折叠屏设备！</p>,
		});
		logsStore.info('应用横屏布局-模块规则', '该功能仅兼容平板设备，不兼容折叠屏设备！');
		return;
	}
	if (key === 'moduleRuleModeExplain') {
		handleModuleRuleModeExplain(row, index, true);
	}
	if (key === 'switchToSystemEmbedded') {
		handleModuleRuleSwitchToSystemEmbedded(row, index);
	}
};

const handleModuleRuleSwitchToSystemEmbedded = async (row: EmbeddedMergeRuleItem, index: number) => {
	const mduleRuleSwitchToSystemEmbeddedModal = modal.create({
		title: '想切换为系统规则吗？',
		type: 'warning',
		preset: 'dialog',
		content: () => (
			<p>
				切换为系统规则后，模块将会使用{' '}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					系统内置规则
				</span>{' '}
				作为{' '}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					{renderApplicationName(row.name, row.applicationName)}
				</span>{' '}
				的自定义规则，如后续需要改回{' '}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					平行窗口的模块规则
				</span>{' '}
				则需要先清除自定义规则，确定要继续吗？
			</p>
		),
		positiveText: '确定切换',
		negativeText: '我再想想',
		onPositiveClick: async () => {
			mduleRuleSwitchToSystemEmbeddedModal.loading = true;
			if (embeddedStore.systemEmbeddedRulesList[row.name]) {
				embeddedStore.customConfigEmbeddedRulesList[row.name] = embeddedStore.systemEmbeddedRulesList[row.name];
				const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(
					embeddedApi.updateEmbeddedApp(),
				);
				if (submitUpdateEmbeddedAppErr) {
					modal.create({
						title: '应用更新失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
					});
					mduleRuleSwitchToSystemEmbeddedModal.loading = false;
				} else {
					modal.create({
						title: '应用更新成功',
						type: 'success',
						preset: 'dialog',
						content: () =>
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35 ? (
								<p>
									好耶w，{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										{renderApplicationName(row.name, row.applicationName)}
									</span>{' '}
									的应用配置更新成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板再做尝试~
								</p>
							) : (
								<p>
									好耶w，{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										{renderApplicationName(row.name, row.applicationName)}
									</span>{' '}
									的应用配置更新成功了OwO~如果应用更新后的规则不生效，可以尝试重启平板并且在{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										平板专区-平行窗口
									</span>{' '}
									内{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										{['embedded', 'fullScreen'].includes(row.settingMode) ? '打开' : '关闭'}
									</span>{' '}
									该应用的开关再做尝试~
								</p>
							),
					});
					embeddedStore.updateMergeRuleList();
					mduleRuleSwitchToSystemEmbeddedModal.loading = false;
				}
			} else {
				modal.create({
					title: '切换系统规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => (
						<p>
							无法找到{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(row.name, row.applicationName)}
							</span>{' '}
							的系统规则，切换系统规则失败~
						</p>
					),
					negativeText: '确定',
				});
				mduleRuleSwitchToSystemEmbeddedModal.loading = false;
				return;
			}
		},
	});
};

function createColumns(): DataTableColumns<EmbeddedMergeRuleItem> {
	return [
		{
			title: '应用名称',
			minWidth: 250,
			key: 'name',
			render(row, index) {
				return (
					<div>
						{row.applicationName && <p>{row.applicationName}</p>}
						{row.name && (
							<p>
								<span class={{ hidden: !row.applicationName }}>(</span>
								{row.name}
								<span class={{ hidden: !row.applicationName }}>)</span>
							</p>
						)}
						{autoUIStore.allPackageName.has(row.name) && (
							<n-button
								class='mr-1 mt-1'
								size='tiny'
								ghost
								type='success'
								onClick={() => handleCanUseAutoUIRuleExplain(row, index)}>
								应用布局优化
							</n-button>
						)}
						{incompatibleApplicationList[row.name] && (
							<n-button
								class='mr-1 mt-1'
								size='tiny'
								ghost
								type='warning'
								onClick={() =>
									incompatibleApplicationList[row.name] && incompatibleApplicationList[row.name](row)
								}>
								应用不兼容感知
							</n-button>
						)}
						{embeddedPerceptionApplications[row.name] &&
							embeddedPerceptionApplications[row.name].isShow &&
							embeddedPerceptionApplications[row.name].isShow() && (
								<n-button
									class='mr-1 mt-1'
									size='tiny'
									ghost
									type='info'
									onClick={() =>
										embeddedPerceptionApplications[row.name] &&
										embeddedPerceptionApplications[row.name].onClick &&
										embeddedPerceptionApplications[row.name].onClick(row)
									}>
									应用规则感知
								</n-button>
							)}
					</div>
				);
			},
		},
		{
			title: '规则来源',
			minWidth: 100,
			key: 'ruleMode',
			render(row, index) {
				const canUseSystemEmbedded = row.isSupportSystemEmbedded && row.settingMode === 'embedded';
				const slots = {
					icon:
						row.ruleMode === 'custom' || canUseSystemEmbedded
							? EllipsisHorizontalCircleIcon
							: QuestionMarkCircleIcon,
				};
				if (row.ruleMode === 'custom') {
					const dropdownItemList = () => {
						const itemList = [
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
						if (canUseSystemEmbedded) {
							itemList.unshift({
								label: '切换为系统规则',
								key: 'switchToSystemEmbedded',
								icon: renderIcon(
									<svg class='icon' aria-hidden='true'>
										<use xlinkHref='#icon-chushihua'></use>
									</svg>,
									20,
								),
							});
						}
						return itemList;
					};
					return (
						<n-dropdown
							onSelect={(key: string | number, option: DropdownOption) =>
								handleCustomRuleDropdown(key, option, row, index)
							}
							size='large'
							trigger='click'
							options={dropdownItemList()}>
							<n-button v-slots={slots} size='small' dashed type='info'>
								自定义规则
							</n-button>
						</n-dropdown>
					);
				} else {
					if (canUseSystemEmbedded) {
						const rule = [
							{
								label: '模块规则说明',
								key: 'moduleRuleModeExplain',
								icon: renderIcon(
									<svg class='icon' aria-hidden='true'>
										<use xlinkHref='#icon-shuoming1'></use>
									</svg>,
									20,
								),
							},
							{
								label: '切换为系统规则',
								key: 'switchToSystemEmbedded',
								icon: renderIcon(
									<svg class='icon' aria-hidden='true'>
										<use xlinkHref='#icon-chushihua'></use>
									</svg>,
									20,
								),
							},
						];
						return (
							<n-dropdown
								onSelect={(key: string | number, option: DropdownOption) =>
									handleModuleRuleDropdown(key, option, row, index)
								}
								size='large'
								trigger='click'
								options={rule}>
								<n-button v-slots={slots} size='small' dashed type='error'>
									模块规则
								</n-button>
							</n-dropdown>
						);
					} else {
						return (
							<n-button
								v-slots={slots}
								size='small'
								dashed
								type='error'
								onClick={() => handleModuleRuleModeExplain(row, index)}>
								模块规则
							</n-button>
						);
					}
				}
			},
		},
		{
			title: '规则修复',
			minWidth: 100,
			key: 'setting',
			render(row, index) {
				const slots = {
					icon: XCircleIconSolid,
				};
				const handleClickAppCompatReset = (row: EmbeddedMergeRuleItem, index: number) => {
					modal.create({
						title: '想修复应用规则吗？',
						type: 'warning',
						preset: 'dialog',
						content: () => (
							<p>
								由于系统BUG，部分情况下会导致应用当前适配与实际不符，模块可以主动修复{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									{renderApplicationName(row.name, row.applicationName)}
								</span>{' '}
								由于系统错误的兼容性配置导致应用布局异常的问题，确定要继续吗？
							</p>
						),
						positiveText: '确定修复',
						negativeText: '我再想想',
						onPositiveClick: async () => {
							const [resetCompatErr, resetCompatRes] = await $to(
								embeddedApi.resetApplicationCompat(row.name),
							);
							if (resetCompatErr) {
								modal.create({
									title: '修复应用规则失败',
									type: 'error',
									preset: 'dialog',
									content: () => <p>发生异常错误，修复应用规则失败了QwQ，详细错误请查看错误日志~</p>,
								});
							} else {
								if (
									deviceStore.MIOSVersion &&
									deviceStore.MIOSVersion >= 2 &&
									deviceStore.androidTargetSdk >= 35
								) {
									const [setAppModeErr, setAppModeRes] = await $to<string, string>(
										embeddedApi.setAppMode(row.name, getAppModeCode(row.settingMode)),
									);
									if (setAppModeErr) {
										logsStore.error('SetAppModeErr', setAppModeErr);
										modal.create({
											title: '修复应用规则失败',
											type: 'error',
											preset: 'dialog',
											content: () => (
												<p>发生异常错误，修复应用规则失败了QwQ，详细错误请查看错误日志~</p>
											),
										});
									}
								} else {
									const [switchActionErr, switchActionRes] = await $to<string, string>(
										embeddedApi.switchAction(
											row.name,
											['embedded', 'fullScreen'].includes(row.settingMode) ? 'enable' : 'disable',
										),
									);
									if (switchActionErr) {
										logsStore.error('SwitchActionErr', switchActionErr);
										modal.create({
											title: '修复应用规则失败',
											type: 'error',
											preset: 'dialog',
											content: () => (
												<p>发生异常错误，修复应用规则失败了QwQ，详细错误请查看错误日志~</p>
											),
										});
									}
								}
								modal.create({
									title: '修复应用规则成功',
									type: 'success',
									preset: 'dialog',
									content: () => (
										<p>
											好耶w，修复{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												{renderApplicationName(row.name, row.applicationName)}
											</span>{' '}
											的应用规则成功了OwO~
										</p>
									),
								});
							}
						},
					});
				};
				return (
					<div>
						<n-button
							size='small'
							dashed
							v-slots={slots}
							type='warning'
							onClick={() => handleClickAppCompatReset(row, index)}>
							规则修复
						</n-button>
					</div>
				);
			},
		},
		{
			title: '当前规则',
			minWidth: 100,
			key: 'settingMode',
			render(row, index) {
				const slots = {
					icon: Cog6ToothIcon,
				};
				const modeMap = {
					embedded: {
						type: 'success',
						name: '平行窗口',
						onClick(row: EmbeddedMergeRuleItem, index: number) {
							if (deviceStore.deviceType !== 'tablet') {
								modal.create({
									title: '不兼容说明',
									type: 'warning',
									preset: 'dialog',
									content: () => <p>该功能仅兼容平板设备，不兼容折叠屏设备！</p>,
								});
								return;
							}
							openUpdateEmbeddedApp(row, index);
						},
					},
					fullScreen: {
						type: 'info',
						name: '全屏',
						onClick(row: EmbeddedMergeRuleItem, index: number) {
							if (deviceStore.deviceType !== 'tablet') {
								modal.create({
									title: '不兼容说明',
									type: 'warning',
									preset: 'dialog',
									content: () => <p>该功能仅兼容平板设备不兼容折叠屏设备！</p>,
								});
								return;
							}
							openUpdateEmbeddedApp(row, index);
						},
					},
					fixedOrientation: {
						type: 'warning',
						name: '居中布局',
						onClick(row: EmbeddedMergeRuleItem, index: number) {
							if (deviceStore.deviceType !== 'tablet') {
								modal.create({
									title: '不兼容说明',
									type: 'warning',
									preset: 'dialog',
									content: () => <p>该功能仅兼容平板设备，不兼容折叠屏设备！</p>,
								});
								return;
							}
							openUpdateEmbeddedApp(row, index);
						},
					},
					disabled: {
						type: 'error',
						name: '原始布局',
						onClick(row: EmbeddedMergeRuleItem, index: number) {
							if (deviceStore.deviceType !== 'tablet') {
								modal.create({
									title: '不兼容说明',
									type: 'warning',
									preset: 'dialog',
									content: () => <p>该功能仅兼容平板设备，不兼容折叠屏设备！</p>,
								});
								return;
							}
							openUpdateEmbeddedApp(row, index);
						},
					},
				};
				return (
					<n-button
						size='small'
						strong
						v-slots={slots}
						dashed
						type={modeMap[row.settingMode].type}
						onClick={() => modeMap[row.settingMode].onClick(row, index)}>
						{modeMap[row.settingMode].name}
					</n-button>
				);
			},
		},
	];
}

onMounted(() => {
	watchEffect(() => {
		if (embeddedStore.isNeedShowReloadPathModeDialog) {
			nextTick(async () => {
				const [, positiveRes] = await $to(
					new Promise((resolve, reject) => {
						modal.create({
							title: '是否需要重新生成定制应用数据？',
							type: 'info',
							preset: 'dialog',
							content: () => (
								<p>
									检测到您最近已经更新了模块版本并且开启了{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										定制模式
									</span>{' '}
									，模块需要重新操作{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										生成定制应用数据
									</span>{' '}
									，确定要继续吗？
								</p>
							),
							positiveText: '确定',
							negativeText: '取消',
							onPositiveClick() {
								resolve('success');
							},
							onNegativeClick() {
								reject('cancel');
							},
							onMaskClick() {
								reject('cancel');
							},
							onClose() {
								reject('cancel');
							},
						});
					}),
				);
				if (positiveRes) {
					reloadPatchModeConfigList();
				}
				embeddedStore.isNeedShowReloadPathModeDialog = false;
				deviceStore.needReloadData = false;
			});
		}
	});
});
</script>

<template>
	<main class="mb-10">
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
						>应用横屏布局</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					应用横屏布局，优化应用在横屏下的体验。
				</p>
			</div>
		</div>
		<n-card size="small">
			<n-alert
				type="info"
				class="mb-3"
				v-if="!deviceStore.skipConfirm.patchModeAlert"
				closable
				@close="
					() => {
						deviceStore.skipConfirm.patchModeAlert = true;
					}
				">
				由于小米系统优化不佳的原因，大量的应用适配规则可能导致系统出现卡顿、掉帧等问题，建议老机型可以前往开启模块的定制模式，详情可以前往模块设置中了解。
			</n-alert>
			<div class="flex flex-wrap">
				<n-button
					class="mb-3 mr-3"
					type="info"
					:loading="deviceStore.loading || embeddedStore.loading"
					@click="openAddEmbeddedApp">
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
					:loading="deviceStore.loading || embeddedStore.loading"
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
					:loading="deviceStore.loading || embeddedStore.loading || hotReloadLoading"
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
					v-if="embeddedStore.isPatchMode"
					type="error"
					:loading="deviceStore.loading || embeddedStore.loading || reloadPatchModeConfigLoading"
					@click="() => reloadPatchModeConfigList()">
					<template #icon>
						<n-icon>
							<ScissorsIcon />
						</n-icon>
					</template>
					生成定制应用数据
				</n-button>
				<n-button
					class="mb-3 mr-3"
					color="#69b2b6"
					:loading="deviceStore.loading || embeddedStore.loading || installedAppNamesHook.loading.value"
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
					:loading="deviceStore.loading || embeddedStore.loading || importShareRuleLoading"
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
					:type="embeddedStore.filterInstalledApps ? 'success' : 'info'"
					strong
					:loading="deviceStore.loading || embeddedStore.loading"
					secondary
					@click="filterHasBeenInstalledApp">
					<template #icon>
						<n-icon>
							<FunnelSolidIcon v-if="embeddedStore.filterInstalledApps" />
							<FunnelIcon v-else />
						</n-icon>
					</template>
					{{ embeddedStore.filterInstalledApps ? '已安装应用' : '全部应用' }}
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="warning"
					secondary
					:loading="deviceStore.loading || embeddedStore.loading"
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
					:loading="deviceStore.loading || embeddedStore.loading"
					@click="() => deviceApi.openVoiceAssistant()">
					<template #icon>
						<n-icon>
							<img src="/images/icons/ai_icon.png" />
						</n-icon>
					</template>
					超级小爱
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="info"
					secondary
					:loading="deviceStore.loading || embeddedStore.loading"
					@click="QQDocHook.getModal()">
					<template #icon>
						<n-icon size="16">
							<img src="/images/icons/qq_doc.png" />
						</n-icon>
					</template>
					应用适配收集表
				</n-button>
			</div>
			<div class="flex">
				<n-input-group>
					<n-input
						size="large"
						clearable
						v-model:value="embeddedStore.searchKeyWord"
						ref="searchKeyWordInput"
						placeholder="搜索应用名称/应用包名"
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
								embeddedStore.searchKeyWord = '';
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
			</div>
		</n-card>
		<n-data-table
			ref="embeddedTableRef"
			size="small"
			:loading="deviceStore.loading || embeddedStore.loading"
			:columns="columns"
			class="mt-3"
			:data="embeddedStore.filterMergeRuleList"
			:pagination="pagination" />
	</main>
	<ErrorModal v-model="showErrorModal" :errorLogging="embeddedStore.errorLogging" />
	<EmbeddedAppDrawer ref="addEmbeddedApp" type="add" title="添加应用" />
	<EmbeddedAppDrawer ref="updateEmbeddedApp" type="update" title="更新应用" />
</template>
