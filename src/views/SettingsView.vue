<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { computed, h, ref, type CSSProperties } from 'vue';
import * as xmlFormat from '@/utils/xmlFormat';
import { createDiscreteApi, darkTheme, lightTheme, NInput, type ConfigProviderProps } from 'naive-ui';
import { useGameMode } from '@/hooks/useGameMode';
import { useABTestActivation } from '@/hooks/useABTestActivation';
import * as deviceApi from '@/apis/deviceApi';
import $to from 'await-to-js';
import { useEmbeddedStore } from '@/stores/embedded';
import { keyBy } from 'lodash-es';
import { useFontStore } from '@/stores/font';
import { findBase64InString } from '@/utils/common';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/format';
import * as embeddedApi from '@/apis/embeddedApi';
import pako from 'pako';
import { useAmktiao, type KeyboardModeOptions } from '@/hooks/useAmktiao';
import { useMiuiDesktopMode } from '@/hooks/useMiuiDesktopMode';
import { useShowNotificationIcon } from '@/hooks/useShowNotificationIconNum';
import { useRealQuantity } from '@/hooks/useRealQuantity';
import { useHideGestureLine } from '@/hooks/useHideGestureLine';
import { useInVisibleMode } from '@/hooks/useInVisibleMode';
import { useMIUIContentExtension } from '@/hooks/useMIUIContentExtension';
import { useDisabledOS2SystemAppOptimize } from '@/hooks/useDisabledOS2SystemAppOptimize';
import {
	BoltIcon,
	CpuChipIcon,
	ArrowDownCircleIcon,
	FilmIcon,
	ScissorsIcon,
	BanknotesIcon,
	ServerIcon,
	CalendarIcon,
	EyeSlashIcon,
	ViewfinderCircleIcon,
	PhoneIcon,
	BellAlertIcon,
	ServerStackIcon,
	QuestionMarkCircleIcon,
} from '@heroicons/vue/24/solid';
import { useDisplayModeRecord, type DisplayModeItem } from '@/hooks/useDisplayModeRecord';
import { useMiuiCursorStyle, type miuiCursorStyleType } from '@/hooks/useMiuiCursorStyle';
import { useMouseGestureNaturalscroll } from '@/hooks/useMouseGestureNaturalscroll';
import { usePointerSpeed } from '@/hooks/usePointerSpeed';
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();
const miuiDesktopModeHook = useMiuiDesktopMode();
const showNotificationIconHook = useShowNotificationIcon();
const MIUIContentExtensionHook = useMIUIContentExtension();
const realQuantityHook = useRealQuantity();
const displayModeRecordHook = useDisplayModeRecord();
const hideGestureLineHook = useHideGestureLine();
const inVisibleModeHook = useInVisibleMode();
const miuiCursorStyleHook = useMiuiCursorStyle();
const mouseGestureNaturalscrollHook = useMouseGestureNaturalscroll();
const pointerSpeedHook = usePointerSpeed();
const disabledOS2SystemAppOptimizeHook = useDisabledOS2SystemAppOptimize();
const { activateABTest, loading: activateABTestLoading } = useABTestActivation();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
const gameMode = useGameMode();
const fontStore = useFontStore();
const amktiaoHook = useAmktiao();
const handleSmartFocusIOChange = (value: boolean) => {
	message.info('功能尚未上线，无任何实际效果，请等待后续更新！');
};
const rhythmModeOptions = [
	{
		label: '跟随系统',
		key: 'autoRhythm',
	},
	{
		label: '浅色模式',
		key: 'lightMode',
	},
	{
		label: '深色模式',
		key: 'dartMode',
	},
];

const fontModeOptions = ref([
	{
		label: 'MiSans',
		key: 'MiSans',
		type: 'info',
	},
	{
		label: 'HarmonyOS Sans',
		key: 'HarmonyOS Sans',
		type: 'error',
	},
	{
		label: 'OPPO Sans',
		key: 'OPPO Sans',
		type: 'success',
	},
]);

const fontModeMap = computed(() => {
	return keyBy(fontModeOptions.value, 'key');
});

const handleSelectFontMode = (item: string) => {
	fontStore.currentFont = item;
};

