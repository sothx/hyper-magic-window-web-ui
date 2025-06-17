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
import { RenderJsx } from '@/components/RenderJSX';
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
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/vue/24/outline';
import { useDisplayModeRecord, type DisplayModeItem } from '@/hooks/useDisplayModeRecord';
import type { JSX } from 'vue/jsx-runtime';
const deviceStore = useDeviceStore();
const searchKeyword = ref('');
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const embeddedStore = useEmbeddedStore();
const realQuantityHook = useRealQuantity();
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

interface FontModeOption {
	label: string;
	key: string;
	type: string;
}

const fontModeOptions = ref<FontModeOption[]>([
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

const fontModeMap = computed<Record<string, FontModeOption>>(() => {
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
				class: 'responsive-modal',
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
			deviceApi.openChinaMobileMCloud();
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
		const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(embeddedApi.updateEmbeddedApp());
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
								</span>{' '}
								作为兜底，可以进一步优化老机型由于系统优化不佳而导致的卡顿、掉帧等问题，但后续每次更新模块或者安装新的应用后，均需要前往{' '}
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
		const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(embeddedApi.updateEmbeddedApp());
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
								</span>{' '}
								作为兜底，可以进一步解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，但后续每次更新模块或者安装新的应用后，均需要前往{' '}
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
								</span>{' '}
								。
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
export interface SettingItemInfo {
	title: string;
	titleSlot?: () => JSX.Element;
	content: () => JSX.Element;
	isShow?: () => boolean;
}
const settingList: SettingItemInfo[] = [
	{
		title: '模块ID',
		content: () => <>{deviceStore.moduleInfo?.id ?? '获取失败'}</>,
		isShow: () => Boolean(deviceStore.moduleInfo?.id),
	},
	{
		title: '模块路径',
		content: () => <>{deviceStore.moduleInfo?.dir ?? '获取失败'}</>,
		isShow: () => Boolean(deviceStore.moduleInfo?.id),
	},
	{
		title: '模块版本名',
		content: () => <>{deviceStore.moduleInfo?.version ?? '获取失败'}</>,
		isShow: () => Boolean(deviceStore.moduleInfo?.version),
	},
	{
		title: '模块版本号',
		content: () => <>{deviceStore.moduleInfo?.versionCode ?? '获取失败'}</>,
		isShow: () => Boolean(deviceStore.moduleInfo?.versionCode),
	},
	{
		title: '模块工作模式',
		content: () => (
			<>
				<n-switch
					value={embeddedStore.isPatchMode}
					loading={switchPatchModeLoading.value}
					disabled={deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32}
					railStyle={railStyle}
					onUpdateValue={(value: boolean) => changePatchMode(value)}>
					{{
						checked: () => '定制模式',
						unchecked: () => '完整模式',
					}}
				</n-switch>
				{embeddedStore.isPatchMode && (
					<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
						<p>
							「定制模式」还额外提供了仅根据当前「已安装应用列表」修剪「模块应用适配列表」的功能，
							您可以通过启用「深度定制模式」来开启该功能，但启用后模块不再提供「高频应用适配列表」作为兜底，
							可以进一步优化老机型由于系统优化不佳而导致的卡顿、掉帧等问题，
							但后续每次更新模块或者安装新的应用后，均需要在前往「应用横屏布局」界面重新「生成定制应用数据」。
						</p>
						<n-switch
							class='mt-5'
							value={embeddedStore.isDeepPatchMode}
							loading={switchPatchModeLoading.value}
							disabled={deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32}
							railStyle={railStyle}
							onUpdateValue={(value: boolean) => changeDeepPatchMode(value)}>
							{{
								checked: () => '已启用深度定制模式',
								unchecked: () => '未启用深度定制模式',
							}}
						</n-switch>
					</n-alert>
				)}
			</>
		),
		isShow: () => Boolean(['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '模块使用须知',
		content: () => (
			<n-switch
				value={deviceStore.isDisabledOS2InstallModuleTips}
				disabled={deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 35}
				railStyle={railStyle}
				onUpdateValue={(value: boolean) => OS2InstallModuleTipsHook.change(value)}>
				{{
					checked: () => '禁用模块使用须知',
					unchecked: () => '开启模块使用须知',
				}}
			</n-switch>
		),
		isShow: () =>
			Boolean(
				deviceStore.MIOSVersion &&
					deviceStore.MIOSVersion >= 2 &&
					deviceStore.androidTargetSdk >= 35 &&
					['tablet', 'fold'].includes(deviceStore.deviceType),
			),
	},
	{
		title: '系统应用横屏优化',
		content: () => (
			<>
				<n-switch
					value={deviceStore.isDisabledOS2SystemAppOptimize}
					loading={deviceStore.loading}
					railStyle={railStyle}
					onUpdateValue={(value: boolean) => disabledOS2SystemAppOptimizeHook.change(value)}>
					{{
						checked: () => '已禁用系统应用横屏优化',
						unchecked: () => '已启用系统应用横屏优化',
					}}
				</n-switch>

				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>
						由于小米「应用横屏布局」BUG，Hyper OS 2 下部分系统应用可无法完全横屏工作，模块可以修复这个问题，
						但每次设备重启或修改模块规则，这些系统应用都将被强制重启，该功能默认启用，
						如「启用」将代表已接纳并知晓此副作用影响。
					</p>
					<p>受此影响的系统应用：</p>
					<p>超级小爱(com.miui.voiceassist)</p>
					<p>小米浏览器(com.android.browser)</p>
					<p>平板/手机管家(com.miui.securitycenter)</p>
				</n-alert>
			</>
		),
		isShow: () =>
			Boolean(
				deviceStore.MIOSVersion &&
					deviceStore.MIOSVersion >= 2 &&
					deviceStore.androidTargetSdk >= 35 &&
					['tablet'].includes(deviceStore.deviceType),
			),
	},
	{
		title: '智能IO调度',
		content: () => (
			<>
				{deviceStore.smartFocusIO === 'on' ? (
					<n-tag type='success'>已启用智能IO调度</n-tag>
				) : (
					<n-tag type='info'>已启用系统默认调度</n-tag>
				)}

				{deviceStore.deviceInfo.socModel === 'SM8475' &&
					deviceStore.androidTargetSdk &&
					deviceStore.androidTargetSdk >= 34 &&
					deviceStore.smartFocusIO !== 'on' &&
					['tablet', 'fold'].includes(deviceStore.deviceType) && (
						<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
							<p>
								您当前未启用「智能IO调度」，由于小米「磁盘IO调度」BUG，骁龙8+Gen1机型存在IO调度异常的问题，
								容易导致系统卡顿或者无响应，您可以通过安装「小米平板系统功能补全模块」来启用「智能IO调度」，提升系统IO性能体验。
							</p>
							<n-button
								class='mt-2'
								strong
								size='small'
								secondary
								type='warning'
								onClick={() =>
									getAppDownload(
										'小米平板系统功能补全模块',
										'https://caiyun.139.com/m/i?135CmUuWuqGsk',
										'magisk',
									)
								}>
								获取小米平板系统功能补全模块
							</n-button>
						</n-alert>
					)}

				{deviceStore.deviceInfo.socModel === 'SM8475' &&
					deviceStore.androidTargetSdk &&
					deviceStore.androidTargetSdk >= 34 &&
					deviceStore.smartFocusIO !== 'on' &&
					['phone'].includes(deviceStore.deviceType) && (
						<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
							<p>
								您当前未启用「智能IO调度」，由于小米「磁盘IO调度」BUG，骁龙8+Gen1机型存在IO调度异常的问题，
								容易导致系统卡顿或者无响应，您可以通过安装「小米手机系统功能补全模块」来启用「智能IO调度」，提升系统IO性能体验。
							</p>
							<n-button
								class='mt-2'
								strong
								size='small'
								secondary
								type='warning'
								onClick={() =>
									getAppDownload(
										'小米手机系统功能补全模块',
										'https://caiyun.139.com/m/i?135CmOdNLkQeu',
										'magisk',
									)
								}>
								获取小米平板系统功能补全模块
							</n-button>
						</n-alert>
					)}
			</>
		),
		isShow: () =>
			Boolean(
				deviceStore.deviceInfo.socModel === 'SM8475' &&
					deviceStore.androidTargetSdk &&
					deviceStore.androidTargetSdk >= 34 &&
					deviceStore.smartFocusIO !== 'on' &&
					['phone'].includes(deviceStore.deviceType),
			),
	},
	{
		title: 'ZRAM Writeback',
		content: () => (
			<>
				<div class='mb-3'>
					<n-tag>dm设备映射器: {ZRAMWritebackHook.miuiExtmDmOptEnable.value ? '启用' : '未启用'}</n-tag>
				</div>
				<div class='mb-3'>
					<n-tag type='error'>回写块: {ZRAMWritebackHook.backingDev.value}</n-tag>
				</div>

				<div class='mb-3'>
					<n-tag type='success'>已回写: {ZRAMWritebackHook.hasWriteBack.value} MB</n-tag>
				</div>

				<div class='mb-3'>
					<n-tag type='info'>总读取: {ZRAMWritebackHook.totalRead.value} MB</n-tag>
				</div>

				<div>
					<n-tag type='warning'>总回写: {ZRAMWritebackHook.totalWriteBack.value} MB</n-tag>
				</div>

				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>
						通常用于将设备上的冷数据压缩并迁移到磁盘上，是基于「内存扩展」的回写块，
						该功能依赖「内存扩展」，请确保已经开启「内存扩展」，总回写可以大于「内存扩展」， 初始状态下显示
						0 MB是正常现象，请持续使用一段时间再观察是否有变化
					</p>
				</n-alert>
			</>
		),
		isShow: () =>
			Boolean(
				deviceStore.MIOSVersion &&
					deviceStore.MIOSVersion >= 2 &&
					deviceStore.androidTargetSdk >= 35 &&
					ZRAMWritebackHook.isInit.value &&
					['tablet', 'fold'].includes(deviceStore.deviceType),
			),
	},
	{
		title: '设备名称',
		content: () => <>{deviceStore.deviceName || ''}</>,
		isShow: () => Boolean(deviceStore.deviceName),
	},
	{
		title: 'ROOT管理器',
		content: () => <>{deviceStore.currentRootManager || '获取失败'}</>,
	},
	{
		title: 'KernelSU 版本',
		content: () => <>{deviceStore.rootManagerInfo.KSU_VER || '获取失败'}</>,
		isShow: () => Boolean(deviceStore.currentRootManager === 'KernelSU'),
	},
	{
		title: 'KernelSU 用户空间版本号',
		content: () => <>{deviceStore.rootManagerInfo.KSU_VER_CODE || '获取失败'}</>,
		isShow: () => Boolean(deviceStore.currentRootManager === 'KernelSU'),
	},
	{
		title: 'KernelSU 内核空间版本号',
		content: () => <>{deviceStore.rootManagerInfo.KSU_KERNEL_VER_CODE || '获取失败'}</>,
		isShow: () => Boolean(deviceStore.currentRootManager === 'KernelSU'),
	},
	{
		title: 'APatch 版本名',
		content: () => <>{deviceStore.rootManagerInfo.APATCH_VER || '获取失败'}</>,
		isShow: () => Boolean(deviceStore.currentRootManager === 'APatch'),
	},
	{
		title: 'APatch 版本号',
		content: () => <>{deviceStore.rootManagerInfo.APATCH_VER_CODE || '获取失败'}</>,
		isShow: () => Boolean(deviceStore.currentRootManager === 'APatch'),
	},
	{
		title: 'Magisk 版本',
		content: () => <>{deviceStore.rootManagerInfo.MAGISK_VER || '获取失败'}</>,
		isShow: () => Boolean(deviceStore.currentRootManager === 'Magisk'),
	},
	{
		title: 'Magisk 版本号',
		content: () => <>{deviceStore.rootManagerInfo.MAGISK_VER_CODE || '获取失败'}</>,
		isShow: () => Boolean(deviceStore.currentRootManager === 'Magisk'),
	},
	{
		title: '外观模式',
		content: () => (
			<n-dropdown size='large' trigger='click' options={rhythmModeOptions} onSelect={handleSelectRhythmMode}>
				<n-button
					size='small'
					strong
					secondary
					type={deviceStore.rhythmMode === 'autoRhythm' ? 'error' : 'success'}>
					{deviceStore.rhythmMode === 'autoRhythm'
						? '跟随系统'
						: deviceStore.rhythmMode === 'lightMode'
							? '浅色模式'
							: deviceStore.rhythmMode === 'dartMode'
								? '深色模式'
								: ''}
				</n-button>
			</n-dropdown>
		),
	},
	{
		title: '应用字体',
		content: () => (
			<n-dropdown size='large' trigger='click' options={fontModeOptions} onSelect={handleSelectFontMode}>
				<n-button size='small' strong secondary type={fontModeMap.value[fontStore.currentFont]?.type ?? 'info'}>
					{fontStore.currentFont}
				</n-button>
			</n-dropdown>
		),
	},
	{
		title: '激活口令',
		content: () => (
			<n-button
				size='small'
				type='warning'
				secondary
				loading={deviceStore.loading || activateABTestLoading.value}
				onClick={() => handleActivateABTest()}>
				{{
					icon: () => (
						<n-icon>
							<ArrowDownCircleIcon />
						</n-icon>
					),
					default: () => '导入激活口令',
				}}
			</n-button>
		),
	},
	{
		title: '游戏显示布局',
		content: () => (
			<n-switch
				onUpdate:value={(value: boolean) => gameModeHook.changeGameMode(value)}
				value={gameModeHook.isSupportGameMode.value}
				rail-style={railStyle}
				disabled={
					deviceStore.deviceType !== 'tablet' ||
					(deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32)
				}>
				{{
					checked: () => <>已开启游戏显示布局</>,
					unchecked: () => (
						<>
							{deviceStore.androidTargetSdk && deviceStore.androidTargetSdk < 32
								? '不支持游戏显示布局'
								: '未开启游戏显示布局'}
						</>
					),
				}}
			</n-switch>
		),
		isShow: () =>
			Boolean(
				['tablet'].includes(deviceStore.deviceType) &&
					deviceStore.androidTargetSdk &&
					deviceStore.androidTargetSdk > 32,
			),
	},
	{
		title: '手势提示线（小白条）',
		content: () => (
			<>
				{!hideGestureLineHook.isInit.value ? (
					<n-skeleton width={137} sharp={false} round={true} size='small' />
				) : (
					<n-switch
						onUpdate:value={(value: boolean) => hideGestureLineHook.changeIsHideGestureLine(value)}
						rail-style={railStyle}
						value={hideGestureLineHook.currentIsHideGestureLine.value === 1}>
						{{
							checked: () => <>隐藏手势提示线</>,
							unchecked: () => <>显示手势提示线</>,
						}}
					</n-switch>
				)}
			</>
		),
		isShow: () =>
			Boolean(deviceStore.deviceType === 'tablet' && deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2),
	},
	{
		title: 'Xiaomi Hyper OS 版本号',
		content: () => (
			<>{`${
				deviceStore.MIOSVersion
					? `Xiaomi
							Hyper OS ${deviceStore.MIOSVersion}`
					: '当前为MIUI'
			}`}</>
		),
		isShow: () => Boolean(deviceStore.MIOSVersion),
	},
	{
		title: '系统版本',
		content: () => <>{deviceStore.systemVersion || ''}</>,
		isShow: () => Boolean(deviceStore.systemVersion),
	},
	{
		title: '上次更新的系统版本',
		content: () => <>{deviceStore.systemPreVersion || ''}</>,
		isShow: () => Boolean(deviceStore.systemPreVersion),
	},
	{
		title: 'Android Target Version',
		content: () => <>{deviceStore.androidTargetSdk || '非Android设备环境'}</>,
	},
	{
		title: '设备类型',
		content: () => (
			<>
				{deviceStore.deviceType === 'tablet'
					? '平板(Pad)'
					: deviceStore.deviceType === 'fold'
						? '折叠屏(Fold)'
						: '手机(Phone)'}
			</>
		),
	},
	{
		title: '设备Soc类型',
		content: () => (
			<>{deviceStore.deviceInfo.socModel || '获取失败'}</>
		),
		isShow: () => Boolean(deviceStore.deviceInfo.socModel),
	},
	{
		title: '设备Soc名称',
		content: () => (
			<>{deviceStore.deviceInfo.socName || '获取失败'}</>
		),
		isShow: () => Boolean(deviceStore.deviceInfo.socName),
	},
	{
		title: '设备显示器信息(display0)',
		content: () => (
			<>{deviceStore.deviceInfo.display0Panel}</>
		),
		isShow: () => Boolean(deviceStore.deviceInfo.display0Panel),
	},
	{
		title: '设备DDR和UFS信息',
		content: () => (
			<div class="whitespace-pre">{deviceStore.deviceInfo.memoryInfo ?? '获取失败'}</div>
		),
		isShow: () => Boolean(deviceStore.deviceInfo.memoryInfo && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '设备DDR生产厂商',
		content: () => (
			<div class="whitespace-pre">{deviceStore.DDRVendor ?? '获取失败'}</div>
		),
		isShow: () => Boolean(deviceStore.DDRVendor && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
		{
		title: 'UFS 存储健康',
		content: () => (
			<>
				<div class='mb-3'>
					{useUFSHealthHook.correctedPreEOLStatus.value && (
						<div class='mb-3'>
							<n-tag type='info'>寿命阶段: {useUFSHealthHook.correctedPreEOLStatus.value}</n-tag>
						</div>
					)}
					{useUFSHealthHook.deviceLifeTimeEstA.value && (
						<div class='mb-3'>
							<n-tag type='success'>
								用户数据区(已磨损): {useUFSHealthHook.deviceLifeTimeEstA.value}
							</n-tag>
						</div>
					)}
					{useUFSHealthHook.deviceLifeTimeEstB.value && (
						<div class='mb-3'>
							<n-tag type='warning'>
								高速缓存区(已磨损): {useUFSHealthHook.deviceLifeTimeEstB.value}
							</n-tag>
						</div>
					)}
				</div>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>
						数据仅供参考，通常仅代表当前 UFS 存储设备循环擦写次数与预期设计寿命的比值，不代表 UFS
						存储设备的实际磨损状况，但仍然建议当前 UFS 存储设备接近预期设计寿命时选择更换存储设备。
					</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(useUFSHealthHook.isShow.value && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
		{
		title: '真实电量（高通）',
		content: () => (
			<>
				<p>
					{`${realQuantityHook.qcomBatteryFg1RSocInfo.current} %`}
					<n-button
						class='ml-1'
						strong
						secondary
						size='small'
						type='success'
						onClick={() => realQuantityHook.qcomBatteryFg1RSocInfo.reload()}>
						手动刷新
					</n-button>
					<n-switch
						class='ml-2'
						v-model:value={realQuantityHook.qcomBatteryFg1RSocInfo.autoReload}
						rail-style={railStyle}>
						{{
							checked: () => '开启自动刷新',
							unchecked: () => '未开启自动刷新',
						}}
					</n-switch>
				</p>

				{realQuantityHook.qcomBatteryFg1RSocInfo.autoReload && (
					<div>
						<p class='my-2'>隔多少秒刷新一次</p>
						<p>
							<n-slider
								v-model:value={realQuantityHook.qcomBatteryFg1RSocInfo.timer}
								size='small'
								min={1}
								max={30}
								step={1}
							/>
							<n-input-number
								show-button={false}
								class='pt-3'
								readonly
								placeholder='请输入刷新频率间隔时间'
								v-model:value={realQuantityHook.qcomBatteryFg1RSocInfo.timer}
								min={0}
								max={30}
								step={1}
							/>
						</p>
					</div>
				)}
			</>
		),
		isShow: () => Boolean(realQuantityHook.qcomBatteryFg1RSocInfo.current && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '真实电量',
		content: () => (
			<>
				<p>
					{`${realQuantityHook.capacityRawInfo.current / 100} %`}
					<n-button
						class='ml-1'
						strong
						secondary
						size='small'
						type='success'
						onClick={() => realQuantityHook.capacityRawInfo.reload()}>
						手动刷新
					</n-button>
					<n-switch
						class='ml-2'
						v-model:value={realQuantityHook.capacityRawInfo.autoReload}
						rail-style={railStyle}>
						{{
							checked: () => '开启自动刷新',
							unchecked: () => '未开启自动刷新',
						}}
					</n-switch>
				</p>

				{realQuantityHook.capacityRawInfo.autoReload && (
					<div>
						<p class='my-2'>隔多少秒刷新一次</p>
						<p>
							<n-slider
								v-model:value={realQuantityHook.capacityRawInfo.timer}
								size='small'
								min={1}
								max={30}
								step={1}
							/>
							<n-input-number
								show-button={false}
								class='pt-3'
								readonly
								placeholder='请输入刷新频率间隔时间'
								v-model:value={realQuantityHook.capacityRawInfo.timer}
								min={0}
								max={30}
								step={1}
							/>
						</p>
					</div>
				)}
			</>
		),
		isShow: () => Boolean(realQuantityHook.capacityRawInfo.current && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '电池出厂设计容量',
		content: () => <p>{`${deviceStore.batteryInfo.chargeFullDesign / 1000} mAh`}</p>,
		isShow: () => Boolean(deviceStore.batteryInfo.chargeFullDesign && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '电池当前预估容量',
		content: () => <p>{`${deviceStore.batteryInfo.chargeFull / 1000} mAh`}</p>,
		isShow: () => Boolean(deviceStore.batteryInfo.chargeFull && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '电池循环充电次数',
		content: () => <p>{`${deviceStore.batteryInfo.cycleCount} 次`}</p>,
		isShow: () => Boolean(deviceStore.batteryInfo.cycleCount && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '电池预估健康度',
		content: () => (
			<p>
				{`${((deviceStore.batteryInfo.chargeFull / deviceStore.batteryInfo.chargeFullDesign) * 100).toFixed(
					2,
				)} %`}
			</p>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.chargeFullDesign && deviceStore.batteryInfo.chargeFull && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '电池售后健康度（高通）',
		content: () => (
			<>
				<p>{`${deviceStore.batteryInfo.sohQcom} %`}</p>
				<p>{`≈ ${Math.round(
					(deviceStore.batteryInfo.chargeFullDesign * (deviceStore.batteryInfo.sohQcom / 100)) / 1000,
				)} mAh`}</p>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>在设备保修期内健康度低于80%可以申请电池质保</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.sohQcom && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '电池售后健康度',
		content: () => (
			<>
				<p>{`${deviceStore.batteryInfo.sohMTK} %`}</p>
				<p>{`≈ ${Math.round(
					(deviceStore.batteryInfo.chargeFullDesign * (deviceStore.batteryInfo.sohMTK / 100)) / 1000,
				)} mAh`}</p>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>在设备保修期内健康度低于80%可以申请电池质保</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.sohMTK && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
	{
		title: '电池售后健康度（小米）',
		content: () => (
			<>
				<p>{`${deviceStore.batteryInfo.sohXMPower} %`}</p>
				<p>
					{`≈ ${Math.round(
						(deviceStore.batteryInfo.chargeFullDesign * (deviceStore.batteryInfo.sohXMPower / 100)) / 1000,
					)} mAh`}
				</p>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>在设备保修期内健康度低于80%可以申请电池质保</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.sohXMPower && ['tablet', 'fold'].includes(deviceStore.deviceType)),
	},
];
const filteredSettingList = computed(() => {
	const keyword = searchKeyword.value.trim().toLowerCase();
	return settingList.filter(item => {
		const showFlag = item.isShow ? item.isShow() : true;
		if (!showFlag) return false;
		if (!keyword) return true;
		return item.title.toLowerCase().includes(keyword);
	});
});
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

						<n-card size="small" class="mt-5">
				<!-- <div class="flex flex-wrap">
					<n-button class="mb-3 mr-3" color="#8a2be2">
						<template #icon>
							<n-icon>
								<SquaresPlusIcon />
							</n-icon>
						</template>
						热重载应用数据
					</n-button>
					<n-button class="mb-3 mr-3" color="#69b2b6">
						<template #icon>
							<n-icon>
								<CircleStackIcon />
							</n-icon>
						</template>
						获取已安装应用名称
					</n-button>
				</div> -->
				<div class="flex">
					<n-input-group>
						<n-input
							size="large"
							clearable
							v-model:value="searchKeyword"
							ref="searchKeyWordInput"
							placeholder="搜索设置名称"
							class="w-4/5" />
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
									searchKeyword = '';
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
				</div>
			</n-card>

			<div
				:class="`mt-3 border-t ${deviceStore.isDarkMode ? 'divide-sothx-gray-color border-sothx-gray-color' : 'divide-gray-200 border-gray-200'}`">
				<dl :class="`divide-y ${deviceStore.isDarkMode ? 'divide-sothx-gray-color' : 'divide-gray-200'}`">
					<div
						v-for="(settingItem, index) in filteredSettingList"
						:key="index"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							{{ settingItem.title }}
							<RenderJsx
								v-if="settingItem.titleSlot"
								:content="settingItem.titleSlot && settingItem.titleSlot()" />
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<RenderJsx
								v-if="settingItem.content"
								:content="settingItem.content && settingItem.content()" />
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
