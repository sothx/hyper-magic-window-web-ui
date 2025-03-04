<script setup lang="tsx">
import { computed, onMounted, reactive, ref, watch, type CSSProperties } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { useEmbeddedStore } from '@/stores/embedded';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type NInput } from 'naive-ui';
import * as validateFun from '@/utils/validateFun';
type NInputInstance = InstanceType<typeof NInput>;
const currentFullRuleRef = ref<NInputInstance | null>(null);
import { useLogsStore } from '@/stores/logs';
import $to from 'await-to-js';
const props = defineProps<{
	type: 'add' | 'update';
	title: string;
}>();
const emit = defineEmits(['submit']);

// Refs and stores
const activeDrawer = ref(false); // 控制drawer显示
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();
const logsStore = useLogsStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
export interface EmbeddedAppDrawerSubmitResult {
	name: string;
	settingMode: EmbeddedMergeRuleItem['settingMode'];
	thirdPartyAppOptimize?: boolean;
	modePayload: {
		fullRule?: string;
		skipSelfAdaptive?: boolean;
		isShowDivider?: boolean;
		supportFullSize?: boolean;
		ratio?: number;
		splitRatio?: number;
		foRelaunch?: boolean;
		emRelaunch?: boolean;
		forceFixedOrientation?: boolean;
		emIsDisabledPlaceholder?: boolean;
	};
	loadingCallback: () => void;
	closeCallback: () => void;
}

let resolvePromise: (result: EmbeddedAppDrawerSubmitResult) => void; // 用于保存Promise的resolve
let rejectPromise: (reason?: any) => void; // 用于保存Promise的reject

// 各类选项的定义
interface fullScreenRuleOptions {
	label: string;
	key: string;
	rule?: string;
}

interface fixedOrientationRatioOptions {
	label: string;
	key: string;
	ratio?: number;
}

const FULL_SCREEN_OPTIONS: fullScreenRuleOptions[] = [
	{
		label: '强制应用所有界面横屏[nra:cr:rcr:nr]',
		key: 'fullScreen_nra:cr:rcr:nr',
		rule: 'nra:cr:rcr:nr',
	},
	{
		label: '继承应用自身设置横屏[*]',
		key: 'fullScreen_*',
		rule: '*',
	},
	{
		label: '自定义',
		key: 'fullScreen_custom',
	},
];

const fullScreenRuleOptions = computed<fullScreenRuleOptions[]>(() => {
	const MI_OS2_OPTIONS = [
		{
			label: '默认横屏规则',
			key: 'fullScreen_default',
			rule: '',
		},
	];

	if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
		return [...MI_OS2_OPTIONS, ...FULL_SCREEN_OPTIONS];
	} else {
		return FULL_SCREEN_OPTIONS;
	}
});

const fixedOrientationRatioOptions: fixedOrientationRatioOptions[] = [
	{
		label: '大尺寸[11:10]',
		key: 'ratio_11_10',
		ratio: 1.1,
	},
	{
		label: '中尺寸',
		key: 'ratio_default',
	},
	{
		label: '小尺寸[15:10]',
		key: 'ratio_15_10',
		ratio: 1.5,
	},
	{
		label: '小尺寸[18:10]',
		key: 'ratio_18:10',
		ratio: 1.8,
	},
	{
		label: '自定义',
		key: 'ratio_custom',
	},
];

// 选项的状态
const currentFullScreenRuleOptions = ref<fullScreenRuleOptions>(fullScreenRuleOptions.value[0]);

const currentFullRule = ref<fullScreenRuleOptions['rule']>();

const currentSupportFullSize = ref<boolean>(true);

const currentRuleMode = ref<EmbeddedMergeRuleItem['ruleMode']>();

const currentType = ref<'add' | 'update'>();

const currentFixedOrientationRatio = ref<fixedOrientationRatioOptions>(fixedOrientationRatioOptions[1]);

const currentRatio = ref<number>();

const currentSplitRatio = ref<number>(0.5);

const currentForceFixedOrientation = ref<boolean>(false);

const currentIsSwitchEmbeddedCustom = ref<boolean>(false);

const currentSupportModes = ref<EmbeddedMergeRuleItem['settingMode'][]>([]);

