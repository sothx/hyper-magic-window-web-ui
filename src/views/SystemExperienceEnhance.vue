<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { computed, h, onMounted, ref, shallowRef, type CSSProperties } from 'vue';
import { createDiscreteApi, darkTheme, lightTheme, NInput, type ConfigProviderProps } from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';
import { useAmktiao, type KeyboardModeOptions } from '@/hooks/useAmktiao';
import { useMiuiDesktopMode } from '@/hooks/useMiuiDesktopMode';
import { RenderJsx } from '@/components/RenderJSX';
import { useIOScheduler } from '@/hooks/useIOScheduler';
import { useMIUIContentExtension } from '@/hooks/useMIUIContentExtension';
import $to from 'await-to-js';
import { MagnifyingGlassIcon, CircleStackIcon, XCircleIcon, SquaresPlusIcon } from '@heroicons/vue/24/outline';
import { useVideoWallpaperLoop } from '@/hooks/useVideoWallpaperLoop';
import { useDisabledOS2SystemPreStart } from '@/hooks/useDisabledOS2SystemPreStart';
import { useDisabledDeepSleepEnable } from '@/hooks/useDisabledDeepSleepEnable';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { useJoyose } from '@/hooks/useJoyose';
import { useFbo } from '@/hooks/useFbo';
import { useProjectTrebleVerticalScreenSplit } from '@/hooks/useProjectTrebleVerticalScreenSplit';
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
import { useMiuiCursorStyle, type miuiCursorStyleType } from '@/hooks/useMiuiCursorStyle';
import { useMouseGestureNaturalscroll } from '@/hooks/useMouseGestureNaturalscroll';
import { usePointerSpeed } from '@/hooks/usePointerSpeed';
import { useDevelopmentSettingsEnabled } from '@/hooks/useDevelopmentSettingsEnabled';
import type { JSX } from 'vue/jsx-runtime';
import { useDisplayModeRecord } from '@/hooks/useDisplayModeRecord';
import { useHideGestureLine } from '@/hooks/useHideGestureLine';
import { useProjectTrebleCvwFull } from '@/hooks/useProjectTrebleCvwFull';
import { useFreeformBlackList } from '@/hooks/useFreeformBlackList';
import { useProjectTrebleDisableResizeBlackList } from '@/hooks/useProjectTrebleDisableResizeBlackList';
import { useProjectTrebleMaxFreeformCount } from '@/hooks/useProjectTrebleMaxFreeformCount';
const deviceStore = useDeviceStore();
const searchKeyword = ref('');
const hideGestureLineHook = useHideGestureLine();
const displayModeRecordHook = useDisplayModeRecord();
const IOSchedulerHook = useIOScheduler();
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const miuiDesktopModeHook = useMiuiDesktopMode();
const MIUIContentExtensionHook = useMIUIContentExtension();
const miuiCursorStyleHook = useMiuiCursorStyle();
const mouseGestureNaturalscrollHook = useMouseGestureNaturalscroll();
const pointerSpeedHook = usePointerSpeed();
const developmentSettingsEnabledHook = useDevelopmentSettingsEnabled();
const videoWallpaperLoopHook = useVideoWallpaperLoop();
const useDisabledOS2SystemPreStartHook = useDisabledOS2SystemPreStart();
const useDisabledDeepSleepEnableHook = useDisabledDeepSleepEnable();
const projectTrebleVerticalScreenSplitHook = useProjectTrebleVerticalScreenSplit();
const projectTrebleCvwFullHook = useProjectTrebleCvwFull();
const freeformBlackListHook = useFreeformBlackList();
const projectTrebleDisableResizeBlackListHook = useProjectTrebleDisableResizeBlackList();
const projectTrebleMaxFreeformCountHook = useProjectTrebleMaxFreeformCount();
const fboHook = useFbo();
const joyoseHook = useJoyose();
// const initHooks = () => {
// 	fboHook.value = useFbo();
// }

