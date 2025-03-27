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
import { ArrowDownCircleIcon } from '@heroicons/vue/24/solid';
import { useDisplayModeRecord, type DisplayModeItem } from '@/hooks/useDisplayModeRecord';
import { useFbo } from '@/hooks/useFbo';
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
const fboHook = useFbo();
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
const switchDeepPatchModeLoading = ref<boolean>(false);
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
			embeddedApi.updateEmbeddedApp(),
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
								界面重新{' '}
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
const changeDeepPatchMode = async (value: boolean) => {
	const [negativeRes, positiveRes] = await $to(
		new Promise((resolve, reject) => {
			modal.create({
				title: value ? '想启用深度定制模式吗？' : '想关闭深度定制模式吗？',
				type: 'info',
				preset: 'dialog',
				content: () => (
					<div>
						{value && (
							<p>
								启用{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									深度定制模式
								</span>{' '}
								后，模块将仅根据{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									当前已安装应用修剪模块应用适配列表
								</span>{' '}
								，不再提供{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									高频应用适配列表
								</span>{' '}作为兜底，可以进一步优化老机型由于系统优化不佳而导致的卡顿、掉帧等问题，但后续每次更新模块或者安装新的应用后，均需要前往{' '}
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
								关闭{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									深度定制模式
								</span>{' '}
								后，模块会以更符合大多数人的设备整体应用情况{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									修剪模块应用适配列表
								</span>{' '}
								，确定要继续吗？
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
		switchDeepPatchModeLoading.value = true;
		const [removeIsDeepPatchModeErr] = await $to(deviceApi.removeIsDeepPatchMode());
		if (removeIsDeepPatchModeErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>无法移除深度定制模式的配置项，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
			switchDeepPatchModeLoading.value = false;
			return;
		}
		if (value) {
			const [addIsDeepPatchModeErr] = await $to(deviceApi.addIsDeepPatchMode());
			if (addIsDeepPatchModeErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法切换为深度定制模式，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				switchDeepPatchModeLoading.value = false;
				return;
			}
			embeddedStore.isDeepPatchMode = true;
		} else {
			switchDeepPatchModeLoading.value = false;
			embeddedStore.isDeepPatchMode = false;
		}
		await deviceStore.getAndroidApplicationPackageNameList();
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
			embeddedStore.isPatchMode = !embeddedStore.isPatchMode;
			switchDeepPatchModeLoading.value = false;
		} else {
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						{value && (
							<p>
								好耶w，已成功启用{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									深度定制模式
								</span>{' '}
								，模块将仅根据当前已安装应用{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									修剪模块应用适配列表
								</span>{' '}
								，不再提供{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									高频应用适配列表
								</span>{' '}作为兜底，可以进一步解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，但后续每次更新模块或者安装新的应用后，均需要前往{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									应用横屏布局
								</span>{' '}
								界面重新{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									生成定制应用数据
								</span>{' '}
								。
							</p>
						)}
						{!value && (
							<p>
								好耶w，已成功关闭{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									深度定制模式
								</span>{' '}
								，模块会以更符合大多数人的设备整体应用情况{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									修剪模块应用适配列表
								</span>{' '}。
							</p>
						)}
					</div>
				),
				negativeText: '确定',
			});
			switchDeepPatchModeLoading.value = false;
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
	<div class="memoryHealth">
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
						>存储健康</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					存储健康，提供存储状态监测与优化管理。
				</p>
			</div>

			<div
				:class="`mt-3 border-t ${deviceStore.isDarkMode ? 'divide-sothx-gray-color border-sothx-gray-color' : 'divide-gray-200 border-gray-200'}`">
				<dl :class="`divide-y ${deviceStore.isDarkMode ? 'divide-sothx-gray-color' : 'divide-gray-200'}`">
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
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35 &&
							ZRAMWritebackHook.isInit.value
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
					<div
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
					<div v-if="fboHook.isInit.value" class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
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
								@click="() => deviceApi.openFboResultActivity()">
								打开 焕新存储信息面板
							</n-button>
							<n-alert class="mb-5 mt-5" type="success" :show-icon="false" :bordered="false">
								<div>
									<p
										>焕新存储启用状态:<n-button
											size="tiny"
											class="ml-3"
											:type="fboHook.fboEnable.value ? 'success' : 'error'"
											:loading="deviceStore.loading"
											@click="() => fboHook.handleEnableFbo()">
											{{ fboHook.fboEnable.value ? '已启用' : '未启用(点击启用)' }}
										</n-button>
									</p>
									<p
										>启用状态通常由小米云控控制，模块支持强制启用焕新存储，但该功能受系统底层支持情况而异，不支持的设备即使启用也不会生效。</p
									>
									<n-switch
										@update:value="(value: boolean) => fboHook.changeIsAutoEnableFbo(value)"
										:rail-style="railStyle"
										:value="fboHook.isAutoStartFbo.value ? true : false"
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
										size="tiny"
										class="ml-3"
										:type="fboHook.fboServiceCtrl.value ? 'success' : 'error'"
										:loading="deviceStore.loading"
										@click="() => fboHook.handleEnableFboServiceCtrl()">
										{{ fboHook.fboServiceCtrl.value ? '已激活' : '未激活(点击激活)' }}
									</n-button>
								</p>
								<p v-if="fboHook.fboInstalld.value" class="mt-1"
									>焕新存储运行状态:<n-tag
										size="small"
										class="ml-3"
										:type="'info'"
										:loading="deviceStore.loading"
										@click="() => {}">
										{{ fboHook.fboInstalld.value }}
									</n-tag>
								</p>
								<p>激活后仍然需要满足以下条件才会在特定时间触发焕新存储：</p>
								<p>①夜间12点半-凌晨5点</p>
								<p>②息屏状态</p>
								<p>③电量大于75%(或保持手机充电)</p>
								<p>④电池温度小于40℃</p>
								<p
									>进行焕新存储期间检测到其中任意条件不满足，焕新存储会被中断，待满足后继续执行，当满足上述4个条件后，此功能也并不是每天都生效，需要文件碎片累积到一定程度会主动进行。</p
								>
								<p>（焕新存储流程结束后，激活状态会被关闭，您可以前往Web UI 重新激活）</p>
								<n-switch
									@update:value="(value: boolean) => fboHook.changeIsAutoRegularlyFbo(value)"
									:rail-style="railStyle"
									:value="fboHook.isAutoRegularlyFbo.value ? true : false"
									:loading="deviceStore.loading">
									<template #checked>已启用每日闲时维护</template>
									<template #unchecked>未启用每日闲时维护</template>
								</n-switch>
							</n-alert>
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