const resizeDrawerContentFun = (isResize: boolean) => {
	const autoUIDrawerContentEl = document.querySelector('.n-drawer-content');
	if (autoUIDrawerContentEl instanceof HTMLElement) {
		logsStore.info(`resizeDrawerContent`, isResize);
		autoUIDrawerContentEl.style.height = isResize ? `calc(100% + 200px)` : `100%`;
	}
};

const handleTextAreaFocus = (ref: string) => {
	if (ref === 'currentFullRuleRef') {
		resizeDrawerContentFun(true);
		currentFullRuleRef.value?.$el.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	}
};

const handleTextAreaBlur = (ref: string) => {
	if (ref === 'currentFullRuleRef') {
		resizeDrawerContentFun(false);
		currentFullRuleRef.value?.$el.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	}
};

const changeThirdPartyAppOptimize = async (value: boolean) => {
	if (value && deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
		const [changeThirdPartyAppOptimizeCancel] = await $to(
			new Promise<string>((resolve, reject) => {
				modal.create({
					title: '确认启用第三方横屏优化吗？',
					type: 'warning',
					preset: 'dialog',
					content: () => {
						return (
							<p>
								由于小米的BUG，部分应用即使配置了横屏，在系统重启后仍然会丢失横屏配置，开启此项可以保证该应用的横屏规则不会丢失，但每次设备重启或修改模块规则，该应用都将被强制重启，确定要继续吗？
							</p>
						);
					},
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
		if (changeThirdPartyAppOptimizeCancel) {
			return;
		}
	}

	currentThirdPartyAppOptimize.value = value;
};

const embeddedAppDrawer = ref({
	openDrawer: (initialParams?: EmbeddedMergeRuleItem): Promise<EmbeddedAppDrawerSubmitResult> => {
		return new Promise((resolve, reject) => {
			if (props.type === 'update' && !initialParams) {
				reject(new Error('更新模式下必须传入初始化参数'));
				message.error('初始化参数不能为空');
				return;
			}

			// 保存Promise的resolve和reject
			resolvePromise = resolve;
			rejectPromise = reject;

			// add模式，初始化参数
			if (props.type === 'add') {
				currentType.value = 'add';
				currentFullScreenRuleOptions.value = fullScreenRuleOptions.value[0];
				currentAppName.value = '';
				currentFullRule.value =
					deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
						? ''
						: 'nra:cr:rcr:nr';
				currentSupportModes.value = ['fullScreen', 'fixedOrientation', 'disabled'];
				currentFixedOrientationRelaunch.value = false;
				currentEmbeddedRelaunch.value = false;
				currentForceFixedOrientation.value = false;
				currentIsSupportEmbeddedPlaceholder.value = false;
				currentIsDisabledEmbeddedPlaceholder.value = false;
			}

			// 如果是update模式，初始化参数
			if (props.type === 'update' && initialParams) {
				currentType.value = 'update';
				currentIsSwitchEmbeddedCustom.value = false;
				currentSplitRatio.value = 0.5;
				currentIsDisabledEmbeddedPlaceholder.value = false;
				currentRuleMode.value = initialParams.ruleMode;
				currentAppName.value = initialParams.name;
				isSupportEmbedded.value = initialParams.isSupportEmbedded;
				if (initialParams.embeddedRules && initialParams.embeddedRules.hasOwnProperty('splitRatio')) {
					currentSplitRatio.value = initialParams.embeddedRules.splitRatio ?? 0.5;
				}
				if (initialParams.embeddedRules && initialParams.embeddedRules.hasOwnProperty('relaunch')) {
					currentFixedOrientationRelaunch.value = initialParams.embeddedRules.relaunch ? true : false;
				} else {
					currentFixedOrientationRelaunch.value = true;
				}
				if (initialParams.embeddedRules && initialParams.embeddedRules.hasOwnProperty('placeholder')) {
					currentIsSupportEmbeddedPlaceholder.value = initialParams.embeddedRules.placeholder ? true : false;
				} else {
					currentIsSupportEmbeddedPlaceholder.value = false;
				}
				currentSettingMode.value = initialParams.settingMode;
				if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
					currentThirdPartyAppOptimize.value = initialParams.thirdPartyAppOptimize ?? false;
				}
				if (
					!deviceStore.MIOSVersion ||
					(deviceStore.MIOSVersion && deviceStore.MIOSVersion < 2) ||
					deviceStore.androidTargetSdk < 35
				) {
					currentSkipSelfAdaptive.value = initialParams.fixedOrientationRule?.disable ?? false;
				}
				currentIsShowDivider.value = initialParams.fixedOrientationRule?.isShowDivider ?? false;
				currentFullRule.value = initialParams.embeddedRules?.fullRule ?? undefined;
				currentForceFixedOrientation.value =
					initialParams.fixedOrientationRule?.compatChange
						?.split(',')
						.includes('OVERRIDE_UNDEFINED_ORIENTATION_TO_PORTRAIT') ?? false;
				if (currentFullRule.value === 'nra:cr:rcr:nr') {
					currentFullScreenRuleOptions.value =
						deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
							? fullScreenRuleOptions.value[1]
							: fullScreenRuleOptions.value[0];
				} else if (initialParams.embeddedRules && !initialParams.embeddedRules.hasOwnProperty('fullRule')) {
					currentFullRule.value =
						deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
							? undefined
							: 'nra:cr:rcr:nr';
					currentFullScreenRuleOptions.value =
						deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
							? fullScreenRuleOptions.value[0]
							: fullScreenRuleOptions.value[1];
				} else if (currentFullRule.value === '*') {
					currentFullScreenRuleOptions.value =
						deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
							? fullScreenRuleOptions.value[2]
							: fullScreenRuleOptions.value[1];
				} else {
					currentFullScreenRuleOptions.value =
						deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
							? fullScreenRuleOptions.value[3]
							: fullScreenRuleOptions.value[2];
				}
				currentSupportFullSize.value = initialParams.embeddedRules?.supportFullSize ?? false;
				if (
					initialParams.fixedOrientationRule &&
					initialParams.fixedOrientationRule.hasOwnProperty('relaunch')
				) {
					currentFixedOrientationRelaunch.value = initialParams.fixedOrientationRule.relaunch ? true : false;
				} else {
					currentFixedOrientationRelaunch.value = false;
				}
				currentRatio.value = initialParams.fixedOrientationRule?.ratio ?? undefined;
				if (currentRatio.value) {
					if (currentRatio.value === 1.1) {
						currentFixedOrientationRatio.value = fixedOrientationRatioOptions[0];
					} else if (currentRatio.value === 1.5) {
						currentFixedOrientationRatio.value = fixedOrientationRatioOptions[2];
					} else if (currentRatio.value === 1.8) {
						currentFixedOrientationRatio.value = fixedOrientationRatioOptions[3];
					} else {
						currentFixedOrientationRatio.value = fixedOrientationRatioOptions[4];
					}
				} else {
					currentFixedOrientationRatio.value = fixedOrientationRatioOptions[1];
				}
			}

			activeDrawer.value = true; // 打开drawer
		});
	},
	closeDrawer: () => {
		activeDrawer.value = false; // 关闭drawer
		rejectPromise('Drawer closed without submission'); // 当关闭抽屉时，Promise被拒绝
	},
});

// 选择全屏规则时更新
const handleFullScreenRuleSelect = (key: string, option: fullScreenRuleOptions) => {
	currentFullScreenRuleOptions.value = option;
	currentFullRule.value = ['fullScreen_nra:cr:rcr:nr', 'fullScreen_*'].includes(key) ? option.rule : undefined;
};

// 选择显示比例时更新
const handleFixedOrientationRatioSelect = (key: string, option: fixedOrientationRatioOptions) => {
	currentFixedOrientationRatio.value = option;
	currentRatio.value = ['ratio_11_10', 'ratio_15_10', 'ratio_18:10'].includes(key)
		? option.ratio
		: key === 'ratio_custom'
			? 1.5
			: undefined;
};

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

const currentSettingMode = ref<EmbeddedMergeRuleItem['settingMode']>('fullScreen');

const currentSkipSelfAdaptive = ref<boolean>(false);

const currentThirdPartyAppOptimize = ref<boolean>(false);

const currentIsShowDivider = ref<boolean>(true);

const currentFixedOrientationRelaunch = ref<boolean>(true);

const currentEmbeddedRelaunch = ref<boolean>(false);

const currentIsSupportEmbeddedPlaceholder = ref<boolean>(false);

const currentIsDisabledEmbeddedPlaceholder = ref<boolean>(false);

const currentAppName = ref<string>('');
const currentAppNameInputStatus = ref<string>('');

const isSupportEmbedded = ref<boolean>(false);

const handleDrawerSubmit = async () => {
	if (!currentAppName.value) {
		modal.create({
			title: '应用包名不能为空',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？应用包名不能为空（敲</p>,
		});
		return;
	}
	if (
		currentSettingMode.value === 'fullScreen' &&
		!currentFullRule.value &&
		(!deviceStore.MIOSVersion || deviceStore.MIOSVersion < 2 || deviceStore.androidTargetSdk < 35)
	) {
		modal.create({
			title: '应用全屏规则不能为空',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？应用全屏规则不能为空（敲</p>,
		});
		return;
	}
	if (props.type === 'add' && embeddedStore.allPackageName.has(currentAppName.value)) {
		modal.create({
			title: '应用包名已存在',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？这个应用包名已经存在列表中了（敲</p>,
		});
		return;
	}
	if (props.type === 'update' && isSupportEmbedded.value && currentSettingMode.value === 'fullScreen') {
		const [embeddedToFullScreenModalNegativeCancel] = await $to(
			new Promise<string>((resolve, reject) => {
				modal.create({
					title: '确认使用全屏规则吗？',
					type: 'warning',
					preset: 'dialog',
					content: () => {
						if (currentRuleMode.value === 'custom') {
							return (
								<p>
									当前应用已存在{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										平行窗口的自定义规则
									</span>{' '}
									，继续提交可能导致{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										平行窗口的自定义规则
									</span>{' '}
									丢失。确定要继续吗？
								</p>
							);
						} else {
							return (
								<p>
									当前应用已存在{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										平行窗口的模块规则
									</span>{' '}
									，继续更新将会被更替为{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										全屏规则
									</span>{' '}
									，如后续需要改回{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										平行窗口的模块规则
									</span>{' '}
									可能需要先清除自定义规则，确定要继续吗？
								</p>
							);
						}
					},
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
		if (embeddedToFullScreenModalNegativeCancel) {
			return;
		}
	}
	if (props.type === 'update' && currentRuleMode.value === 'module' && currentIsSwitchEmbeddedCustom.value) {
		const [embeddedSwitchCustomRuleModalNegative] = await $to(
			new Promise<string>((resolve, reject) => {
				modal.create({
					title: '确认使用平行窗口自定义规则吗？',
					type: 'warning',
					preset: 'dialog',
					content: () => {
						return (
							<p>
								当前应用已存在{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平行窗口的模块规则
								</span>{' '}
								，继续更新将会被更替为{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平行窗口的自定义规则
								</span>{' '}
								，且该应用规则不再随模块版本更新，如后续需要改回{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									平行窗口的模块规则
								</span>{' '}
								则需要先清除自定义规则，确定要继续吗？
							</p>
						);
					},
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
		if (embeddedSwitchCustomRuleModalNegative) {
			return;
		}
	}
	// 开启loading
	drawerSubmitLoading.value = true;

	const closeCallback = () => {
		drawerSubmitLoading.value = false;
		activeDrawer.value = false; // 关闭drawer
	};

	const loadingCallback = () => {
		drawerSubmitLoading.value = false;
	};
	const result: EmbeddedAppDrawerSubmitResult = {
		name: currentAppName.value,
		settingMode: currentSettingMode.value,
		...(deviceStore.MIOSVersion &&
			deviceStore.MIOSVersion >= 2 &&
			deviceStore.androidTargetSdk >= 35 && {
				thirdPartyAppOptimize:
					currentThirdPartyAppOptimize.value && currentSettingMode.value === 'fullScreen' ? true : false,
			}),
		modePayload: {
			...(currentSettingMode.value === 'fullScreen' && {
				fullRule: currentFullRule.value,
			}),
			...(currentSettingMode.value === 'fullScreen' &&
				(!deviceStore.MIOSVersion ||
					(deviceStore.MIOSVersion && deviceStore.MIOSVersion < 2) ||
					deviceStore.androidTargetSdk < 35) && {
					skipSelfAdaptive: currentSkipSelfAdaptive.value,
				}),
			...(currentSettingMode.value === 'fullScreen' && {
				isShowDivider: currentIsShowDivider.value,
			}),
			...(currentSettingMode.value === 'fullScreen' && {
				supportFullSize: currentSupportFullSize.value,
			}),
			...(currentSettingMode.value === 'fixedOrientation' && {
				ratio: currentRatio.value,
			}),
			...(currentSettingMode.value === 'fixedOrientation' && {
				foRelaunch: currentFixedOrientationRelaunch.value,
			}),
			...(currentSettingMode.value === 'fixedOrientation' &&
				deviceStore.MIOSVersion &&
				deviceStore.MIOSVersion >= 2 &&
				deviceStore.androidTargetSdk >= 35 && {
					forceFixedOrientation: currentForceFixedOrientation.value,
				}),
			...(currentSettingMode.value === 'embedded' &&
				(currentRuleMode.value === 'custom' ||
					(currentRuleMode.value === 'module' && currentIsSwitchEmbeddedCustom.value)) && {
					splitRatio: currentSplitRatio.value,
				}),
			...(currentSettingMode.value === 'embedded' &&
				(currentRuleMode.value === 'custom' ||
					(currentRuleMode.value === 'module' && currentIsSwitchEmbeddedCustom.value)) && {
					emRelaunch: currentEmbeddedRelaunch.value,
				}),
			...(currentSettingMode.value === 'embedded' &&
				(currentRuleMode.value === 'custom' ||
					(currentRuleMode.value === 'module' && currentIsSwitchEmbeddedCustom.value)) &&
				currentIsSupportEmbeddedPlaceholder.value && {
					emIsDisabledPlaceholder: currentIsDisabledEmbeddedPlaceholder.value,
				}),
		},
		loadingCallback,
		closeCallback,
	};
	resolvePromise(result);
};

const drawerSubmitLoading = ref<boolean>(false);

const handleCurrentSupportModes = (value: EmbeddedMergeRuleItem['settingMode'][]) => {
	const order = ['embedded', 'fullScreen', 'fixedOrientation', 'disabled'];
	value.sort((a, b) => {
		return order.indexOf(a) - order.indexOf(b);
	});
	currentSupportModes.value = value;
	currentSettingMode.value = value[0];
	// message.info(JSON.stringify(value))
};

defineExpose({
	openDrawer: embeddedAppDrawer.value.openDrawer, // 传递 openDrawer 方法
});
</script>

<template>
	<!-- Button Slot -->
	<slot v-bind="{ openDrawer: embeddedAppDrawer.openDrawer }"></slot>

	<!-- Drawer -->
	<n-drawer v-model:show="activeDrawer" :width="deviceStore.windowWidth >= 640 ? `450px` : `100%`" placement="right">
		<n-drawer-content :title="props.title" closable>
			<n-input-group>
				<n-input-group-label size="large">应用包名</n-input-group-label>
				<n-input
					size="large"
					:status="currentAppNameInputStatus"
					v-model:value="currentAppName"
					:allow-input="(value: string) => validateFun.validateAndroidPackageName(value)"
					:readonly="props.type === 'update'"
					placeholder="请输入应用包名" />
			</n-input-group>
			<n-alert v-if="currentRuleMode === 'custom'" type="info" class="mt-5">
				当前应用已被
				<n-tag :bordered="false" type="info">自定义规则</n-tag>
				覆盖，该应用规则不再随模块版本更新，如需恢复模块规则，请先清除
				<n-tag :bordered="false" type="info">自定义规则</n-tag>
				。
			</n-alert>
			<n-tabs class="my-3" type="segment" animated v-model:value="currentSettingMode">
				<n-tab-pane name="embedded" tab="平行窗口" v-if="props.type === 'update' && isSupportEmbedded">
					<n-alert :show-icon="false" :bordered="false" title="应用分屏显示" type="success">
						开启后，未适配横屏应用界面将通过平行窗口显示
					</n-alert>
					<!-- <n-tag type="success" class="whitespace-pre-wrap h-full py-2 leading-snug" closable>测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本测试文本</n-tag> -->
					<n-card v-if="currentRuleMode === 'module'" :bordered="false" title="切换自定义规则" size="small">
						<div class="mb-4">
							<n-tag :bordered="false" type="info"> 切换为自定义规则后该应用不再随模块更新 </n-tag>
						</div>
						<n-switch :rail-style="railStyle" v-model:value="currentIsSwitchEmbeddedCustom" size="large">
							<template #checked>使用自定义规则</template>
							<template #unchecked>不使用自定义规则</template>
						</n-switch>
					</n-card>
					<n-card
						v-if="
							(currentRuleMode === 'custom' || currentIsSwitchEmbeddedCustom) &&
							currentIsSupportEmbeddedPlaceholder
						"
						:bordered="false"
						title="平行窗口冷启动是否默认首页分屏"
						size="small">
						<n-switch
							:rail-style="railStyle"
							v-model:value="currentIsDisabledEmbeddedPlaceholder"
							size="large">
							<template #checked>平行窗口冷启动移除默认首页分屏</template>
							<template #unchecked>平行窗口冷启动使用默认首页分屏</template>
						</n-switch>
					</n-card>
					<n-card
						v-if="currentRuleMode === 'custom' || currentIsSwitchEmbeddedCustom"
						:bordered="false"
						title="平行窗口默认分屏比例"
						size="small">
						<n-slider v-model:value="currentSplitRatio" size="small" :min="0.01" :max="0.99" :step="0.01" />
						<n-input-number
							:show-button="false"
							class="pt-3"
							readonly
							placeholder="请输入平行窗口默认分屏比例"
							v-model:value="currentSplitRatio"
							:min="0.01"
							:max="0.99"
							:step="0.01" />
					</n-card>
					<n-card
						v-if="currentRuleMode === 'custom' || currentIsSwitchEmbeddedCustom"
						:bordered="false"
						title="平行窗口显示比例发生变化时是否重载"
						size="small">
						<div class="mb-4">
							<n-tag :bordered="false" type="success">
								适用于开启
								<span class="font-bold">平行窗口滑动条</span>
								的应用
							</n-tag>
						</div>
						<n-switch :rail-style="railStyle" v-model:value="currentEmbeddedRelaunch" size="large">
							<template #checked>平行窗口显示比例变化时重载</template>
							<template #unchecked>平行窗口显示比例变化时不重载</template>
						</n-switch>
					</n-card>
				</n-tab-pane>
				<n-tab-pane name="fullScreen" tab="全屏">
					<n-alert :show-icon="false" :bordered="false" title="应用横屏显示" type="info">
						开启后，未适配横屏应用界面将全屏显示，并可更改显示规则
					</n-alert>
					<n-card :bordered="false" title="横屏显示规则" size="small">
						<n-dropdown
							v-model="currentFullScreenRuleOptions"
							size="large"
							trigger="click"
							:options="fullScreenRuleOptions"
							@select="handleFullScreenRuleSelect">
							<n-button block type="info" dashed>
								{{ currentFullScreenRuleOptions.label }}
							</n-button>
						</n-dropdown>
					</n-card>
					<n-card
						v-if="currentFullScreenRuleOptions.key === 'fullScreen_custom'"
						:bordered="false"
						title="自定义横屏规则"
						size="small">
						<n-input-group>
							<n-input
								ref="currentFullRuleRef"
								@focus="() => handleTextAreaFocus('currentFullRuleRef')"
								@blur="() => handleTextAreaBlur('currentFullRuleRef')"
								v-model:value="currentFullRule"
								placeholder="请输入横屏规则" />
						</n-input-group>
					</n-card>
					<n-card :bordered="false" title="平行窗口滑动条" size="small">
						<div class="mb-4">
							<n-tag :bordered="false" type="success">
								适用于原生适配
								<span class="font-bold">Android Embedded</span>
								的应用
							</n-tag>
						</div>
						<n-switch :rail-style="railStyle" v-model:value="currentIsShowDivider" size="large">
							<template #checked>启用平行窗口滑动条</template>
							<template #unchecked>关闭平行窗口滑动条</template>
						</n-switch>
					</n-card>
					<n-card :bordered="false" title="平行窗口可滑动至全屏" v-if="currentIsShowDivider" size="small">
						<div class="mb-4">
							<n-tag :bordered="false" type="success">
								适用于原生适配
								<span class="font-bold">Android Embedded</span>
								的应用
							</n-tag>
						</div>
						<n-switch :rail-style="railStyle" v-model:value="currentSupportFullSize" size="large">
							<template #checked>平行窗口可滑动至全屏</template>
							<template #unchecked>平行窗口不可滑动至全屏</template>
						</n-switch>
					</n-card>
					<n-card
						class=""
						:bordered="false"
						v-if="
							!deviceStore.MIOSVersion ||
							(deviceStore.MIOSVersion && deviceStore.MIOSVersion < 2) ||
							deviceStore.androidTargetSdk < 35
						"
						title="跳过应用自适配声明"
						size="small">
						<div class="mb-4">
							<n-tag :bordered="false" type="success">
								适用于即使设置了
								<span class="font-bold">横屏规则</span>
								仍无法横屏的应用
							</n-tag>
						</div>
						<n-switch :rail-style="railStyle" v-model:value="currentSkipSelfAdaptive" size="large">
							<template #checked>跳过自适配声明</template>
							<template #unchecked>不跳过自适配声明</template>
						</n-switch>
					</n-card>
					<n-card
						class=""
						:bordered="false"
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
						"
						title="第三方应用横屏优化"
						size="small">
						<div class="mb-4">
							<n-tag :bordered="false" type="success">
								适用于即使设置了
								<span class="font-bold">横屏规则</span>
								仍无法横屏的应用
							</n-tag>
						</div>
						<n-switch
							:rail-style="railStyle"
							@update:value="(value: boolean) => changeThirdPartyAppOptimize(value)"
							:value="currentThirdPartyAppOptimize"
							size="large">
							<template #checked>已开启第三方应用横屏优化</template>
							<template #unchecked>未开启第三方应用横屏优化</template>
						</n-switch>
					</n-card>
				</n-tab-pane>
				<n-tab-pane name="fixedOrientation" tab="居中布局">
					<n-alert :show-icon="false" :bordered="false" title="应用居中显示" type="warning">
						开启后，未适配横屏应用界面将居中显示，并可更改显示比例
					</n-alert>
					<n-card :bordered="false" title="居中显示比例" size="small">
						<n-dropdown
							v-model:value="currentFixedOrientationRatio"
							size="large"
							trigger="click"
							:options="fixedOrientationRatioOptions"
							@select="handleFixedOrientationRatioSelect">
							<n-button block type="error" dashed>
								{{ currentFixedOrientationRatio.label }}
							</n-button>
						</n-dropdown>
					</n-card>
					<n-card
						v-if="currentFixedOrientationRatio.key === 'ratio_custom'"
						:bordered="false"
						title="自定义显示比例"
						size="small">
						<n-slider size="small" v-model:value="currentRatio" :min="1.01" :max="1.99" :step="0.01" />
						<n-input-number
							:show-button="false"
							class="pt-3"
							readonly
							placeholder="请输入自定义显示比例"
							v-model:value="currentRatio"
							:min="1.01"
							:max="1.99"
							:step="0.01" />
					</n-card>
					<n-card :bordered="false" title="应用比例变化时是否重载应用" size="small">
						<n-switch :rail-style="railStyle" v-model:value="currentFixedOrientationRelaunch" size="large">
							<template #checked>应用比例变化时重载应用</template>
							<template #unchecked>应用比例变化时不重载应用</template>
						</n-switch>
					</n-card>
					<n-card
						class=""
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35
						"
						:bordered="false"
						title="强制应用居中显示"
						size="small">
						<div class="mb-4">
							<n-tag :bordered="false" type="success">
								适用于即使设置了
								<span class="font-bold">居中布局</span>
								仍无法居中显示的应用
							</n-tag>
						</div>
						<n-switch :rail-style="railStyle" v-model:value="currentForceFixedOrientation" size="large">
							<template #checked>强制应用居中显示</template>
							<template #unchecked>不强制应用居中显示</template>
						</n-switch>
					</n-card>
				</n-tab-pane>
				<n-tab-pane name="disabled" tab="原始布局">
					<n-alert :show-icon="false" :bordered="false" title="应用原始布局" type="error">
						开启后，将禁用任何系统规则干预，应用会根据自身的适配规则进行显示，大多数应用仅竖屏显示
					</n-alert>
					<n-card :bordered="false" title="应用比例变化时是否重载应用" size="small">
						<n-switch :rail-style="railStyle" v-model:value="currentFixedOrientationRelaunch" size="large">
							<template #checked>应用比例变化时重载应用</template>
							<template #unchecked>应用比例变化时不重载应用</template>
						</n-switch>
					</n-card>
				</n-tab-pane>
			</n-tabs>
			<template #footer>
				<n-button type="info" v-model:loading="drawerSubmitLoading" @click="() => handleDrawerSubmit()">
					提交
				</n-button>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<style scoped></style>
