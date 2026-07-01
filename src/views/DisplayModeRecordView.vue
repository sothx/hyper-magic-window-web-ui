<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { computed, type CSSProperties } from 'vue';
import $to from 'await-to-js';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import { useDisplayModeRecord } from '@/hooks/useDisplayModeRecord';
import { BoltIcon, CpuChipIcon } from '@heroicons/vue/24/solid';
const deviceStore = useDeviceStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const typeList = ['info', 'error', 'warning', 'success'];
const getType = (id: number) => typeList[(id - 1) % typeList.length];
const displayModeRecordHook = useDisplayModeRecord();
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
</script>
<template>
	<div class="setting">
		<div class="mt-5">
			<div class="px-4 sm:px-0">
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
						>分辨率与刷新率</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					灵活切换设备的分辨率与刷新率，持续到下次设备重启。
				</p>
			</div>
			<n-card size="small" class="mt-5 mb-5">
				<n-alert class="mt-5 mb-5" :show-icon="false" type="info">
					<p
						>为避免系统干扰影响，模块将一直维持每秒自动轮询您配置的刷新率和分辨率配置，您可以手动控制是否需要该守护进程，关闭守护进程后，如果应用的刷新率和分辨率被系统行为覆盖（如游戏工具箱、小米平板触控笔等），则您需要手动重新启用。</p
					>
					<div class="mt-3">
						<n-skeleton
							v-if="!displayModeRecordHook.isInit.value"
							:width="160"
							:sharp="false"
							round
							size="small" />
						<n-switch
							v-else
							:rail-style="railStyle"
							:value="displayModeRecordHook.isEnableDaemonProcess.value"
							:loading="deviceStore.loading || displayModeRecordHook.loading.value"
							@update:value="async (value: boolean) => displayModeRecordHook.changeDaemonProcessMode(value)">
							<template #checked>已启用守护进程</template>
							<template #unchecked>已禁用守护进程</template>
						</n-switch>
					</div>
				</n-alert>
				<n-alert v-if="deviceStore.deviceType === 'tablet'" :show-icon="true" type="info">
					<p>小米平板手写笔仅能在 60hz 和 120hz 的刷新率下正常工作</p>
				</n-alert>
				<div class="gap-4 mt-5 sm:px-0">
					<n-dropdown
						size="large"
						trigger="click"
						:options="[
							{ label: '打开性能监视器', key: 'start' },
							{ label: '关闭性能监视器', key: 'stop' },
						]"
						@select="(key: 'start' | 'stop') => { deviceApi.frameRateService(key) }">
						<n-button
							class="mb-3 mr-3"
							color="#8a2be2"
							type="info"
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
					<n-dropdown
						size="large"
						trigger="click"
						:options="[
							{ label: '打开刷新率监视器', key: 'open' },
							{ label: '关闭刷新率监视器', key: 'close' },
						]"
						@select="(key: string) => { key === 'open' ? deviceApi.setFpsFrameService(true) : deviceApi.setFpsFrameService(false) }">
						<n-button class="mr-3" type="info" secondary :loading="deviceStore.loading">
							<template #icon>
								<n-icon>
									<BoltIcon />
								</n-icon>
							</template>
							刷新率监视器
						</n-button>
					</n-dropdown>
				</div>
			</n-card>
			<div class="mt-6 border-gray-100">
				<dl class="mb-5 divide-gray-100">
					<n-card size="small">
						<div class="grid gap-4 sm:px-0 lg:grid-cols-2">
							<n-alert
								class="w-full"
								:show-icon="false"
								:title="`ID:${item.id}`"
								v-for="item in displayModeRecordHook.formatDisplayModeList.value"
								:key="item.id"
								:type="getType(item.id)">
								<p class="mr-3">分辨率: {{ `${item.width}x${item.height}` }}</p>
								<p class="mr-3">刷新率: {{ `${item.fps} Hz` }}</p>
								<n-button
									class="mt-2"
									strong
									secondary
									:type="getType(item.id)"
									:loading="deviceStore.loading"
									size="small"
									@click="() => displayModeRecordHook.selectDisplayMode(item)"
									>应用配置</n-button
								>
								<n-button
									class="ml-2 mt-2"
									v-if="displayModeRecordHook.isInit.value"
									strong
									:secondary="displayModeRecordHook.autoEnableID.value !== Number(item.id)"
									:type="getType(item.id)"
									:loading="deviceStore.loading"
									size="small"
									@click="() => displayModeRecordHook.selectAutoEnable(item)"
									>{{
										displayModeRecordHook.autoEnableID.value === Number(item.id)
											? '已配置开机自启'
											: '配置开机自启'
									}}</n-button
								>
							</n-alert>
						</div>
					</n-card>
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
