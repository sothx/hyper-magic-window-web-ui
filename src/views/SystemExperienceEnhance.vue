<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { computed, h, onMounted, ref, shallowRef, type CSSProperties } from 'vue';
import { createDiscreteApi, darkTheme, lightTheme, NInput, type ConfigProviderProps } from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';
import { useAmktiao, type KeyboardModeOptions } from '@/hooks/useAmktiao';
import { useMiuiDesktopMode } from '@/hooks/useMiuiDesktopMode';
import { useMIUIContentExtension } from '@/hooks/useMIUIContentExtension';
import { useVideoWallpaperLoop } from '@/hooks/useVideoWallpaperLoop';
import { useDisabledOS2SystemPreStart } from '@/hooks/useDisabledOS2SystemPreStart';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { useFbo } from '@/hooks/useFbo';
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
const deviceStore = useDeviceStore();
const miuiDesktopModeHook = useMiuiDesktopMode();
const MIUIContentExtensionHook = useMIUIContentExtension();
const miuiCursorStyleHook = useMiuiCursorStyle();
const mouseGestureNaturalscrollHook = useMouseGestureNaturalscroll();
const pointerSpeedHook = usePointerSpeed();
const developmentSettingsEnabledHook = useDevelopmentSettingsEnabled();
const videoWallpaperLoopHook = useVideoWallpaperLoop();
const useDisabledOS2SystemPreStartHook = useDisabledOS2SystemPreStart();
const fboHook = useFbo();
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
						>系统体验增强</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					系统体验增强，提供丰富的客制化功能增强。
				</p>
			</div>

			<div
				:class="`mt-3 border-t ${deviceStore.isDarkMode ? 'divide-sothx-gray-color border-sothx-gray-color' : 'divide-gray-200 border-gray-200'}`">
				<dl :class="`divide-y ${deviceStore.isDarkMode ? 'divide-sothx-gray-color' : 'divide-gray-200'}`">
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
							开发者模式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-skeleton
								v-if="!developmentSettingsEnabledHook.isInit.value"
								:width="150"
								:sharp="false"
								:round="true"
								size="small" />
							<n-switch
								v-else
								@update:value="(value: boolean) => developmentSettingsEnabledHook.change(value ? 1 : 0)"
								:rail-style="railStyle"
								:value="developmentSettingsEnabledHook.isEnabled"
								:loading="deviceStore.loading || developmentSettingsEnabledHook.loading.value">
								<template #checked>已开启开发者模式</template>
								<template #unchecked>已关闭开发者模式</template>
							</n-switch>
						</dd>
					</div>
					<div
						v-if="useDisabledOS2SystemPreStartHook.isShow.value"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							应用预加载
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-switch
								@update:value="(value: boolean) => useDisabledOS2SystemPreStartHook.change(value)"
								:rail-style="railStyle"
								:value="deviceStore.preStartProp.module"
								:loading="deviceStore.loading">
								<template #checked>已开启应用预加载</template>
								<template #unchecked>已禁用应用预加载</template>
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
								<p>暗码必须以*#*#开头，且以#*#*结尾</p>
								<p>eg: 开启 LSPosed 管理器的暗码：*#*#5776733#*#*</p>
								<p
									>「安全警示:
									暗码拨号盘是面向开发者调试的功能，用于打开一些隐藏设定，如果您不了解暗码作用与功能建议不要轻易尝试，可能会导致您的设备数据丢失！」</p
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
							<n-skeleton
								:width="123"
								:sharp="false"
								v-if="!miuiDesktopModeHook.isInit.value"
								:round="true"
								size="small" />
							<n-switch
								v-else
								@update:value="(value: boolean) => miuiDesktopModeHook.changeMiuiDktMode(value)"
								:rail-style="railStyle"
								:disabled="!deviceStore.enabledMiuiDesktopMode"
								:value="miuiDesktopModeHook.currentMiuiDktMode.value"
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
									deviceStore.isInstallMIUIContentExtension &&
									deviceStore.deviceCharacteristics === 'tablet'
								"
								class="mt-5"
								type="info"
								:show-icon="false"
								:bordered="false">
								<p
									>模块安装后可能会导致「传送门」被异常添加到「游戏工具箱」，您可以通过
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
								<p class="mt-5"
									>由于小米「传送门」存在「应用黑名单」不定期重置的BUG，您可以通过
									<n-dropdown
										size="large"
										trigger="click"
										:options="[
											{ label: '应用黑名单固化', key: 'onlyRead' },
											{ label: '解除应用黑名单固化', key: 'readAndWrite' },
										]"
										@select="(key: 'onlyRead' | 'readAndWrite') => { key === 'onlyRead' ? MIUIContentExtensionHook.setAuthIsOnlyRead() : MIUIContentExtensionHook.setAuthIsReadAndWrite() }">
										<n-button
											size="small"
											type="info"
											color="#8a2be2"
											secondary
											:loading="deviceStore.loading">
											应用黑名单固化管理
										</n-button>
									</n-dropdown>
									来固化「应用黑名单」的权限，避免被系统重置。</p
								>
							</n-alert>
						</dd>
					</div>
					<div
						v-if="
							deviceStore.MIOSVersion &&
							deviceStore.MIOSVersion >= 2 &&
							deviceStore.androidTargetSdk >= 35 &&
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
					<div
						v-if="
							deviceStore.deviceCharacteristics === 'tablet' &&
							(useDisplaySettingsHook.hasMTKDisplayBrightness.value ||
								useDisplaySettingsHook.hasQComDisplayBrightness.value)
						"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							<p>强制屏幕最低亮度</p>
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<div>
								<n-button
									size="small"
									type="warning"
									secondary
									:loading="deviceStore.loading"
									@click="() => useDisplaySettingsHook.open()">
									强制屏幕最低亮度
								</n-button>
							</div>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false">
								<p
									>通过将屏幕亮度调整为0，达到屏幕最低亮度但是不影响屏幕的触控操作，可能适合部分特殊场景使用，游戏或者视频场景仍然推荐使用「熄屏挂机」和「熄屏听剧」，使用该功能会自动关闭「自动亮度」，请悉知，如需恢复屏幕显示需要敲击两次「电源键」。</p
								>
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
						v-if="amktiaoHook.hasPenEnableControl.value"
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
							<n-skeleton
								v-if="!amktiaoHook.isInit.value"
								:width="80"
								:sharp="false"
								:round="true"
								size="small" />
							<n-switch
								v-else
								@update:value="(value: boolean) => amktiaoHook.changePenEnableMode(value)"
								:rail-style="railStyle"
								:disabled="!deviceStore.showThirdPartySetting.amktiaoROMInterface"
								:value="amktiaoHook.currentPenEnable.value ? true : false"
								:loading="deviceStore.loading">
								<template #checked>已启用</template>
								<template #unchecked>未启用</template>
							</n-switch>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false"
								>仅兼容水龙(Amktiao)的内核，存在 /sys/touchpanel/pen_enable 开关映射时生效</n-alert
							>
						</dd>
					</div>
					<div
						v-if="amktiaoHook.hasPenUpdateControl.value"
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
							<n-skeleton
								v-if="!amktiaoHook.isInit.value"
								:width="110"
								:sharp="false"
								:round="true"
								size="small" />
							<n-switch
								v-else
								@update:value="(value: boolean) => amktiaoHook.changePenUpdateMode(value)"
								:rail-style="railStyle"
								:disabled="!deviceStore.showThirdPartySetting.amktiaoROMInterface"
								:value="amktiaoHook.currentPenUpdate.value ? true : false"
								:loading="deviceStore.loading">
								<template #checked>二代笔驱动</template>
								<template #unchecked>一代笔驱动</template>
							</n-switch>
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false">
								<p>仅兼容水龙(Amktiao)的内核，存在 /sys/touchpanel/pen_update 开关映射时生效</p>
							</n-alert>
						</dd>
					</div>
					<div
						v-if="amktiaoHook.hasKeyboardControl.value"
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
							<n-skeleton v-if="!amktiaoHook.isInit.value" :width="75" :sharp="false" size="small" />
							<n-dropdown
								v-else
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
							<n-alert class="mt-5" type="warning" :show-icon="false" :bordered="false">
								<p>仅兼容水龙(Amktiao)的内核，存在 /sys/touchpanel/keyboard 开关映射时生效</p>
								<p>「复位键盘」仅在键盘异常时使用，一般情况下不需要</p>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							鼠标光标样式
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-skeleton
								v-if="!miuiCursorStyleHook.isInit.value"
								:width="65"
								:sharp="false"
								size="small" />
							<n-dropdown
								v-else
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
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<div>
									<p
										>由于小米BUG，部分系统存在开机后「鼠标光标样式」被异常重置的问题，模块提供「鼠标光标样式开机自配置」来解决这个问题，开启后每次开机会被配置为指定的「鼠标光标样式」，系统设置内的修改会在重启后失效。</p
									>
									<n-switch
										@update:value="(value: boolean) => miuiCursorStyleHook.changeAutoStartMiuiCursorStyleType(value)"
										:rail-style="railStyle"
										class="mt-5"
										:value="
											miuiCursorStyleHook.currentAutoStartMiuiCursorStyleType.value ? true : false
										"
										:loading="deviceStore.loading">
										<template #checked>已启用开机自配置</template>
										<template #unchecked>未启用开机自配置</template>
									</n-switch>
								</div>
							</n-alert>
						</dd>
					</div>
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							鼠标自然滚动
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-skeleton
								:width="165"
								v-if="!mouseGestureNaturalscrollHook.isInit.value"
								:sharp="false"
								:round="true"
								size="small" />
							<n-switch
								v-else
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
							<div v-if="!pointerSpeedHook.isInit.value">
								<n-skeleton text :repeat="1" :sharp="false" :round="true" />
								<n-skeleton text :repeat="1" :sharp="false" size="small" />
							</div>
							<div v-else>
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
							</div>
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
					<div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							动态壁纸循环播放
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<n-button
								size="small"
								type="info"
								secondary
								:loading="deviceStore.loading"
								@click="() => videoWallpaperLoopHook.change()">
								<template #icon>
									<img src="/images/apps/mi_theme.webp" />
								</template>
								动态壁纸循环播放
							</n-button>
							<n-alert class="mt-5" type="info" :show-icon="false" :bordered="false">
								<p
									>配置后不支持循环播放的「动态壁纸」将强制开启循环播放，每次更换「动态壁纸」后会导致循环播放失效，需要在此处重新配置</p
								>
							</n-alert>
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
									>打电话或开会时，打开"AI同声传译"，可以将双方的说话内容实时翻译给对方，帮助跨语言聊天。</p
								>
								<p>如无法打开请将"小爱翻译"和"超级小爱"升级到最新版</p>
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
								<p>部分设备需要安装最新版"小爱翻译"或者强开「实时字幕」才能够正常使用！</p>
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
					<div
						v-if="
							!deviceStore.MIOSVersion ||
							(deviceStore.MIOSVersion && deviceStore.MIOSVersion < 2) ||
							deviceStore.androidTargetSdk < 35
						"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
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
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