// onMounted(() => {
// 	initHooks()
// })
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
const amktiaoHook = useAmktiao();
const useDisplaySettingsHook = useDisplaySettings();
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
			deviceApi.openChinaMobileMCloud();
		},
		onNegativeClick: () => {},
	});
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
export interface EnhanceItemInfo {
	title: string;
	titleSlot?: () => JSX.Element;
	content: () => JSX.Element;
	isShow?: () => boolean;
}
const enhanceList: EnhanceItemInfo[] = [
	{
		title: '工作台小窗数量上限（移植包）',
		content: () => (
			<>
				{!projectTrebleMaxFreeformCountHook.isInit.value ? (
					<div>
						<n-skeleton text repeat={1} sharp={false} round />
						<n-skeleton text repeat={1} sharp={false} size='small' />
					</div>
				) : (
					<div>
						{projectTrebleMaxFreeformCountHook.isEditMiuiDesktopModeMaxFreeformMaxCount.value ? (
							<>
								<n-slider
									size='small'
									min={4}
									max={8}
									disabled={!projectTrebleMaxFreeformCountHook.isEditMiuiDesktopModeMaxFreeformMaxCount.value}
									step={1}
									value={projectTrebleMaxFreeformCountHook.currentMiuiDesktopModeMaxFreeformMaxCount.value}
									onUpdateValue={(value: number) => {
										projectTrebleMaxFreeformCountHook.currentMiuiDesktopModeMaxFreeformMaxCount.value = value;
									}}
								/>
								<n-input-number
									showButton={false}
									class='pt-3'
									readonly
									value={projectTrebleMaxFreeformCountHook.currentMiuiDesktopModeMaxFreeformMaxCount.value}
									placeholder='请输入工作台小窗数量上限'
									min={4}
									max={8}
									step={1}
									onUpdateValue={(value: number) => {
										projectTrebleMaxFreeformCountHook.currentMiuiDesktopModeMaxFreeformMaxCount.value = value;
									}}
								/>
								<n-button
									size='small'
									type='info'
									class="mt-5"
									loading={deviceStore.loading}
									onClick={() => projectTrebleMaxFreeformCountHook.changeMaxFreeformCount('MiuiDesktopMode',projectTrebleMaxFreeformCountHook.currentMiuiDesktopModeMaxFreeformMaxCount.value)}>
									{{
										default: () => <>保存修改</>,
									}}
								</n-button>
							</>
						) : (
							<>
								<div class='mb-5'>
									<n-tag bordered={false} type='info'>
										当前工作台小窗数量上限 : {projectTrebleMaxFreeformCountHook.currentMiuiDesktopModeMaxFreeformMaxCount.value}
									</n-tag>
								</div>
								<n-button
									size='small'
									type='info'
									loading={deviceStore.loading}
									onClick={() => (projectTrebleMaxFreeformCountHook.isEditMiuiDesktopModeMaxFreeformMaxCount.value = true)}>
									{{
										default: () => <>修改工作台小窗数量上限</>,
									}}
								</n-button>
							</>
						)}
					</div>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>仅支持该功能的移植包可用，配置后在工作台模式下支持更多数量的小窗显示~</p>
					<p>需要保存修改才会生效~</p>
				</n-alert>
			</>
		),
		isShow: () => ['tablet'].includes(deviceStore.deviceType) && projectTrebleMaxFreeformCountHook.isSupportMiuiDesktopModeMaxFreeformMaxCount.value,
	},
		{
		title: '默认桌面小窗数量上限（移植包）',
		content: () => (
			<>
				{!projectTrebleMaxFreeformCountHook.isInit.value ? (
					<div>
						<n-skeleton text repeat={1} sharp={false} round />
						<n-skeleton text repeat={1} sharp={false} size='small' />
					</div>
				) : (
					<div>
						{projectTrebleMaxFreeformCountHook.isEditDefaultDesktopModeMaxFreeformMaxCount.value ? (
							<>
								<n-slider
									size='small'
									min={2}
									max={8}
									disabled={!projectTrebleMaxFreeformCountHook.isEditDefaultDesktopModeMaxFreeformMaxCount.value}
									step={1}
									value={projectTrebleMaxFreeformCountHook.currentDefaultDesktopModeMaxFreeformMaxCount.value}
									onUpdateValue={(value: number) => {
										projectTrebleMaxFreeformCountHook.currentDefaultDesktopModeMaxFreeformMaxCount.value = value;
									}}
								/>
								<n-input-number
									showButton={false}
									class='pt-3'
									readonly
									value={projectTrebleMaxFreeformCountHook.currentDefaultDesktopModeMaxFreeformMaxCount.value}
									placeholder='请输入默认桌面小窗数量上限'
									min={2}
									max={8}
									step={1}
									onUpdateValue={(value: number) => {
										projectTrebleMaxFreeformCountHook.currentDefaultDesktopModeMaxFreeformMaxCount.value = value;
									}}
								/>
								<n-button
									size='small'
									type='info'
									class="mt-5"
									loading={deviceStore.loading}
									onClick={() => projectTrebleMaxFreeformCountHook.changeMaxFreeformCount('MiuiDesktopMode',projectTrebleMaxFreeformCountHook.currentDefaultDesktopModeMaxFreeformMaxCount.value)}>
									{{
										default: () => <>保存修改</>,
									}}
								</n-button>
							</>
						) : (
							<>
								<div class='mb-5'>
									<n-tag bordered={false} type='info'>
										当前默认桌面小窗数量上限 : {projectTrebleMaxFreeformCountHook.currentDefaultDesktopModeMaxFreeformMaxCount.value}
									</n-tag>
								</div>
								<n-button
									size='small'
									type='info'
									loading={deviceStore.loading}
									onClick={() => (projectTrebleMaxFreeformCountHook.isEditDefaultDesktopModeMaxFreeformMaxCount.value = true)}>
									{{
										default: () => <>修改默认桌面小窗数量上限</>,
									}}
								</n-button>
							</>
						)}
					</div>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>仅支持该功能的移植包可用，配置后在默认桌面下支持更多数量的小窗显示~</p>
					<p>需要保存修改才会生效~</p>
				</n-alert>
			</>
		),
		isShow: () => ['tablet'].includes(deviceStore.deviceType) && projectTrebleMaxFreeformCountHook.isSupportMiuiDesktopModeMaxFreeformMaxCount.value,
	},
	{
		title: '禁用分屏黑名单（移植包）',
		content: () => (
			<>
				{!projectTrebleDisableResizeBlackListHook.isInit.value ? (
					<n-skeleton width={80} sharp={false} round size='small' />
				) : (
					<n-switch
						railStyle={railStyle}
						value={projectTrebleDisableResizeBlackListHook.isEnable.value ? true : false}
						loading={deviceStore.loading || projectTrebleDisableResizeBlackListHook.loading.value}
						onUpdate:value={(value: boolean) => projectTrebleDisableResizeBlackListHook.changeEnableMode(value)}>
						{{
							checked: () => <>已禁用</>,
							unchecked: () => <>未禁用</>,
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					仅支持该功能的移植包可用，开启后支持更多应用分屏~
				</n-alert>
			</>
		),
		isShow: () => Boolean(['tablet'].includes(deviceStore.deviceType) && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk === 35 && projectTrebleDisableResizeBlackListHook.isSupportProp.value),
	},
	{
		title: '禁用小窗黑名单',
		content: () => (
			<>
				{!freeformBlackListHook.isInit.value ? (
					<n-skeleton width={80} sharp={false} round size='small' />
				) : (
					<n-switch
						railStyle={railStyle}
						value={freeformBlackListHook.isEnable.value ? true : false}
						loading={deviceStore.loading || freeformBlackListHook.loading.value}
						onUpdate:value={(value: boolean) => freeformBlackListHook.changeEnableMode(value)}>
						{{
							checked: () => <>已禁用</>,
							unchecked: () => <>未禁用</>,
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					禁用小窗黑名单可以让更多应用使用小窗，该功能受系统支持影响，开启后是否生效请以实际情况为准。
				</n-alert>
			</>
		),
	},
	{
		title: '强制竖屏上下分屏（LSPosed模块）',
		content: () => (
			<>
				{!projectTrebleVerticalScreenSplitHook.isInit.value ? (
					<n-skeleton width={80} sharp={false} round size='small' />
				) : (
					<n-switch
						railStyle={railStyle}
						disabled={!projectTrebleVerticalScreenSplitHook.splitScreenPlusIsInstalled.value}
						value={projectTrebleVerticalScreenSplitHook.isEnableSettings.value ? true : false}
						loading={deviceStore.loading || projectTrebleVerticalScreenSplitHook.loading.value}
						onUpdate:value={(value: boolean) => projectTrebleVerticalScreenSplitHook.changeEnableMode(value, 'module')}>
						{{
							checked: () => <>已启用</>,
							unchecked: () => <>未启用</>,
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p class="mb-2">安装状态:{ !projectTrebleVerticalScreenSplitHook.isInit.value ? (<n-skeleton text class="ml-2" height={25} width={80} sharp={false} size='small' />) : (<n-tag type={projectTrebleVerticalScreenSplitHook.splitScreenPlusIsInstalled.value ? 'success': 'error'} class="ml-2">{ projectTrebleVerticalScreenSplitHook.splitScreenPlusIsInstalled.value ? '当前已安装' : '当前未安装' }</n-tag>)}</p>
					<p>安装 焕晨(HChen) 开发的 LSPosed 模块 SplitScreenPlus 可激活此功能~</p>
					<n-button size="small" class="mt-2" type="info" secondary onClick={() => projectTrebleVerticalScreenSplitHook.openModuleDownloadUrl()}>获取 SplitScreenPlus</n-button>
					<div class="mt-3">
						<p>由于{ deviceStore.deviceType === 'tablet' ? '小米平板' : '小米大折叠屏' }并不支持竖屏上下分屏，模块通过修改系统逻辑以实现竖屏上下分屏，可能存在不稳定等情况，如出现系统界面异常可以切换启用状态为 [未启用] 后，通过下方 [重启系统界面] 的功能解决界面异常问题。</p>
						<n-button size="small" class="mt-2" type="error" secondary onClick={() => projectTrebleVerticalScreenSplitHook.reloadSystemUI()}>重启系统界面</n-button>
					</div>
				</n-alert>
			</>
		),
		isShow: () => Boolean(['tablet','fold'].includes(deviceStore.deviceType) && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk === 35),
	},
	{
		title: '强制竖屏上下分屏（移植包）',
		content: () => (
			<>
				{!projectTrebleVerticalScreenSplitHook.isInit.value ? (
					<n-skeleton width={80} sharp={false} round size='small' />
				) : (
					<n-switch
						railStyle={railStyle}
						value={projectTrebleVerticalScreenSplitHook.isEnableProjectTreble.value ? true : false}
						loading={deviceStore.loading || projectTrebleVerticalScreenSplitHook.loading.value}
						onUpdate:value={(value: boolean) => projectTrebleVerticalScreenSplitHook.changeEnableMode(value, 'projectTreble')}>
						{{
							checked: () => <>已启用</>,
							unchecked: () => <>未启用</>,
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					仅支持该功能的移植包可用，由于并非系统本身支持竖屏上下分屏（移植包修改系统界面参数另类实现），因此强制启用后可能会导致部分系统界面显示异常甚至触发异常崩溃，强制启用该功能代表已阅读并了解使用须知，请悉知~
				</n-alert>
			</>
		),
		isShow: () => Boolean(['tablet','fold'].includes(deviceStore.deviceType) && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk === 35 && projectTrebleVerticalScreenSplitHook.isSupportProp.value),
	},
	{
		title: '工作台无极小窗（移植包）',
		content: () => (
			<>
				{!projectTrebleCvwFullHook.isInit.value ? (
					<n-skeleton width={80} sharp={false} round size='small' />
				) : (
					<n-switch
						railStyle={railStyle}
						value={projectTrebleCvwFullHook.isEnable.value ? true : false}
						loading={deviceStore.loading || projectTrebleCvwFullHook.loading.value}
						onUpdate:value={(value: boolean) => projectTrebleCvwFullHook.changeEnableMode(value)}>
						{{
							checked: () => <>已启用</>,
							unchecked: () => <>未启用</>,
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					仅支持该功能的移植包可用，开启后在工作台模式下任意应用小窗支持无级调节~
				</n-alert>
			</>
		),
		isShow: () => Boolean(['tablet'].includes(deviceStore.deviceType) && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk === 35 && projectTrebleCvwFullHook.isSupportProp.value),
	},
	{
		title: '工作台模式',
		titleSlot: () => (
			<>
				{!deviceStore.enabledMiuiDesktopMode && (
					<p class='mt-2'>
						<n-button
							strong
							secondary
							size='small'
							type='warning'
							onClick={() => miuiDesktopModeHook.changeMiuiDesktopModeEnabled()}>
							启用功能
						</n-button>
					</p>
				)}
			</>
		),
		content: () => (
			<>
				{!miuiDesktopModeHook.isInit.value ? (
					<n-skeleton width={123} sharp={false} round size='small' />
				) : (
					<n-switch
						onUpdateValue={(value: boolean) => miuiDesktopModeHook.changeMiuiDktMode(value)}
						railStyle={railStyle}
						disabled={!deviceStore.enabledMiuiDesktopMode}
						value={miuiDesktopModeHook.currentMiuiDktMode.value}
						loading={deviceStore.loading}>
						{{
							checked: () => '工作台模式',
							unchecked: () => '默认桌面模式',
						}}
					</n-switch>
				)}
			</>
		),
		isShow: () =>
			Boolean(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 1 && deviceStore.deviceType === 'tablet'),
	},
	{
		title: 'Shamiko 工作模式',
		content: () => (
			<n-switch
				onUpdateValue={(value: boolean) => changeShamikoMode(value)}
				loading={deviceStore.loading}
				value={deviceStore.shamikoInfo.mode === 'whitelist' ? true : false}
				railStyle={railStyle}>
				{{
					checked: () => '白名单模式',
					unchecked: () => '黑名单模式',
				}}
			</n-switch>
		),
		isShow: () => deviceStore.shamikoInfo.installed,
	},
	{
		title: '旋转建议提示按钮',
		content: () => (
			<n-switch
				value={deviceStore.showRotationSuggestions}
				railStyle={railStyle}
				onUpdateValue={(value: boolean) => changeShowRotationSuggestions(value)}>
				{{
					checked: () => '已启用旋转建议提示按钮',
					unchecked: () => '已关闭旋转建议提示按钮',
				}}
			</n-switch>
		),
		isShow: () => ['tablet', 'fold'].includes(deviceStore.deviceType),
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
				{deviceStore.deviceType === 'tablet' && (
					<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
						<p>在小米平板上推荐使用 [精选应用-系统功能补全模块] 来隐藏手势提示线（小白条）</p>
					</n-alert>
				)}
			</>
		),
		isShow: () =>
			Boolean(deviceStore.deviceType === 'tablet' && deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2),
	},
	{
		title: '开发者模式',
		content: () => (
			<>
				{!developmentSettingsEnabledHook.isInit.value ? (
					<n-skeleton width={150} sharp={false} round={true} size='small' />
				) : (
					<n-switch
						value={developmentSettingsEnabledHook.isEnabled.value}
						railStyle={railStyle}
						loading={deviceStore.loading || developmentSettingsEnabledHook.loading.value}
						onUpdateValue={(value: boolean) => developmentSettingsEnabledHook.change(value ? 1 : 0)}>
						{{
							checked: () => '已开启开发者模式',
							unchecked: () => '未开启开发者模式',
						}}
					</n-switch>
				)}
			</>
		),
	},
	{
		title: '应用预加载',
		content: () => (
			<>
				<n-switch
					value={deviceStore.preStartProp.module}
					railStyle={railStyle}
					loading={deviceStore.loading}
					onUpdateValue={(value: boolean) => useDisabledOS2SystemPreStartHook.change(value)}>
					{{
						checked: () => '已开启应用预加载',
						unchecked: () => '已禁用应用预加载',
					}}
				</n-switch>
			</>
		),
		isShow: () => Boolean(useDisabledOS2SystemPreStartHook.isShow.value),
	},
	{
		title: '深度睡眠',
		content: () => (
			<n-switch
				value={deviceStore.deepSleepProp.module}
				railStyle={railStyle}
				loading={deviceStore.loading}
				onUpdateValue={(value: boolean) => useDisabledDeepSleepEnableHook.change(value)}>
				{{
					checked: () => '已开启深度睡眠',
					unchecked: () => '已禁用深度睡眠',
				}}
			</n-switch>
		),
		isShow: () => useDisabledDeepSleepEnableHook.isShow.value,
	},
	{
		title: '暗码拨号盘',
		content: () => (
			<>
				<n-button
					size='small'
					type='error'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openCodeDialer()}>
					{{
						icon: () => (
							<n-icon>
								<PhoneIcon />
							</n-icon>
						),
						default: () => '暗码拨号盘',
					}}
				</n-button>

				<n-alert class='mt-5' type='error' show-icon={false} bordered={false}>
					<p>暗码必须以*#*#开头，且以#*#*结尾</p>
					<p>eg: 开启 LSPosed 管理器的暗码：*#*#5776733#*#*</p>
					<p>
						「安全警示:
						暗码拨号盘是面向开发者调试的功能，用于打开一些隐藏设定，如果您不了解暗码作用与功能建议不要轻易尝试，可能会导致您的设备数据丢失！」
					</p>
				</n-alert>
			</>
		),
	},
	{
		title: 'LSPosed 管理器',
		content: () => (
			<n-button
				size='small'
				type='info'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openLSPosedManger()}>
				LSPosed 管理器
			</n-button>
		),
	},
	{
		title: '传送门',
		content: () => (
			<>
				<div>
					<n-button
						size='small'
						type='info'
						secondary
						loading={deviceStore.loading}
						onClick={() => MIUIContentExtensionHook.open()}>
						{{
							icon: () => <img src='/images/icons/miui_content_extension_app.webp' />,
							default: () => <>传送门</>,
						}}
					</n-button>
				</div>
				{MIUIContentExtensionHook.isInstallMIUIContentExtension.value && (
					<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
						{deviceStore.deviceType === 'tablet' && (
							<p class='mt-5'>
								模块安装后可能会导致「传送门」被异常添加到「游戏工具箱」，您可以通过
								<n-button
									size='small'
									type='info'
									secondary
									loading={deviceStore.loading}
									onClick={() => MIUIContentExtensionHook.fix()}>
									传送门异常修复
								</n-button>
								移除「游戏工具箱」内的「传送门」
							</p>
						)}
						<p>
							由于小米「传送门」存在「应用黑名单」不定期重置的BUG，您可以通过
							<n-dropdown
								size='large'
								trigger='click'
								options={[
									{ label: '应用黑名单固化', key: 'onlyRead' },
									{ label: '解除应用黑名单固化', key: 'readAndWrite' },
								]}
								onSelect={(key: 'onlyRead' | 'readAndWrite') => {
									key === 'onlyRead'
										? MIUIContentExtensionHook.setAuthIsOnlyRead()
										: MIUIContentExtensionHook.setAuthIsReadAndWrite();
								}}>
								<n-button
									size='small'
									type='info'
									color='#8a2be2'
									secondary
									loading={deviceStore.loading}>
									应用黑名单固化管理
								</n-button>
							</n-dropdown>
							来固化「应用黑名单」的权限，避免被系统重置。
						</p>
					</n-alert>
				)}
			</>
		),
	},
	{
		title: 'WinPlay Mobile',
		content: () => (
			<>
				<div>
					<n-button
						size='small'
						type='info'
						secondary
						loading={deviceStore.loading}
						onClick={() => deviceApi.openGameEngineLauncherActivity()}>
						{{
							icon: () => <img src='/images/icons/win_play_mobile.webp' />,
							default: () => <>WinPlay Mobile</>,
						}}
					</n-button>
				</div>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>「WinPlay Mobile」是为小米平板量身定做的「游戏虚拟机」，可以运行市面上常见的 Windows 游戏。</p>
					<p>目前尚处于测试阶段，暂时仅支持小米平板6S Pro ~</p>
					<p>该功能依赖「AI百宝箱」和「WAE Display」，请确保已经安装这两个系统应用。</p>
				</n-alert>
			</>
		),
		isShow: () =>
			Boolean(
				deviceStore.MIOSVersion &&
					deviceStore.MIOSVersion >= 2 &&
					deviceStore.androidTargetSdk >= 35 &&
					deviceStore.deviceType === 'tablet',
			),
	},
	{
		title: '强制屏幕最低亮度',
		content: () => (
			<>
				<div>
					<n-button
						size='small'
						type='warning'
						secondary
						loading={deviceStore.loading}
						onClick={() => useDisplaySettingsHook.open()}>
						强制屏幕最低亮度
					</n-button>
				</div>
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>
						通过将屏幕亮度调整为0，达到屏幕最低亮度但是不影响屏幕的触控操作，可能适合部分特殊场景使用，游戏或者视频场景仍然推荐使用「熄屏挂机」和「熄屏听剧」，使用该功能会自动关闭「自动亮度」，请悉知，如需恢复屏幕显示需要敲击两次「电源键」。
					</p>
				</n-alert>
			</>
		),
		isShow: () =>
			useDisplaySettingsHook.hasMTKDisplayBrightness.value ||
			useDisplaySettingsHook.hasQComDisplayBrightness.value,
	},
	{
		title: '默认闲置刷新率',
		content: () => (
			<>
				<div class='mb-4'>
					<n-alert bordered={false} show-icon={false} type='info' title='闲置刷新率触发阈值'>
						{displayModeRecordHook.propDisableIdleFpsThreshold.value &&
						displayModeRecordHook.propDisableIdleFps.value
							? `亮度大于 ${displayModeRecordHook.propDisableIdleFpsThreshold.value} 时将触发闲置刷新率`
							: `全亮度触发闲置刷新率`}
					</n-alert>
				</div>
				<div class='grid gap-4 sm:px-0 lg:grid-cols-2'>
					{Array.isArray(displayModeRecordHook.fpsList.value) &&
						displayModeRecordHook.fpsList.value.map((fpsItem, fpsIndex) => {
							const getAlertType = (fps: number): 'info' | 'error' | 'success' | 'warning' => {
								const propIdleDefaultFps = displayModeRecordHook.propIdleDefaultFps.value;
								const currentIdleDefaultFps = displayModeRecordHook.currentIdleDefaultFps.value;
								if (propIdleDefaultFps && !currentIdleDefaultFps && fps === propIdleDefaultFps)
									return 'error';
								if (currentIdleDefaultFps === fps) return 'success';
								return 'info';
							};
							const currenAlertType = getAlertType(fpsItem);
							return (
								<n-alert
									size='small'
									show-icon={false}
									type={currenAlertType}
									title={`${fpsItem} hz`}
									class='w-full'>
									{['error'].includes(currenAlertType) ? (
										<n-tag class='mt-2' bordered={false} type={currenAlertType}>
											系统默认
										</n-tag>
									) : (
										<n-button
											class='mt-2'
											v-show={IOSchedulerHook.isInit.value}
											strong
											secondary
											type={currenAlertType}
											loading={deviceStore.loading || displayModeRecordHook.loading.value}
											size='small'
											onClick={() => displayModeRecordHook.changeIdleDefaultFps(fpsItem)}>
											{currenAlertType === 'success' ? '已应用该配置' : '应用配置'}
										</n-button>
									)}
								</n-alert>
							);
						})}
				</div>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>
						系统会在闲置的时候降低刷新率，您可以修改系统闲置刷新率的默认值，可以优化视频类App弹幕之类的场景体验。
					</p>
					{deviceStore.deviceType === 'tablet' && (
						<p>
							如果您使用小米平板手写笔，推荐将其修改为 60hz 或者 120hz
							，以避免系统闲置刷新率导致小米平板手写笔断触。
						</p>
					)}
					<p>(受系统实际支持情况影响，切换其他闲置刷新率可能会导致系统出现未知异常，请自行准备救砖模块)</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(displayModeRecordHook.isSupportIdleDefaultFps.value),
	},
	{
		title: '禁用手写笔刷新率优化',
		content: () => (
			<>
				{!displayModeRecordHook.isInit.value ? (
					<n-skeleton width={80} sharp={false} round size='small' />
				) : (
					<n-switch
						railStyle={railStyle}
						value={displayModeRecordHook.isDisabledSysSmartPenOptimize.value ? true : false}
						loading={deviceStore.loading || displayModeRecordHook.loading.value}
						onUpdate:value={(value: boolean) =>
							displayModeRecordHook.changeDisabledSysSmartPenOptimize(value)
						}>
						{{
							checked: () => <>已禁用</>,
							unchecked: () => <>未禁用</>,
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>
						小米平板在连接和使用手写笔的情况下，系统会强制接管闲置刷新率与动态刷新率，您可以选择禁用该系统行为，禁用后连接和使用手写笔的情况下系统不再主动接管刷新率，请注意小米平板手写笔仅能在
						60hz 和 120hz 下正常工作。
					</p>
				</n-alert>
			</>
		),
		isShow: () => deviceStore.deviceType === 'tablet',
	},
	{
		title: '第三方触控笔管理（水龙）',
		titleSlot: () => (
			<>
				{!deviceStore.showThirdPartySetting.amktiaoROMInterface && (
					<div class='mt-2'>
						<n-button
							strong
							secondary
							size='small'
							type='warning'
							onClick={() => amktiaoHook.enableSetting()}>
							启用功能
						</n-button>
					</div>
				)}
			</>
		),
		content: () => (
			<>
				{!amktiaoHook.isInit.value ? (
					<n-skeleton width={80} sharp={false} round size='small' />
				) : (
					<n-switch
						railStyle={railStyle}
						disabled={!deviceStore.showThirdPartySetting.amktiaoROMInterface}
						value={amktiaoHook.currentPenEnable.value ? true : false}
						loading={deviceStore.loading}
						onUpdate:value={(value: boolean) => amktiaoHook.changePenEnableMode(value)}>
						{{
							checked: () => <>已启用</>,
							unchecked: () => <>未启用</>,
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					仅兼容水龙(Amktiao)的内核，存在 /sys/touchpanel/pen_enable 开关映射时生效
				</n-alert>
			</>
		),
		isShow: () => amktiaoHook.hasPenEnableControl.value && ['tablet'].includes(deviceStore.deviceType),
	},
	{
		title: '手写笔驱动管理（水龙）',
		titleSlot: () => (
			<>
				{!deviceStore.showThirdPartySetting.amktiaoROMInterface && (
					<div class='mt-2'>
						<n-button
							strong
							secondary
							size='small'
							type='warning'
							onClick={() => amktiaoHook.enableSetting()}>
							启用功能
						</n-button>
					</div>
				)}
			</>
		),
		content: () => (
			<>
				{!amktiaoHook.isInit.value ? (
					<n-skeleton width={110} sharp={false} round size='small' />
				) : (
					<n-switch
						onUpdateValue={(value: boolean) => amktiaoHook.changePenUpdateMode(value)}
						railStyle={railStyle}
						disabled={!deviceStore.showThirdPartySetting.amktiaoROMInterface}
						value={amktiaoHook.currentPenUpdate.value ? true : false}
						loading={deviceStore.loading}>
						{{
							checked: () => '二代笔驱动',
							unchecked: () => '一代笔驱动',
						}}
					</n-switch>
				)}
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>仅兼容水龙(Amktiao)的内核，存在 /sys/touchpanel/pen_update 开关映射时生效</p>
				</n-alert>
			</>
		),
		isShow: () => amktiaoHook.hasPenUpdateControl.value && ['tablet'].includes(deviceStore.deviceType),
	},
	{
		title: '键盘连接器管理（水龙）',
		titleSlot: () => (
			<>
				{!deviceStore.showThirdPartySetting.amktiaoROMInterface && (
					<div class='mt-2'>
						<n-button
							strong
							secondary
							size='small'
							type='warning'
							onClick={() => amktiaoHook.enableSetting()}>
							启用功能
						</n-button>
					</div>
				)}
			</>
		),
		content: () => (
			<>
				{!amktiaoHook.isInit.value ? (
					<n-skeleton width={75} sharp={false} size='small' />
				) : (
					<n-dropdown
						value={amktiaoHook.currentKeyboardModeSelect}
						size='large'
						trigger='click'
						options={amktiaoHook.keyboardModeOptions.value}
						onSelect={amktiaoHook.changeKeyboardMode}>
						<n-button
							strong
							secondary
							disabled={!deviceStore.showThirdPartySetting.amktiaoROMInterface}
							size='small'
							type={amktiaoHook.currentKeyboardModeSelect.value.type}>
							{amktiaoHook.currentKeyboardModeSelect.value.label}
						</n-button>
					</n-dropdown>
				)}

				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>仅兼容水龙(Amktiao)的内核，存在 /sys/touchpanel/keyboard 开关映射时生效</p>
					<p>「复位键盘」仅在键盘异常时使用，一般情况下不需要</p>
				</n-alert>
			</>
		),
		isShow: () => amktiaoHook.hasKeyboardControl.value && ['tablet'].includes(deviceStore.deviceType),
	},
	{
		title: '鼠标光标样式',
		content: () => (
			<>
				{!miuiCursorStyleHook.isInit.value ? (
					<n-skeleton width={65} sharp={false} size='small' />
				) : (
					<n-dropdown
						size='large'
						trigger='click'
						options={[
							{ label: '箭头', key: 3 },
							{ label: '圆点', key: 1 },
							{ label: '空心圆', key: 0 },
						]}
						onSelect={(key: miuiCursorStyleType) => {
							miuiCursorStyleHook.changeMiuiCursorStyleType(key);
						}}>
						<n-button size='small' class='mb-3 mr-3' type='success' secondary loading={deviceStore.loading}>
							{{
								default: () => {
									const v = miuiCursorStyleHook.currentMiuiCursorStyleType.value;
									if (v === 3) return '箭头';
									if (v === 1) return '圆点';
									if (v === 0) return '空心圆';
									return '';
								},
							}}
						</n-button>
					</n-dropdown>
				)}

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<div>
						<p>
							由于小米BUG，部分系统存在开机后「鼠标光标样式」被异常重置的问题，模块提供「鼠标光标样式开机自配置」来解决这个问题，开启后每次开机会被配置为指定的「鼠标光标样式」，系统设置内的修改会在重启后失效。
						</p>
						<n-switch
							onUpdateValue={(value: boolean) =>
								miuiCursorStyleHook.changeAutoStartMiuiCursorStyleType(value)
							}
							railStyle={railStyle}
							class='mt-5'
							value={!!miuiCursorStyleHook.currentAutoStartMiuiCursorStyleType.value}
							loading={deviceStore.loading}>
							{{
								checked: () => '已启用开机自配置',
								unchecked: () => '未启用开机自配置',
							}}
						</n-switch>
					</div>
				</n-alert>
			</>
		),
		isShow: () => ['tablet'].includes(deviceStore.deviceType),
	},
	{
		title: '鼠标自然滚动',
		content: () => (
			<>
				{!mouseGestureNaturalscrollHook.isInit.value ? (
					<n-skeleton width={165} sharp={false} round size='small' />
				) : (
					<n-switch
						onUpdateValue={(value: boolean) =>
							mouseGestureNaturalscrollHook.changeMouseGestureNaturalscroll(value)
						}
						railStyle={railStyle}
						value={mouseGestureNaturalscrollHook.currentMouseGestureNaturalscroll.value === 1}>
						{{
							checked: () => '已开启鼠标自然滚动',
							unchecked: () => '未开启鼠标自然滚动',
						}}
					</n-switch>
				)}

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>开启后内容随手指移动</p>
				</n-alert>
			</>
		),
		isShow: () => ['tablet'].includes(deviceStore.deviceType),
	},
	{
		title: '鼠标指针速度',
		content: () => (
			<>
				{!pointerSpeedHook.isInit.value ? (
					<div>
						<n-skeleton text repeat={1} sharp={false} round />
						<n-skeleton text repeat={1} sharp={false} size='small' />
					</div>
				) : (
					<div>
						{pointerSpeedHook.isEdit.value ? (
							<>
								<n-slider
									size='small'
									min={-7}
									max={7}
									disabled={!pointerSpeedHook.isEdit.value}
									step={1}
									value={pointerSpeedHook.currentPointerSpeed.value}
									onUpdateValue={(value: number) => {
										pointerSpeedHook.currentPointerSpeed.value = value;
										deviceApi.setPointerSpeed(value);
									}}
								/>
								<n-input-number
									showButton={false}
									class='pt-3'
									readonly
									value={pointerSpeedHook.currentPointerSpeed.value}
									placeholder='请输入鼠标指针速度'
									min={-7}
									max={7}
									step={1}
									onUpdateValue={(value: number) => {
										pointerSpeedHook.currentPointerSpeed.value = value;
									}}
								/>
							</>
						) : (
							<>
								<div class='mb-5'>
									<n-tag bordered={false} type='info'>
										当前指针速度 : {pointerSpeedHook.currentPointerSpeed.value}
									</n-tag>
								</div>
								<n-button
									size='small'
									type='info'
									loading={deviceStore.loading}
									onClick={() => (pointerSpeedHook.isEdit.value = true)}>
									{{
										default: () => <>修改指针速度</>,
									}}
								</n-button>
							</>
						)}
					</div>
				)}
			</>
		),
		isShow: () => ['tablet'].includes(deviceStore.deviceType),
	},
	{
		title: '个性化主题导入',
		content: () => (
			<>
				<n-button
					size='small'
					type='warning'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openImportThemeManger()}>
					{{
						icon: () => <img src='/images/apps/mi_theme.webp' />,
						default: () => <>导入个性化主题</>,
					}}
				</n-button>

				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>
						需要搭配 LSPosed 模块[主题破解]，才能够正常导入[个性化主题]，导入按钮位于界面最底部[从SD卡导入]~
					</p>
					<n-button
						class='mt-2'
						strong
						size='small'
						secondary
						type='warning'
						onClick={() =>
							getAppDownload('主题破解', 'https://caiyun.139.com/m/i?135CmXA9aKh8Y', 'original')
						}>
						获取主题破解
					</n-button>
				</n-alert>
			</>
		),
	},
	{
		title: 'AI 动态壁纸',
		content: () => (
			<>
				<n-button
					size='small'
					type='error'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openAiWallpaperList()}>
					{{
						icon: () => <img src='/images/apps/mi_theme.webp' />,
						default: () => <>AI 动态壁纸</>,
					}}
				</n-button>

				<n-button
					strong
					secondary
					size='small'
					circle
					type='error'
					class='ml-2'
					onClick={() => deviceApi.openAiWallpaperGuide()}>
					{{
						icon: () => (
							<n-icon>
								<QuestionMarkCircleIcon />
							</n-icon>
						),
					}}
				</n-button>
			</>
		),
		isShow: () => Boolean(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2),
	},
	{
		title: '动态壁纸循环播放',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => videoWallpaperLoopHook.change()}>
					{{
						icon: () => <img src='/images/apps/mi_theme.webp' />,
						default: () => <>动态壁纸循环播放</>,
					}}
				</n-button>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>
						配置后不支持循环播放的「动态壁纸」将强制开启循环播放，每次更换「动态壁纸」后会导致循环播放失效，需要在此处重新配置
					</p>
				</n-alert>
			</>
		),
	},
	{
		title: '算力共享(Pad)',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openAiDistComputeClient()}>
					{{
						icon: () => <img src='/images/icons/aicr.png' />,
						default: () => <>算力共享(Pad)</>,
					}}
				</n-button>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>在附近高算力设备提供的算力支持下，平板获得部分 AI 功能</p>
				</n-alert>
			</>
		),
		isShow: () =>
			Boolean(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.deviceType === 'tablet'),
	},
	{
		title: '算力共享(Phone)',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openAiDistComputeServer()}>
					{{
						icon: () => <img src='/images/icons/aicr.png' />,
						default: () => <>算力共享(Phone)</>,
					}}
				</n-button>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>将设备的 AI 算力共享给平板设备，让平板设备获得部分 AI 功能</p>
				</n-alert>
			</>
		),
		isShow: () =>
			Boolean(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.deviceType !== 'tablet'),
	},
	{
		title: '超级小爱翻译',
		content: () => (
			<n-button
				size='small'
				type='error'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openAiTranslationChat()}>
				{{
					icon: () => <img src='/images/icons/ai_icon.png' />,
					default: () => <>超级小爱翻译</>,
				}}
			</n-button>
		),
	},
	{
		title: 'AI 同声传译',
		content: () => (
			<>
				<n-button
					size='small'
					type='error'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openAiTranslationSynchronize()}>
					{{
						icon: () => <img src='/images/icons/ai_icon.png' />,
						default: () => <>AI 同声传译</>,
					}}
				</n-button>

				<n-alert class='mt-5' type='error' show-icon={false} bordered={false}>
					<p>打电话或开会时，打开"AI同声传译"，可以将双方的说话内容实时翻译给对方，帮助跨语言聊天。</p>
					<p>如无法打开请将"小爱翻译"和"超级小爱"升级到最新版</p>
				</n-alert>
			</>
		),
	},
	{
		title: '焕新存储',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openFboResultActivity()}>
					打开 焕新存储信息面板
				</n-button>

				<n-alert class='mb-5 mt-5' type='success' show-icon={false} bordered={false}>
					<div>
						<p>
							焕新存储启用状态:
							<n-button
								size='tiny'
								class='ml-3'
								type={fboHook.fboEnable.value ? 'success' : 'error'}
								loading={deviceStore.loading}
								onClick={() => fboHook.handleEnableFbo()}>
								{fboHook.fboEnable.value ? '已启用' : '未启用(点击启用)'}
							</n-button>
						</p>
						<p>
							启用状态通常由小米云控控制，模块支持强制启用焕新存储，但该功能受系统底层支持情况而异，不支持的设备即使启用也不会生效。
						</p>
						<n-switch
							value={fboHook.isAutoStartFbo.value ? true : false}
							onUpdateValue={(value: boolean) => fboHook.changeIsAutoEnableFbo(value)}
							rail-style={railStyle}
							loading={deviceStore.loading}>
							{{
								checked: () => '已强制启用焕新存储',
								unchecked: () => '跟随系统默认云控规则',
							}}
						</n-switch>
					</div>
				</n-alert>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>
						焕新存储激活状态:
						<n-button
							size='tiny'
							class='ml-3'
							type={fboHook.fboServiceCtrl.value ? 'success' : 'error'}
							loading={deviceStore.loading}
							onClick={() => fboHook.handleEnableFboServiceCtrl()}>
							{fboHook.fboServiceCtrl.value ? '已激活' : '未激活(点击激活)'}
						</n-button>
					</p>

					{fboHook.fboInstalld.value && (
						<p class='mt-1'>
							焕新存储运行状态:
							<n-tag
								size='small'
								class='ml-3'
								type='info'
								loading={deviceStore.loading}
								onClick={() => {}}>
								{fboHook.fboInstalld.value}
							</n-tag>
						</p>
					)}

					<p>激活后仍然需要满足以下条件才会在特定时间触发焕新存储：</p>
					<p>① 夜间12点半-凌晨5点</p>
					<p>② 息屏状态</p>
					<p>③ 电量大于75%(或保持手机充电)</p>
					<p>④ 电池温度小于40℃</p>
					<p>
						进行焕新存储期间检测到其中任意条件不满足，焕新存储会被中断，待满足后继续执行，当满足上述4个条件后，此功能也并不是每天都生效，需要文件碎片累积到一定程度会主动进行。
					</p>
					<p>（焕新存储流程结束后，激活状态会被关闭，您可以前往 Web UI 重新激活）</p>

					<n-switch
						value={fboHook.isAutoRegularlyFbo.value ? true : false}
						onUpdateValue={(value: boolean) => fboHook.changeIsAutoRegularlyFbo(value)}
						rail-style={railStyle}
						loading={deviceStore.loading}>
						{{
							checked: () => '已启用每日闲时维护',
							unchecked: () => '未启用每日闲时维护',
						}}
					</n-switch>
				</n-alert>
			</>
		),
		isShow: () => fboHook.isInit.value && ['tablet', 'fold'].includes(deviceStore.deviceType),
	},
	{
		title: 'Google 服务',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openGoogleSettings()}>
					{{
						icon: () => <img src='/images/icons/google.png' />,
						default: () => 'Google 服务',
					}}
				</n-button>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>仅在开启 Google 基础服务 下生效</p>
				</n-alert>
			</>
		),
	},
	{
		title: '隐身模式',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openInVisibleMode()}>
					{{
						icon: () => <EyeSlashIcon />,
						default: () => '隐身模式',
					}}
				</n-button>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>开启后系统将拒绝所有应用录音、定位和拍照，保护您的隐私安全</p>
				</n-alert>
			</>
		),
	},
	{
		title: 'Joyose 云控数据',
		content: () => (
			<>
				<n-button
					size='small'
					type='error'
					secondary
					loading={deviceStore.loading}
					onClick={() => joyoseHook.clearCloudData()}>
					{{
						icon: () => <CircleStackIcon />,
						default: () => '重置 Joyose 云控',
					}}
				</n-button>

				<n-alert class='mt-5' type='error' show-icon={false} bordered={false}>
					<p>重置 Joyose 云控数据后系统会尝试重新获取 Joyose 的云控数据，清确保当前在 Wifi 网络环境下，否则无法正常获取云控数据。</p>
					<p>(如仍然无法获取到新的 Joyose 云控数据，请尝试重启设备)</p>
				</n-alert>
			</>
		),
	},
	{
		title: '晕车缓解',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openCarSicknessReliefSettings()}>
					{{
						icon: () => <EyeSlashIcon />,
						default: () => '晕车缓解',
					}}
				</n-button>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>检测到车辆运动时，屏幕两侧显示圆点提示运动状态，可能有助于延缓晕车反应的出现</p>
					<p>(需要受支持的管家版本才能正常使用)</p>
				</n-alert>
			</>
		),
	},
	{
		title: '自动任务',
		content: () => (
			<n-button
				size='small'
				type='success'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openAutoTask()}>
				{{
					icon: () => (
						<n-icon>
							<CalendarIcon />
						</n-icon>
					),
					default: () => '自动任务',
				}}
			</n-button>
		),
	},
	{
		title: '实时字幕',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openAITranslation()}>
					{{
						icon: () => (
							<n-icon>
								<FilmIcon />
							</n-icon>
						),
						default: () => '实时字幕',
					}}
				</n-button>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>部分设备需要安装最新版"小爱翻译"或者强开「实时字幕」才能够正常使用！</p>
				</n-alert>
			</>
		),
	},
	{
		title: 'Mi剪辑',
		content: () => (
			<n-button
				size='small'
				type='error'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openMiFilm()}>
				{{
					icon: () => (
						<n-icon>
							<ScissorsIcon />
						</n-icon>
					),
					default: () => 'Mi剪辑',
				}}
			</n-button>
		),
	},
	{
		title: '极暗模式',
		content: () => (
			<n-button
				size='small'
				type='info'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openBrightColors()}>
				{{
					icon: () => (
						<n-icon>
							<BanknotesIcon />
						</n-icon>
					),
					default: () => '极暗模式',
				}}
			</n-button>
		),
	},
	{
		title: '颜色反转',
		content: () => (
			<n-button
				size='small'
				type='info'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openAccessibilityInversion()}>
				{{
					icon: () => (
						<n-icon>
							<ViewfinderCircleIcon />
						</n-icon>
					),
					default: () => '颜色反转',
				}}
			</n-button>
		),
	},
	{
		title: '正在运行的服务',
		content: () => (
			<n-button
				size='small'
				type='info'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openManageApplicationsActivity()}>
				{{
					icon: () => (
						<n-icon>
							<ServerIcon />
						</n-icon>
					),
					default: () => '正在运行的服务',
				}}
			</n-button>
		),
	},
	{
		title: '内存使用量',
		content: () => (
			<n-button
				size='small'
				type='info'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openMemorySettingsActivity()}>
				{{
					icon: () => (
						<n-icon>
							<ServerStackIcon />
						</n-icon>
					),
					default: () => '内存使用量',
				}}
			</n-button>
		),
	},
	{
		title: '通知日志',
		content: () => (
			<n-button
				size='small'
				type='info'
				secondary
				loading={deviceStore.loading}
				onClick={() => deviceApi.openNotificationStationActivity()}>
				{{
					icon: () => (
						<n-icon>
							<BellAlertIcon />
						</n-icon>
					),
					default: () => '通知日志',
				}}
			</n-button>
		),
	},
	{
		title: '性能监视器',
		content: () => (
			<n-dropdown
				size='large'
				trigger='click'
				options={[
					{ label: '打开性能监视器', key: 'start' },
					{ label: '关闭性能监视器', key: 'stop' },
				]}
				onSelect={(key: 'start' | 'stop') => {
					deviceApi.frameRateService(key);
				}}>
				{{
					default: () => (
						<n-button
							size='small'
							class='mb-3 mr-3'
							type='info'
							color='#8a2be2'
							secondary
							loading={deviceStore.loading}>
							{{
								icon: () => (
									<n-icon>
										<CpuChipIcon />
									</n-icon>
								),
								default: () => '性能监视器',
							}}
						</n-button>
					),
				}}
			</n-dropdown>
		),
		isShow: () =>
			!deviceStore.MIOSVersion ||
			(deviceStore.MIOSVersion && deviceStore.MIOSVersion < 2) ||
			deviceStore.androidTargetSdk < 35,
	},
	{
		title: '刷新率监视器',
		content: () => (
			<n-dropdown
				size='large'
				trigger='click'
				options={[
					{ label: '打开刷新率监视器', key: 'open' },
					{ label: '关闭刷新率监视器', key: 'close' },
				]}
				onSelect={(key: string) => {
					key === 'open' ? deviceApi.setFpsFrameService(true) : deviceApi.setFpsFrameService(false);
				}}>
				{{
					default: () => (
						<n-button size='small' class='mb-3 mr-3' type='info' secondary loading={deviceStore.loading}>
							{{
								icon: () => (
									<n-icon>
										<BoltIcon />
									</n-icon>
								),
								default: () => '刷新率监视器',
							}}
						</n-button>
					),
				}}
			</n-dropdown>
		),
	},
];

const filteredEnhanceList = computed(() => {
	const keyword = searchKeyword.value.trim().toLowerCase();
	return enhanceList.filter(item => {
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
						>系统体验增强</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					系统体验增强，提供丰富的客制化功能增强。
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
							placeholder="搜索功能名称"
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
						v-for="(enhanceItem, index) in filteredEnhanceList"
						:key="index"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							{{ enhanceItem.title }}
							<RenderJsx
								v-if="enhanceItem.titleSlot"
								:content="enhanceItem.titleSlot && enhanceItem.titleSlot()" />
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<RenderJsx
								v-if="enhanceItem.content"
								:content="enhanceItem.content && enhanceItem.content()" />
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
