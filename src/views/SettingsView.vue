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
import { useRealQuantity } from '@/hooks/useRealQuantity';
import { useHideGestureLine } from '@/hooks/useHideGestureLine';
import { useDisabledOS2SystemAppOptimize } from '@/hooks/useDisabledOS2SystemAppOptimize';
import { useZRAMWriteback } from '@/hooks/useZRAMWriteback';
import { useOS2InstallModuleTips } from '@/hooks/useOS2InstallModuleTips';
import { useUFSHealth } from '@/hooks/useUFSHealth';
import {
	ArrowDownCircleIcon,
} from '@heroicons/vue/24/solid';
import { useDisplayModeRecord, type DisplayModeItem } from '@/hooks/useDisplayModeRecord';
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();
const realQuantityHook = useRealQuantity();
const displayModeRecordHook = useDisplayModeRecord();
const hideGestureLineHook = useHideGestureLine();
const disabledOS2SystemAppOptimizeHook = useDisabledOS2SystemAppOptimize();
const ZRAMWritebackHook = useZRAMWriteback();
const { activateABTest, loading: activateABTestLoading } = useABTestActivation();
const OS2InstallModuleTipsHook = useOS2InstallModuleTips();
const useUFSHealthHook = useUFSHealth();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
const gameModeHook = useGameMode();
const fontStore = useFontStore();
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
const getAppDownload = async (title: string, url: string, type: 'system' | 'revision' | 'original' | 'magisk') => {
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
					{type === 'magisk' && <span>（Tips: Magisk模块请通过ROOT管理器进行安装）</span>}
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
				...(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
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
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
						">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							模块使用须知
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => OS2InstallModuleTipsHook.change(value)"
								:rail-style="railStyle"
								:value="deviceStore.isDisabledOS2InstallModuleTips"
								:disabled="deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 35">
								<template #checked>禁用模块使用须知</template>
								<template #unchecked>开启模块使用须知</template>
							</n-switch>
						</dd>
					</div>
					<div
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
						">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							系统应用横屏优化
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => disabledOS2SystemAppOptimizeHook.change(value)"
								:rail-style="railStyle"
								:value="deviceStore.isDisabledOS2SystemAppOptimize"
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
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`"
							v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 1"
							>智能IO调度</dt
						>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-tag v-if="deviceStore.smartFocusIO === 'on'" type="success">已启用智能IO调度</n-tag>
							<n-tag v-else type="info">已启用系统默认调度</n-tag>
							<n-alert
								class="mt-5"
								v-if="
									deviceStore.deviceInfo.socModel === 'SM8475' &&
									deviceStore.androidTargetSdk &&
									deviceStore.androidTargetSdk >= 34 &&
									deviceStore.smartFocusIO !== 'on'
								"
								type="warning"
								:show-icon="false"
								:bordered="false">
								<p
									>您当前未启用「智能IO调度」，由于小米「磁盘IO调度」BUG，骁龙8+Gen1机型存在IO调度异常的问题，容易导致系统卡顿或者无响应，您可以通过安装「小米平板系统功能补全模块」来启用「智能IO调度」，提升系统IO性能体验。</p
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
												'小米平板系统功能补全模块',
												'https://caiyun.139.com/m/i?135CmUuWuqGsk',
												'original',
											)
									"
									>获取小米平板系统功能补全模块</n-button
								>
							</n-alert>
						</dd>
					</div>
					<div
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
						">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`"
							>ZRAM Writeback</dt
						>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div
								class="mb-3"
								v-if="
									deviceStore.MIOSVersion &&
									deviceStore.MIOSVersion >= 2 &&
									deviceStore.androidTargetSdk >= 35
								"
								><n-tag
									>dm设备映射器: {{ ZRAMWritebackHook.miuiExtmDmOptEnable ? '启用' : '未启用' }}
								</n-tag></div
							>
							<div class="mb-3"
								><n-tag type="error">回写块: {{ ZRAMWritebackHook.backingDev }} </n-tag></div
							>
							<div class="mb-3"
								><n-tag type="success">已回写: {{ ZRAMWritebackHook.hasWriteBack }} MB</n-tag></div
							>
							<div class="mb-3"
								><n-tag type="info">总读取: {{ ZRAMWritebackHook.totalRead }} MB</n-tag></div
							>
							<div
								><n-tag type="warning">总回写: {{ ZRAMWritebackHook.totalWriteBack }} MB</n-tag></div
							>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false">
								<p
									>通常用于将设备上的冷数据压缩并迁移到磁盘上，是基于「内存扩展」的回写块，该功能依赖「内存扩展」，请确保已经开启「内存扩展」，总回写可以大于「内存扩展」，初始状态下显示
									0 MB是正常现象，请持续使用一段时间再观察是否有变化</p
								>
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
					<div id="gameModeSettings" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							游戏显示布局
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => gameModeHook.changeGameMode(value)"
								:value="gameModeHook.isSupportGameMode"
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
								:value="deviceStore.currentIsHideGestureLine === 1 ? true : false">
								<template #checked>隐藏手势提示线</template>
								<template #unchecked>显示手势提示线</template>
							</n-switch>
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
							<!-- <n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p>您已配置xxxx的自启动，如需重新配置请先【移除】该配置！</p>
							</n-alert> -->
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
					<div v-if="deviceStore.DDRVendor" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							设备DDR生产厂商
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div class="whitespace-pre">{{ deviceStore.DDRVendor }}</div>
						</dd>
					</div>
					<div
						id="displayModeSettings"
						v-if="useUFSHealthHook.isShow.value"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							UFS 存储健康
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div class="mb-3">
								<div v-if="useUFSHealthHook.correctedPreEOLStatus.value" class="mb-3"
									><n-tag type="info"
										>寿命阶段: {{ useUFSHealthHook.correctedPreEOLStatus.value }}</n-tag
									></div
								>
								<div v-if="useUFSHealthHook.deviceLifeTimeEstA.value" class="mb-3"
									><n-tag type="success"
										>用户数据区(已磨损): {{ useUFSHealthHook.deviceLifeTimeEstA.value }}</n-tag
									></div
								>
								<div v-if="useUFSHealthHook.deviceLifeTimeEstB.value" class="mb-3"
									><n-tag type="warning"
										>高速缓存区(已磨损): {{ useUFSHealthHook.deviceLifeTimeEstB.value }}</n-tag
									></div
								>
							</div>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p
									>数据仅供参考，通常仅代表当前 UFS 存储设备循环擦写次数与预期设计寿命的比值，不代表
									UFS 存储设备的实际磨损状况，但仍然建议当前 UFS
									存储设备接近预期设计寿命时选择更换存储设备。</p
								>
							</n-alert>
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
								v-for="(item, index) in displayModeRecordHook.supportHDRTypes.value"
								:key="index">
								<p v-if="item === 1" class="mr-3">{{ 'HLG' }}</p>
								<p v-if="item === 2" class="mr-3">{{ 'HDR10' }}</p>
								<p v-if="item === 3" class="mr-3">{{ 'HDR10+' }}</p>
								<p v-if="item === 4" class="mr-3">{{ 'Dolby Vision' }}</p>
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
								<p>在设备保修期内健康度低于80%可以申请电池质保</p>
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
								<p>在设备保修期内健康度低于80%可以申请电池质保</p>
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
								<p>在设备保修期内健康度低于80%可以申请电池质保</p>
							</n-alert>
						</dd>
					</div>
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