const handleSelectRhythmMode = (item: string) => {
	deviceStore.rhythmMode = item;
	if (item === 'lightMode') {
		deviceStore.isDarkMode = false;
	}
	if (item === 'dartMode') {
		deviceStore.isDarkMode = true;
	}
};
const activateABTestTextarea = ref<string>('');
const handleActivateABTest = async () => {
	const ABTestontent = {
		GAME_BOOSTER_CUSTOM_RATIO: true,
	};
	const jsonString = JSON.stringify(ABTestontent);
	const deflate = pako.deflate(jsonString, {
		level: 9,
		memLevel: 9,
		windowBits: 15,
	});
	const compressedData = new Uint8Array(deflate);
	const base64String: string = arrayBufferToBase64(compressedData);
	console.log(base64String, 'base64String');
	activateABTestTextarea.value = '';
	const [activateABTestTextareaModalErr, activateABTestTextareaModalRes] = await $to(
		new Promise((resolve, reject) => {
			modal.create({
				title: '请粘贴激活口令',
				preset: 'dialog',
				style: 'min-width:500px; width:50%;',
				content: () =>
					h(NInput, {
						type: 'textarea',
						value: activateABTestTextarea.value,
						'onUpdate:value': newValue => {
							activateABTestTextarea.value = newValue;
						},
						autosize: { minRows: 8, maxRows: 8 },
						placeholder: '在此处粘贴激活口令',
					}),
				positiveText: '确定提交',
				negativeText: '取消',
				onPositiveClick() {
					resolve('positiveClick');
				},
			});
		}),
	);
	if (activateABTestTextareaModalRes) {
		activateABTestLoading.value = true;
		const base64StringFromClipboard: string = activateABTestTextarea.value;
		const getBase64String = findBase64InString(base64StringFromClipboard);
		if (!getBase64String?.length) {
			modal.create({
				title: '导入激活口令失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>导入激活口令失败了QwQ，解析口令发生错误，无法正常解析。</p>,
				negativeText: '确定',
			});
			activateABTestLoading.value = false;
			return;
		}
		try {
			const uint8Array: Uint8Array = base64ToArrayBuffer(getBase64String);
			const inflate = pako.inflate(uint8Array, {
				to: 'string',
			});
			const activateABTestRuleContent = JSON.parse(inflate);
			activateABTest(activateABTestRuleContent);
		} catch (error) {
			// 解析失败，处理错误
			modal.create({
				title: '解析激活口令失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>解析激活口令失败了QwQ，请检查激活口令是否有误</p>,
				negativeText: '确定',
			});
			activateABTestLoading.value = false;
		}
	}
};
const switchPatchModeLoading = ref<boolean>(false);
const changeShowRotationSuggestions = async (value: boolean) => {
	const [setRotationSuggestionsErr] = await $to(deviceApi.setRotationSuggestions(value ? 1 : 0));
	if (setRotationSuggestionsErr) {
		modal.create({
			title: '操作失败',
			type: 'error',
			preset: 'dialog',
			content: () => <p>无法 {value ? '开启' : '关闭'} 旋转建议提示按钮，详情请查看日志记录~</p>,
			negativeText: '确定',
		});
		return;
	}
	deviceStore.showRotationSuggestions = value;
};
const changeShamikoMode = async (value: boolean) => {
	deviceApi
		.putShamikoMode(value ? 'whitelist' : 'blacklist')
		.then(res => {
			deviceStore.shamikoInfo.mode = value ? 'whitelist' : 'blacklist';
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						{value && (
							<p>
								好耶w，Shamiko的工作模式已成功切换为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									白名单模式
								</span>{' '}
							</p>
						)}
						{!value && (
							<p>
								好耶w，Shamiko的工作模式已成功切换为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									黑名单模式
								</span>{' '}
							</p>
						)}
					</div>
				),
				negativeText: '确定',
			});
		})
		.catch(err => {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>无法切换Shamiko的工作模式，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		});
};
const getAppDownload = async (title: string, url: string, type: 'system' | 'revision' | 'original') => {
	modal.create({
		title: `获取${title}`,
		type: 'info',
		preset: 'dialog',
		content: () => (
			<div>
				<p>
					确定要下载{title}么？请注意核对部分应用的兼容性。
					{type === 'system' && (
						<span>（Tips: 系统应用无法通过小米自带的应用包管理器安装，请通过MT管理器安装！）</span>
					)}
					{type === 'revision' && <span>（Tips: 修改版需搭配核心破解并通过MT管理器安装）</span>}
				</p>
				<p>下载地址:</p>
				<p>{url}</p>
			</div>
		),
		positiveText: '复制下载链接到剪切板',
		negativeText: '取消',
		onPositiveClick: () => {
			navigator.clipboard.writeText(`${url}`);
		},
		onNegativeClick: () => {},
	});
};
const changePatchMode = async (value: boolean) => {
	const [negativeRes, positiveRes] = await $to(
		new Promise((resolve, reject) => {
			modal.create({
				title: value ? '想切换为定制模式吗？' : '想切换为完整模式吗？',
				type: 'info',
				preset: 'dialog',
				content: () => (
					<div>
						{value && (
							<p>
								切换为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									定制模式
								</span>{' '}
								后，模块会以您设备的整体应用情况{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									修剪模块应用适配列表
								</span>{' '}
								，以解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，后续每次更新模块或者安装新的应用后，建议前往{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									应用横屏布局
								</span>{' '}
								重新{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									生成定制应用数据
								</span>{' '}
								，确定要继续吗？
							</p>
						)}
						{!value && (
							<p>
								切换为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									完整模式
								</span>{' '}
								后，可以获得模块提供的大量应用适配，同时可能会导致部分老机型由于系统优化不佳而导致的卡顿、掉帧等问题，确定要继续吗？
							</p>
						)}
					</div>
				),
				positiveText: '确定继续',
				negativeText: '我再想想',
				onPositiveClick: () => {
					resolve('positiveClick');
				},
				onNegativeClick: () => {
					reject('negativeClick');
				},
			});
		}),
	);
	if (positiveRes) {
		switchPatchModeLoading.value = true;
		const [removeIsPatchModeErr] = await $to(deviceApi.removeIsPatchMode());
		if (removeIsPatchModeErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>无法移除定制模式的配置项，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
			switchPatchModeLoading.value = false;
			return;
		}
		if (value) {
			const [addIsPatchModeErr] = await $to(deviceApi.addIsPatchMode());
			if (addIsPatchModeErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法切换为定制模式，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				switchPatchModeLoading.value = false;
				return;
			}
			embeddedStore.isPatchMode = true;
		} else {
			switchPatchModeLoading.value = false;
			embeddedStore.isPatchMode = false;
		}
		await deviceStore.getAndroidApplicationPackageNameList();
		const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(
			embeddedApi.updateEmbeddedApp({
				isPatchMode: embeddedStore.isPatchMode,
				patchEmbeddedRulesListXML: xmlFormat.objectToXML(
					embeddedStore.patchEmbeddedRulesList,
					'package',
					'package_config',
				),
				patchFixedOrientationListXML: xmlFormat.objectToXML(
					embeddedStore.patchFixedOrientationList,
					'package',
					'package_config',
				),
				patchEmbeddedSettingConfigXML: xmlFormat.objectToXML(
					embeddedStore.patchEmbeddedSettingConfig,
					'setting',
					'setting_rule',
				),
				customEmbeddedRulesListXML: xmlFormat.objectToXML(
					embeddedStore.customConfigEmbeddedRulesList,
					'package',
					undefined,
				),
				customFixedOrientationListXML: xmlFormat.objectToXML(
					embeddedStore.customConfigFixedOrientationList,
					'package',
					undefined,
				),
				...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2
					? {
							settingConfigXML: xmlFormat.objectToXML(
								embeddedStore.customConfigEmbeddedSettingConfig,
								'setting',
								undefined,
							),
						}
					: {
							settingConfigXML: xmlFormat.objectToXML(
								embeddedStore.systemEmbeddedSettingConfig,
								'setting',
								'setting_rule',
							),
						}),
			}),
		);
		if (submitUpdateEmbeddedAppErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
			});
			embeddedStore.isPatchMode = !embeddedStore.isPatchMode;
			switchPatchModeLoading.value = false;
		} else {
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						{value && (
							<p>
								好耶w，已成功切换为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									定制模式
								</span>{' '}
								，模块已根据您设备当前的整体应用情况{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									修剪模块应用适配列表
								</span>{' '}
								，以解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，建议每次更新模块或者安装新的应用后，均需要在前往{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									应用横屏布局
								</span>{' '}
								界面重新生成{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									生成定制应用数据
								</span>{' '}
								。
							</p>
						)}
						{!value && (
							<p>
								好耶w，已成功切换为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									完整模式
								</span>{' '}
								，可以获得模块提供的大量应用适配，同时可能会导致部分老机型由于系统优化不佳而导致的卡顿、掉帧等问题。
							</p>
						)}
					</div>
				),
				negativeText: '确定',
			});
			switchPatchModeLoading.value = false;
			embeddedStore.updateMergeRuleList();
		}
	}
};
const changeGameMode = async (value: boolean) => {
	const [negativeRes, positiveRes] = await $to(
		new Promise((resolve, reject) => {
			modal.create({
				title: value ? '想开启游戏显示布局吗？' : '想关闭游戏显示布局吗？',
				type: 'info',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							{value ? '开启' : '关闭'}{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								游戏显示布局
							</span>{' '}
							后需要设备重启才会生效~
						</p>
						{value &&
							deviceStore.deviceCharacteristics === 'tablet' &&
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 && (
								<p>
									从Hyper OS 2.0开始，小米平板需要搭配配套的{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										修改版平板/手机管家
									</span>{' '}
									才能使用游戏显示布局，详情请前往模块首页了解~
								</p>
							)}
						<p>是否立即重启？</p>
					</div>
				),
				positiveText: '确认并立即重启',
				negativeText: '取消',
				onPositiveClick: () => {
					resolve('positiveClick');
				},
				onNegativeClick: () => {
					reject('negativeClick');
				},
			});
		}),
	);

	const [deleteGameModeErr] = await $to(deviceApi.deleteGameMode());
	if (deleteGameModeErr) {
		modal.create({
			title: '操作失败',
			type: 'error',
			preset: 'dialog',
			content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
			negativeText: '确定',
		});
		return;
	}
	if (value) {
		const [addGameModeErr] = await $to(deviceApi.addGameMode());
		if (addGameModeErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
			return;
		}
	}
	if (positiveRes) {
		const [rebootDeviceErr] = await $to(deviceApi.rebootDevice());
		if (rebootDeviceErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>无法重启设备，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
			return;
		}
	}
};
const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
	const style: CSSProperties = {};
	if (checked) {
		style.background = '#d03050';
		if (focused) {
			style.boxShadow = '0 0 0 2px #d0305040';
		}
	} else {
		style.background = '#2080f0';
		if (focused) {
			style.boxShadow = '0 0 0 2px #2080f040';
		}
	}
	return style;
};
</script>
<template>
	<div class="setting">
		<div class="mt-3">
			<div class="px-3 sm:px-0">
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
						>模块设置</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					模块设置，让功能在自定义中完美契合。
				</p>
			</div>

			<div
				:class="`mt-3 border-t ${deviceStore.isDarkMode ? 'divide-sothx-gray-color border-sothx-gray-color' : 'divide-gray-200 border-gray-200'}`">
				<dl :class="`divide-y ${deviceStore.isDarkMode ? 'divide-sothx-gray-color' : 'divide-gray-200'}`">
					<div v-if="deviceStore.moduleInfo?.id" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							模块ID
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.moduleInfo.id || '获取失败' }}
						</dd>
					</div>
					<div v-if="deviceStore.moduleInfo?.dir" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							模块路径
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.moduleInfo.dir || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.moduleInfo?.version"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							模块版本名
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.moduleInfo.version || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.moduleInfo?.versionCode"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							模块版本号
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.moduleInfo.versionCode || '获取失败' }}
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							模块工作模式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => changePatchMode(value)"
								:rail-style="railStyle"
								:value="embeddedStore.isPatchMode"
								:loading="switchPatchModeLoading"
								:disabled="deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32">
								<template #checked>定制模式</template>
								<template #unchecked>完整模式</template>
							</n-switch>
						</dd>
					</div>
					<div
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
						v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							系统应用横屏优化
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => disabledOS2SystemAppOptimizeHook.change(value)"
								:rail-style="railStyle"
								:value="disabledOS2SystemAppOptimizeHook.status"
								:loading="deviceStore.loading">
								<template #checked>已禁用系统应用横屏优化</template>
								<template #unchecked>已启用系统应用横屏优化</template>
							</n-switch>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false">
								<p
									>由于小米「应用横屏布局」BUG，Hyper OS 2
									下部分系统应用可无法完全横屏工作，模块可以修复这个问题，但每次设备重启或修改模块规则，这些系统应用都将被强制重启，该功能默认启用，如「启用」将代表已接纳并知晓此副作用影响。
								</p>
								<p>受此影响的系统应用：</p>
								<p>超级小爱(com.miui.voiceassist)</p>
								<p>小米浏览器(com.android.browser)</p>
								<p>平板/手机管家(com.miui.securitycenter)</p>
							</n-alert>
						</dd>
					</div>
					<div v-if="deviceStore.deviceName" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							设备名称
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.deviceName || '' }}
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							ROOT管理器
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.currentRootManager || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.currentRootManager === 'KernelSU'"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							KernelSU 版本
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.rootManagerInfo.KSU_VER || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.currentRootManager === 'KernelSU'"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							KernelSU 用户空间版本号
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.rootManagerInfo.KSU_VER_CODE || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.currentRootManager === 'KernelSU'"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							KernelSU 内核空间版本号
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.rootManagerInfo.KSU_KERNEL_VER_CODE || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.currentRootManager === 'APatch'"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							APatch 版本名
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.rootManagerInfo.APATCH_VER || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.currentRootManager === 'APatch'"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							APatch 版本号
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.rootManagerInfo.APATCH_VER_CODE || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.currentRootManager === 'Magisk'"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							Magisk 版本
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.rootManagerInfo.MAGISK_VER || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.currentRootManager === 'Magisk'"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							Magisk 版本号
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.rootManagerInfo.MAGISK_VER_CODE || '获取失败' }}
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							外观模式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-dropdown
								size="large"
								trigger="click"
								:options="rhythmModeOptions"
								@select="handleSelectRhythmMode">
								<n-button
									size="small"
									strong
									secondary
									:type="deviceStore.rhythmMode === 'autoRhythm' ? 'error' : 'success'"
									>{{
										(deviceStore.rhythmMode === 'autoRhythm' && '跟随系统') ||
										(deviceStore.rhythmMode === 'lightMode' && '浅色模式') ||
										(deviceStore.rhythmMode === 'dartMode' && '深色模式')
									}}</n-button
								>
							</n-dropdown>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							应用字体
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-dropdown
								size="large"
								trigger="click"
								:options="fontModeOptions"
								@select="handleSelectFontMode">
								<n-button
									size="small"
									strong
									secondary
									:type="fontModeMap[fontStore.currentFont].type"
									>{{ fontStore.currentFont }}</n-button
								>
							</n-dropdown>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							激活口令
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="warning"
								secondary
								:loading="deviceStore.loading || embeddedStore.loading || activateABTestLoading"
								@click="handleActivateABTest()">
								<template #icon>
									<n-icon>
										<ArrowDownCircleIcon />
									</n-icon>
								</template>
								导入激活口令
							</n-button>
						</dd>
					</div>
					<div
						v-if="deviceStore.shamikoInfo.installed"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							Shamiko 工作模式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => changeShamikoMode(value)"
								:rail-style="railStyle"
								:value="deviceStore.shamikoInfo.mode === 'whitelist' ? true : false"
								:loading="deviceStore.loading">
								<template #checked>白名单模式</template>
								<template #unchecked>黑名单模式</template>
							</n-switch>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							暗码拨号盘
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="error"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openCodeDialer()">
								<template #icon>
									<n-icon>
										<PhoneIcon />
									</n-icon>
								</template>
								暗码拨号盘
							</n-button>
							<n-alert class="mt-5" type="error" :show-icon="false" :bordered="false">
								<p>Tips: 暗码必须以*#*#开头，且以#*#*结尾</p>
								<p>eg: 开启 LSPosed 管理器的暗码：*#*#5776733#*#*</p>
								<p
									>「安全警示:
									暗码拨号器是面向开发者调试的功能，用于打开一些隐藏设定，如果您不了解暗码作用与功能建议不要轻易尝试，可能会导致您的设备数据丢失！」</p
								>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							LSPosed 管理器
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openLSPosedManger()">
								LSPosed 管理器
							</n-button>
						</dd>
					</div>
					<div
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 1 &&
							deviceStore.deviceCharacteristics === 'tablet'
						"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							<p>工作台模式</p>
							<p v-if="!deviceStore.enabledMiuiDesktopMode" class="mt-2">
								<n-button
									strong
									secondary
									size="small"
									@click="() => miuiDesktopModeHook.changeMiuiDesktopModeEnabled()"
									type="warning">
									启用功能
								</n-button>
							</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => miuiDesktopModeHook.changeMiuiDktMode(value)"
								:rail-style="railStyle"
								:disabled="!deviceStore.enabledMiuiDesktopMode"
								:value="miuiDesktopModeHook.currentMiuiDktMode"
								:loading="deviceStore.loading">
								<template #checked>工作台模式</template>
								<template #unchecked>默认桌面模式</template>
							</n-switch>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							<p>传送门</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div>
								<n-button
									size="small"
									type="info"
									secondary
									:loading="deviceStore.loading"
									@click="() => MIUIContentExtensionHook.open()">
									<template #icon>
										<img src="/images/icons/miui_content_extension_app.webp" />
									</template>
									传送门
								</n-button>
							</div>
							<n-alert
								v-if="
									MIUIContentExtensionHook.isInstallMIUIContentExtension.value &&
									deviceStore.deviceCharacteristics === 'tablet'
								"
								class="mt-5"
								type="info"
								:show-icon="false"
								:bordered="false">
								<!-- <p>「传送门」可能会导致部分应用出现「断触」或者「不跟手」的问题，请将不需要「传送门」的应用添加到「传送门」的「应用黑名单」</p> -->
								<p
									>您可以通过
									<n-button
										size="small"
										type="info"
										secondary
										:loading="deviceStore.loading"
										@click="() => MIUIContentExtensionHook.fix()">
										传送门异常修复
									</n-button>
									移除「游戏工具箱」内的「传送门」</p
								>
							</n-alert>
						</dd>
					</div>
					<div
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.deviceCharacteristics === 'tablet'
						"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							<p>WinPlay Mobile</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div>
								<n-button
									size="small"
									type="info"
									secondary
									:loading="deviceStore.loading"
									@click="() => deviceApi.openGameEngineLauncherActivity()">
									<template #icon>
										<img src="/images/icons/win_play_mobile.webp" />
									</template>
									WinPlay Mobile
								</n-button>
							</div>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p
									>「WinPlay Mobile」是为小米平板量身定做的「游戏虚拟机」，可以运行市面上常见的
									Windows 游戏。</p
								>
								<p>目前尚处于测试阶段，暂时仅支持小米平板6S Pro ~</p>
								<p>该功能依赖「AI百宝箱」和「WAE Display」，请确保已经安装这两个系统应用。</p>
							</n-alert>
						</dd>
					</div>
					<!-- <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							<p>自动开启 USB 调试</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch @update:value="(value: boolean) => miuiDesktopModeHook.changeMiuiDktMode(value)"
								:rail-style="railStyle" :disabled="!deviceStore.enabledMiuiDesktopMode"
								:value="miuiDesktopModeHook.currentMiuiDktMode" :loading="deviceStore.loading">
								<template #checked>启用自动开启 USB 调试</template>
								<template #unchecked>关闭自动开启 USB 调试</template>
							</n-switch>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>开启后每次开机会自动开启无线调试，需要保持开发者模式开关处于启用状态</p>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							<p>自动开启无线调试</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch @update:value="(value: boolean) => miuiDesktopModeHook.changeMiuiDktMode(value)"
								:rail-style="railStyle" :disabled="!deviceStore.enabledMiuiDesktopMode"
								:value="miuiDesktopModeHook.currentMiuiDktMode" :loading="deviceStore.loading">
								<template #checked>启用自动开启无线调试</template>
								<template #unchecked>关闭自动开启无线调试</template>
							</n-switch>
							<div></div>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>开启后每次开机会自动开启无线调试，需要保持开发者模式开关处于启用状态</p>
							</n-alert>
						</dd>
					</div> -->
					<!-- <div
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							通知图标显示个数
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => showNotificationIconHook.changeEnableMode(value)"
								:rail-style="railStyle"
								:value="deviceStore.isEnableShowNotificationIconNum"
								:loading="deviceStore.loading">
								<template #checked>自定义</template>
								<template #unchecked>系统默认</template>
							</n-switch>
							<div class="mt-3" v-if="deviceStore.isEnableShowNotificationIconNum">
								<n-slider
									v-model:value="showNotificationIconHook.currentNum.value"
									size="small"
									:min="0"
									@update:value="(num:number) => showNotificationIconHook.changeNum(num)"
									:max="25"
									:step="1" />
								<n-input-number
									:show-button="false"
									class="pt-3"
									readonly
									placeholder="请输入显示图标数量"
									v-model:value="showNotificationIconHook.currentNum.value"
									:min="0"
									:max="25"
									:step="1" />
							</div>
						</dd>
					</div> -->
					<div
						v-if="deviceStore.hasPenEnableControl"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							第三方触控笔管理（水龙）
							<p class="mt-2" v-if="!deviceStore.showThirdPartySetting.amktiaoROMInterface">
								<n-button
									strong
									secondary
									size="small"
									@click="() => amktiaoHook.enableSetting()"
									type="warning">
									启用功能
								</n-button>
							</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => amktiaoHook.changePenEnableMode(value)"
								:rail-style="railStyle"
								:disabled="!deviceStore.showThirdPartySetting.amktiaoROMInterface"
								:value="amktiaoHook.currentPenEnable.value ? true : false"
								:loading="deviceStore.loading">
								<template #checked>已启用</template>
								<template #unchecked>未启用</template>
							</n-switch>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false"
								>Tips:仅兼容水龙(Amktiao)的移植包，存在 /sys/touchpanel/pen_enable
								开关映射时生效</n-alert
							>
						</dd>
					</div>
					<div
						v-if="deviceStore.hasPenUpdateControl"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							手写笔驱动管理（水龙）
							<p class="mt-2" v-if="!deviceStore.showThirdPartySetting.amktiaoROMInterface">
								<n-button
									strong
									secondary
									size="small"
									@click="() => amktiaoHook.enableSetting()"
									type="warning">
									启用功能
								</n-button>
							</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => amktiaoHook.changePenUpdateMode(value)"
								:rail-style="railStyle"
								:disabled="!deviceStore.showThirdPartySetting.amktiaoROMInterface"
								:value="amktiaoHook.currentPenUpdate.value ? true : false"
								:loading="deviceStore.loading">
								<template #checked>二代笔驱动</template>
								<template #unchecked>一代笔驱动</template>
							</n-switch>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false">
								<p>Tips:仅兼容水龙(Amktiao)的移植包，存在 /sys/touchpanel/pen_update 开关映射时生效</p>
							</n-alert>
						</dd>
					</div>
					<div
						v-if="deviceStore.hasKeyboardControl"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							键盘连接器管理（水龙）
							<p class="mt-2" v-if="!deviceStore.showThirdPartySetting.amktiaoROMInterface">
								<n-button
									strong
									secondary
									size="small"
									@click="() => amktiaoHook.enableSetting()"
									type="warning">
									启用功能
								</n-button>
							</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-dropdown
								:value="amktiaoHook.currentKeyboardModeSelect"
								size="large"
								trigger="click"
								:options="amktiaoHook.keyboardModeOptions.value"
								@select="amktiaoHook.changeKeyboardMode">
								<n-button
									strong
									secondary
									:disabled="!deviceStore.showThirdPartySetting.amktiaoROMInterface"
									size="small"
									:type="amktiaoHook.currentKeyboardModeSelect.value.type">
									{{ amktiaoHook.currentKeyboardModeSelect.value.label }}
								</n-button>
							</n-dropdown>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false"
								>Tips:仅兼容水龙(Amktiao)的移植包，存在 /sys/touchpanel/keyboard 开关映射时生效</n-alert
							>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							鼠标光标样式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-dropdown
								size="large"
								trigger="click"
								:options="[
									{ label: '箭头', key: 3 },
									{ label: '圆点', key: 1 },
									{ label: '空心圆', key: 0 },
								]"
								@select="(key: miuiCursorStyleType) => { miuiCursorStyleHook.changeMiuiCursorStyleType(key) }">
								<n-button
									size="small"
									class="mb-3 mr-3"
									type="success"
									secondary
									:loading="deviceStore.loading">
									{{ (miuiCursorStyleHook.currentMiuiCursorStyleType.value === 3 && '箭头') || '' }}
									{{ (miuiCursorStyleHook.currentMiuiCursorStyleType.value === 1 && '圆点') || '' }}
									{{ (miuiCursorStyleHook.currentMiuiCursorStyleType.value === 0 && '空心圆') || '' }}
								</n-button>
							</n-dropdown>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							鼠标自然滚动
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => mouseGestureNaturalscrollHook.changeMouseGestureNaturalscroll(value)"
								:rail-style="railStyle"
								:value="
									mouseGestureNaturalscrollHook.currentMouseGestureNaturalscroll.value === 1
										? true
										: false
								">
								<template #checked>已开启鼠标自然滚动</template>
								<template #unchecked>未开启鼠标自然滚动</template>
							</n-switch>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>开启后内容随手指移动</p>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							鼠标指针速度
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-slider
								size="small"
								:min="-7"
								@update:value="(value: number) => deviceApi.setPointerSpeed(value)"
								:max="7"
								v-model:value="pointerSpeedHook.currentPointerSpeed.value"
								:step="1" />
							<n-input-number
								:show-button="false"
								class="pt-3"
								readonly
								v-model:value="pointerSpeedHook.currentPointerSpeed.value"
								placeholder="请输入鼠标指针速度"
								:min="-7"
								:max="7"
								:step="1" />
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							个性化主题导入
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="warning"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openImportThemeManger()">
								<template #icon>
									<img src="/images/apps/mi_theme.webp" />
								</template>
								导入个性化主题
							</n-button>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false">
								<p
									>需要搭配 LSPosed
									模块[主题破解]，才能够正常导入[个性化主题]，导入按钮位于界面最底部[从SD卡导入]~</p
								>
								<n-button
									class="mt-2"
									strong
									size="small"
									secondary
									type="warning"
									@click="
										() =>
											getAppDownload(
												'主题破解',
												'https://caiyun.139.com/m/i?135CmXA9aKh8Y',
												'original',
											)
									"
									>获取主题破解</n-button
								>
							</n-alert>
						</dd>
					</div>
					<div
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
						v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							AI 动态壁纸
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="error"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAiWallpaperList()">
								<template #icon>
									<img src="/images/apps/mi_theme.webp" />
								</template>
								AI 动态壁纸
							</n-button>
							<n-button
								strong
								secondary
								size="small"
								circle
								type="error"
								class="ml-2"
								@click="() => deviceApi.openAiWallpaperGuide()">
								<template #icon>
									<n-icon>
										<QuestionMarkCircleIcon />
									</n-icon>
								</template>
							</n-button>
						</dd>
					</div>
					<div
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.deviceCharacteristics === 'tablet'
						">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							算力共享
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAiDistComputeClient()">
								<template #icon>
									<img src="/images/icons/aicr.png" />
								</template>
								算力共享
							</n-button>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>在附近高算力设备提供的算力支持下，平板获得部分 AI 功能</p>
							</n-alert>
						</dd>
					</div>
					<div
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.deviceCharacteristics !== 'tablet'
						">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							算力共享
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAiDistComputeServer()">
								<template #icon>
									<img src="/images/icons/aicr.png" />
								</template>
								算力共享
							</n-button>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>将设备的 AI 算力共享给平板设备，让平板设备获得部分 AI 功能</p>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							超级小爱翻译
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="error"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAiTranslationChat()">
								<template #icon>
									<img src="/images/icons/ai_icon.png" />
								</template>
								超级小爱翻译
							</n-button>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							AI 同声传译
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="error"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAiTranslationSynchronize()">
								<template #icon>
									<img src="/images/icons/ai_icon.png" />
								</template>
								AI 同声传译
							</n-button>
							<n-alert class="mt-5" type="error" :show-icon="false" :bordered="false">
								<p
									>打电话或开会时，打开"AI
									同声传译，可以将双方的说话内容实时翻译给对方，帮助跨语言聊天。</p
								>
								<p>Tips: 如无法打开请将"小爱翻译"和"超级小爱"升级到最新版</p>
							</n-alert>
						</dd>
					</div>
					<div id="gameModeSettings" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							游戏显示布局
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => changeGameMode(value)"
								:value="gameMode.isSupportGameMode"
								:rail-style="railStyle"
								:disabled="
									deviceStore.deviceCharacteristics !== 'tablet' ||
									(deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32)
								">
								<template #checked>已开启游戏显示布局</template>
								<template #unchecked>
									{{
										deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32
											? '不支持游戏显示布局'
											: '未开启游戏显示布局'
									}}
								</template>
							</n-switch>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							旋转建议提示按钮
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => changeShowRotationSuggestions(value)"
								:rail-style="railStyle"
								:value="deviceStore.showRotationSuggestions">
								<template #checked>已启用旋转建议提示按钮</template>
								<template #unchecked>已关闭旋转建议提示按钮</template>
							</n-switch>
						</dd>
					</div>
					<div
						v-if="
							deviceStore.deviceCharacteristics === 'tablet' &&
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2
						"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							手势提示线（小白条）
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => hideGestureLineHook.changeIsHideGestureLine(value)"
								:rail-style="railStyle"
								:value="hideGestureLineHook.currentIsHideGestureLine.value === 1 ? true : false">
								<template #checked>隐藏手势提示线</template>
								<template #unchecked>显示手势提示线</template>
							</n-switch>
						</dd>
					</div>
					<n-watermark
						content="开发中，未上线"
						cross
						selectable
						:font-size="16"
						:line-height="16"
						:width="192"
						:height="128"
						:x-offset="12"
						:y-offset="28"
						:rotate="-15">
						<div
							v-if="deviceStore.shamikoInfo.installed"
							class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
							<dt
								:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
								焕新存储
							</dt>
							<dd
								:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
								<n-button
									size="small"
									type="info"
									secondary
									:loading="deviceStore.loading"
									@click="() => {}">
									打开 焕新存储信息面板
								</n-button>
								<n-alert class="mb-5 mt-5" type="success" :show-icon="false" :bordered="false">
									<div>
										<p
											>焕新存储启用状态:<n-tag
												size="small"
												class="ml-3"
												type="success"
												:loading="deviceStore.loading"
												@click="() => {}">
												已启用
											</n-tag></p
										>
										<p
											>启用状态通常由小米云控控制，模块支持强制启用焕新存储，但该功能受系统底层支持情况而异，不支持的设备即使启用也不会生效。</p
										>
										<n-switch
											@update:value="() => {}"
											:rail-style="railStyle"
											:disabled="!deviceStore.enabledMiuiDesktopMode"
											:value="miuiDesktopModeHook.currentMiuiDktMode"
											:loading="deviceStore.loading">
											<template #checked>已强制启用焕新存储</template>
											<template #unchecked>跟随系统默认云控规则</template>
										</n-switch>
									</div>
								</n-alert>
								<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
									<p
										>焕新存储激活状态:
										<n-button
											size="small"
											type="success"
											secondary
											:loading="deviceStore.loading"
											@click="() => {}">
											已激活
										</n-button>
									</p>
									<p>激活后仍然需要满足以下条件才会在特定时间触发焕新存储：</p>
									<p>①夜间12点半-凌晨5点</p>
									<p>②息屏状态</p>
									<p>③电量大于75%(或保持手机充电)</p>
									<p>④电池温度小于40℃</p>
									<p
										>进行焕新存储期间检测到其中任意条件不满足，焕新存储会被中断，待满足后继续执行。</p
									>
									<p>（焕新存储流程结束后，激活状态会被关闭，您可以前往Web UI 重新激活。）</p>
								</n-alert>
							</dd>
						</div>
					</n-watermark>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							Google 服务
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openGoogleSettings()">
								<template #icon>
									<img src="/images/icons/google.png" />
								</template>
								Google 服务
							</n-button>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>仅在开启 Google 基础服务 下生效</p>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							隐身模式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openInVisibleMode()">
								<template #icon>
									<EyeSlashIcon />
								</template>
								隐身模式
							</n-button>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>开启后系统将拒绝所有应用录音、定位和拍照，保护您的隐私安全</p>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							自动任务
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="success"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAutoTask()">
								<template #icon>
									<n-icon>
										<CalendarIcon />
									</n-icon>
								</template>
								自动任务
							</n-button>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							实时字幕
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAITranslation()">
								<template #icon>
									<n-icon>
										<FilmIcon />
									</n-icon>
								</template>
								实时字幕
							</n-button>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>Tips: 部分设备需要安装最新版"小爱翻译"或者强开「实时字幕」才能够正常使用！</p>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							Mi剪辑
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="error"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openMiFilm()">
								<template #icon>
									<n-icon>
										<ScissorsIcon />
									</n-icon>
								</template>
								Mi剪辑
							</n-button>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							极暗模式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openBrightColors()">
								<template #icon>
									<n-icon>
										<BanknotesIcon />
									</n-icon>
								</template>
								极暗模式
							</n-button>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							颜色反转
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openAccessibilityInversion()">
								<template #icon>
									<n-icon>
										<ViewfinderCircleIcon />
									</n-icon>
								</template>
								颜色反转
							</n-button>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							正在运行的服务
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openManageApplicationsActivity()">
								<template #icon>
									<n-icon>
										<ServerIcon />
									</n-icon>
								</template>
								正在运行的服务
							</n-button>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							内存使用量
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openMemorySettingsActivity()">
								<template #icon>
									<n-icon>
										<ServerStackIcon />
									</n-icon>
								</template>
								内存使用量
							</n-button>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							通知日志
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => deviceApi.openNotificationStationActivity()">
								<template #icon>
									<n-icon>
										<BellAlertIcon />
									</n-icon>
								</template>
								通知日志
							</n-button>
						</dd>
					</div>
					<div v-if="deviceStore.MIOSVersion" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							Xiaomi Hyper OS 版本号
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{
								deviceStore.MIOSVersion
									? `Xiaomi
							Hyper OS ${deviceStore.MIOSVersion}`
									: '当前为MIUI'
							}}
						</dd>
					</div>
					<div v-if="deviceStore.systemVersion" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							系统版本
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.systemVersion || '' }}
						</dd>
					</div>
					<div v-if="deviceStore.systemPreVersion" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							上次更新的系统版本
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.systemPreVersion || '' }}
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							Android Target Version
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.androidTargetSdk || '非Android设备环境' }}
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							设备类型
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.deviceCharacteristics === 'tablet' ? '平板(Pad)' : '折叠屏(Fold)' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.deviceInfo.socModel"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							设备Soc类型
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.deviceInfo.socModel || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.deviceInfo.socName"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							设备Soc名称
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							{{ deviceStore.deviceInfo.socName || '获取失败' }}
						</dd>
					</div>
					<div
						v-if="deviceStore.deviceInfo.display0Panel"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							设备显示器信息(display0)
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<!-- {{ 'mdss_dsi_m81_42_02_0b_dualdsi_dsc_lcd_video' || '获取失败' }} -->
							<p>{{ deviceStore.deviceInfo.display0Panel }}</p>
						</dd>
					</div>
					<div
						v-if="deviceStore.deviceInfo.memoryInfo"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							设备DDR和UFS信息
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div class="whitespace-pre">{{ deviceStore.deviceInfo.memoryInfo || '获取失败' }}</div>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							性能监视器
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-dropdown
								size="large"
								trigger="click"
								:options="[
									{ label: '打开性能监视器', key: 'start' },
									{ label: '关闭性能监视器', key: 'stop' },
								]"
								@select="(key: 'start' | 'stop') => { deviceApi.frameRateService(key) }">
								<n-button
									size="small"
									class="mb-3 mr-3"
									type="info"
									color="#8a2be2"
									secondary
									:loading="deviceStore.loading">
									<template #icon>
										<n-icon>
											<CpuChipIcon />
										</n-icon>
									</template>
									性能监视器
								</n-button>
							</n-dropdown>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							帧率监视器
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-dropdown
								size="large"
								trigger="click"
								:options="[
									{ label: '打开帧率监视器', key: 'open' },
									{ label: '关闭帧率监视器', key: 'close' },
								]"
								@select="(key: string) => { key === 'open' ? deviceApi.setFpsFrameService(true) : deviceApi.setFpsFrameService(false) }">
								<n-button
									size="small"
									class="mb-3 mr-3"
									type="info"
									secondary
									:loading="deviceStore.loading">
									<template #icon>
										<n-icon>
											<BoltIcon />
										</n-icon>
									</template>
									帧率监视器
								</n-button>
							</n-dropdown>
						</dd>
					</div>
					<div
						v-if="displayModeRecordHook.formatDisplayModeList.value.length"
						id="displayModeSettings"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							分辨率及刷新率
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div
								class="mb-3 flex"
								v-for="item in displayModeRecordHook.formatDisplayModeList.value"
								:key="item.id">
								<p class="mr-3">ID: {{ item.id }}</p>
								<p class="mr-3">分辨率: {{ `${item.width}x${item.height}` }}</p>
								<p class="mr-3">刷新率: {{ `${item.fps} Hz` }}</p>
								<n-button
									size="small"
									type="info"
									secondary
									:loading="deviceStore.loading"
									@click="() => displayModeRecordHook.selectDisplayMode(item)">
									应用该配置
								</n-button>
							</div>
						</dd>
					</div>
					<div
						v-if="displayModeRecordHook.supportHDRTypes.value.length"
						id="displayModeSettings"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							支持的 HDR 类型
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div
								class="mb-3 flex"
								v-for="(item,index) in displayModeRecordHook.supportHDRTypes.value"
								:key="index">
								<p v-if="item === 1" class="mr-3">{{ 'HLG'  }}</p>
								<p v-if="item === 2" class="mr-3">{{ 'HDR10'  }}</p>
								<p v-if="item === 3" class="mr-3">{{ 'HDR10+'  }}</p>
								<p v-if="item === 4" class="mr-3">{{ 'Dolby Vision'  }}</p>
							</div>
						</dd>
					</div>
					<div
						v-if="realQuantityHook.qcomBatteryFg1RSocInfo.current"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							真实电量（高通）
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p
								>{{ `${realQuantityHook.qcomBatteryFg1RSocInfo.current} %` }}
								<n-button
									class="ml-1"
									strong
									secondary
									size="small"
									type="success"
									@click="realQuantityHook.qcomBatteryFg1RSocInfo.reload()"
									>手动刷新</n-button
								>
								<n-switch
									class="ml-2"
									v-model:value="realQuantityHook.qcomBatteryFg1RSocInfo.autoReload"
									:rail-style="railStyle">
									<template #checked>开启自动刷新</template>
									<template #unchecked>未开启自动刷新</template>
								</n-switch>
							</p>
							<div v-if="realQuantityHook.qcomBatteryFg1RSocInfo.autoReload">
								<p class="my-2"> 隔多少秒刷新一次 </p>
								<p>
									<n-slider
										v-model:value="realQuantityHook.qcomBatteryFg1RSocInfo.timer"
										size="small"
										:min="1"
										:max="30"
										:step="1" />
									<n-input-number
										:show-button="false"
										class="pt-3"
										readonly
										placeholder="请输入刷新频率间隔时间"
										v-model:value="realQuantityHook.qcomBatteryFg1RSocInfo.timer"
										:min="0"
										:max="30"
										:step="1" />
								</p>
							</div>
						</dd>
					</div>
					<div
						v-if="realQuantityHook.capacityRawInfo.current"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							真实电量
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p
								>{{ `${realQuantityHook.capacityRawInfo.current / 100} %` }}
								<n-button
									class="ml-1"
									strong
									secondary
									size="small"
									type="success"
									@click="realQuantityHook.capacityRawInfo.reload()"
									>手动刷新</n-button
								>
								<n-switch
									class="ml-2"
									v-model:value="realQuantityHook.capacityRawInfo.autoReload"
									:rail-style="railStyle">
									<template #checked>开启自动刷新</template>
									<template #unchecked>未开启自动刷新</template>
								</n-switch>
							</p>
							<div v-if="realQuantityHook.capacityRawInfo.autoReload">
								<p class="my-2"> 隔多少秒刷新一次 </p>
								<p>
									<n-slider
										v-model:value="realQuantityHook.capacityRawInfo.timer"
										size="small"
										:min="1"
										:max="30"
										:step="1" />
									<n-input-number
										:show-button="false"
										class="pt-3"
										readonly
										placeholder="请输入刷新频率间隔时间"
										v-model:value="realQuantityHook.capacityRawInfo.timer"
										:min="0"
										:max="30"
										:step="1" />
								</p>
							</div>
						</dd>
					</div>
					<div
						v-if="deviceStore.batteryInfo.chargeFullDesign"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							电池出厂设计容量
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p>{{ `${deviceStore.batteryInfo.chargeFullDesign / 1000} mAh` }}</p>
						</dd>
					</div>
					<div
						v-if="deviceStore.batteryInfo.chargeFull"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							电池当前预估容量
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p>{{ `${deviceStore.batteryInfo.chargeFull / 1000} mAh` }}</p>
						</dd>
					</div>
					<div
						v-if="deviceStore.batteryInfo.cycleCount"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							电池循环充电次数
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p>{{ `${deviceStore.batteryInfo.cycleCount} 次` }}</p>
						</dd>
					</div>
					<div
						v-if="deviceStore.batteryInfo.chargeFullDesign && deviceStore.batteryInfo.chargeFull"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							电池预估健康度
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p>{{
								`${(
									(deviceStore.batteryInfo.chargeFull / deviceStore.batteryInfo.chargeFullDesign) *
									100
								).toFixed(2)} %`
							}}</p>
						</dd>
					</div>
					<div
						v-if="deviceStore.batteryInfo.sohQcom"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							电池售后健康度（高通）
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p>{{ `${deviceStore.batteryInfo.sohQcom} %` }}</p>
							<p>{{
								`≈ ${Math.round(
									(deviceStore.batteryInfo.chargeFullDesign *
										(deviceStore.batteryInfo.sohQcom / 100)) /
										1000,
								)} mAh`
							}}</p>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>Tips:在设备保修期内健康度低于80%可以申请电池质保</p>
							</n-alert>
						</dd>
					</div>
					<div
						v-if="deviceStore.batteryInfo.sohMTK"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							电池售后健康度
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p>{{ `${deviceStore.batteryInfo.sohMTK} %` }}</p>
							<p>{{
								`≈ ${Math.round(
									(deviceStore.batteryInfo.chargeFullDesign *
										(deviceStore.batteryInfo.sohMTK / 100)) /
										1000,
								)}
								mAh`
							}}</p>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>Tips:在设备保修期内健康度低于80%可以申请电池质保</p>
							</n-alert>
						</dd>
					</div>
					<div
						v-if="deviceStore.batteryInfo.sohXMPower"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							电池售后健康度（小米）
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<p>{{ `${deviceStore.batteryInfo.sohXMPower} %` }}</p>
							<p>{{
								`≈ ${Math.round(
									(deviceStore.batteryInfo.chargeFullDesign *
										(deviceStore.batteryInfo.sohXMPower / 100)) /
										1000,
								)} mAh`
							}}</p>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>Tips:在设备保修期内健康度低于80%可以申请电池质保</p>
							</n-alert>
						</dd>
					</div>

					<!-- <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt :class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">游戏显示布局</dt>
            <dd :class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">启用(*Android 15+ 需额外搭配修改版手机/平板管家)</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt :class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">智能IO调度</dt>
            <dd :class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
              <n-switch :rail-style="railStyle" @update:value="handleSmartFocusIOChange" v-if="deviceStore.smartFocusIO"
                checked-value="on" unchecked-value="off">
                <template #checked>
                  已启用智能IO调度
                </template>
                <template #unchecked>
                  使用系统默认调度
                </template>
              </n-switch>
              <div v-else>设备不支持</div>
            </dd>
          </div> -->
					<!-- <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt :class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">Salary expectation</dt>
            <dd :class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">$120,000</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt :class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">About</dt>
            <dd :class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">Fugiat ipsum ipsum deserunt culpa
              aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint.
              Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing
              reprehenderit deserunt qui eu.</dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt :class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">Attachments</dt>
            <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul role="list" class="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div class="flex w-0 flex-1 items-center">
                    <svg class="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                      aria-hidden="true" data-slot="icon">
                      <path fill-rule="evenodd"
                        d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
                        clip-rule="evenodd" />
                    </svg>
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                      <span class="truncate font-medium">resume_back_end_developer.pdf</span>
                      <span class="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                  </div>
                </li>
                <li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div class="flex w-0 flex-1 items-center">
                    <svg class="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                      aria-hidden="true" data-slot="icon">
                      <path fill-rule="evenodd"
                        d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z"
                        clip-rule="evenodd" />
                    </svg>
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                      <span class="truncate font-medium">coverletter_back_end_developer.pdf</span>
                      <span class="flex-shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                  </div>
                </li>
              </ul>
            </dd>
          </div> -->
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
