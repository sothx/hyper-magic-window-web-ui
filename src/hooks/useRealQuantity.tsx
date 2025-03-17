import { ref, computed, onMounted, reactive, watchEffect, onUnmounted, nextTick } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import {
	NButton,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
	type DataTableColumns,
	type NInput,
} from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';

export function useRealQuantity() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	interface realQuantityInfo {
		current: number
		autoReload: boolean
		timer: number
		reload: () => Promise<void>
		interval: number | null
	}

	const qcomBatteryFg1RSocInfo = reactive<realQuantityInfo>({
		current: 0,
		autoReload: false,
		timer: 3,
		reload: async() => {
			const [, getQcomBatteryFg1RSocRes] = await $to<string, string>(deviceApi.getQcomBatteryFg1RSoc());
			if (getQcomBatteryFg1RSocRes) {
				qcomBatteryFg1RSocInfo.current = Number(getQcomBatteryFg1RSocRes);
			}
		},
		interval: null
	})

	const capacityRawInfo = reactive<realQuantityInfo>({
		current: 0,
		autoReload: false,
		timer: 3,
		reload: async() => {
			const [, getCapacityRawRes] = await $to<string, string>(deviceApi.getCapacityRaw());
			if (getCapacityRawRes) {
				capacityRawInfo.current = Number(getCapacityRawRes);
			}
		},
		interval: null
	})

	const setupAutoReload = (info: realQuantityInfo) => {
		// Clear the existing interval if any
		if (info.interval) {
			clearInterval(info.interval);
			info.interval = null;
		}

		// Set a new interval if autoReload is true
		if (info.autoReload) {
			info.interval = setInterval(() => {
				info.reload();
			}, info.timer * 1000);
		}
	};

	watchEffect(() => setupAutoReload(qcomBatteryFg1RSocInfo));
	watchEffect(() => setupAutoReload(capacityRawInfo));

	onMounted(() => {
		nextTick(() => {
			qcomBatteryFg1RSocInfo.reload()
			capacityRawInfo.reload()
		});
	});

	onUnmounted(() => {
		// Clear intervals when the component is unmounted
		if (qcomBatteryFg1RSocInfo.interval !== null) clearInterval(qcomBatteryFg1RSocInfo.interval);
		if (capacityRawInfo.interval !== null) clearInterval(capacityRawInfo.interval);
	});

	return {
		qcomBatteryFg1RSocInfo,
		capacityRawInfo
	};
}
