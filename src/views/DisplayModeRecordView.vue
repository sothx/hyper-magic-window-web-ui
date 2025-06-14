<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { computed, type CSSProperties } from 'vue';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import { useDisplayModeRecord } from '@/hooks/useDisplayModeRecord';
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
					灵活切换手机/平板分辨率和刷新率，持续到下次设备重启
				</p>
			</div>
			<div class="mt-6 border-gray-100">
				<dl class="mb-5 divide-gray-100">
          <n-card size="small">
           <div class="grid px-4 sm:px-0 gap-4 lg:grid-cols-2">
						<n-alert
							class="mb-5 w-full"
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
						</n-alert>
					</div>
          </n-card>
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
