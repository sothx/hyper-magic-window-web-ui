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
import { BoltIcon, CpuChipIcon, ArrowDownCircleIcon, FilmIcon } from '@heroicons/vue/24/solid';
import { useDisplayModeRecord, type DisplayModeItem } from '@/hooks/useDisplayModeRecord';
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();
const miuiDesktopModeHook = useMiuiDesktopMode();
const showNotificationIconHook = useShowNotificationIcon();
const realQuantityHook = useRealQuantity();
const displayModeRecordHook = useDisplayModeRecord();
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
							deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35 && (
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
						>外设按键映射</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					管理有关外设按键映射的配置
				</p>
			</div>
			<n-watermark
				content="开发中，尚未上线"
				cross
				fullscreen
				:font-size="16"
				:line-height="16"
				:width="384"
				:height="384"
				:x-offset="12"
				:z-index="999"
				:y-offset="60"
				:rotate="-15" />
			<div class="mt-3">
				<n-alert class="cursor-pointer" :show-icon="false" type="info"
					>该功能开发中，不会这么快上线，请勿催更，请期待后续更新。</n-alert>
				<!-- <n-alert class="cursor-pointer" :show-icon="false" type="info"
					>该功能暂时仅兼容 [小米灵感触控笔 二代] ，其他外设暂无适配计划，请等待后续更新。</n-alert
				> -->
			</div>
		</div>
	</div>
</template>

<style></style>
