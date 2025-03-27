<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { computed, h, ref, type CSSProperties } from 'vue';
import { createDiscreteApi, darkTheme, lightTheme, NInput, type ConfigProviderProps } from 'naive-ui';
import { useRealQuantity } from '@/hooks/useRealQuantity';
const deviceStore = useDeviceStore();
const realQuantityHook = useRealQuantity();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
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
	<div class="batteryHealth">
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
						>电池健康</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					电池健康，提供电池健康状态监测。
				</p>
			</div>

			<div
				:class="`mt-3 border-t ${deviceStore.isDarkMode ? 'divide-sothx-gray-color border-sothx-gray-color' : 'divide-gray-200 border-gray-200'}`">
				<dl :class="`divide-y ${deviceStore.isDarkMode ? 'divide-sothx-gray-color' : 'divide-gray-200'}`">
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
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
