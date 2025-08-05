<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { computed, type CSSProperties } from 'vue';
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
									secondary
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
