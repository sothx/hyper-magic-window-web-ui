import { ref, computed, onMounted, nextTick } from 'vue';
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
export function useZRAMWriteback() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const backingDev = ref<string>('');

	const miuiExtmDmOptEnable = ref<boolean>(false);

	const totalWriteBack = ref<number>(0);

	const hasWriteBack = ref<number>(0);

	const totalRead = ref<number>(0);

	const fetchData = async () => {
		const [, getMiuiExtmDmOptEnableResolve] = await $to<string, string>(deviceApi.getMiuiExtmDmOptEnable());
		if (getMiuiExtmDmOptEnableResolve === 'true')  {
			miuiExtmDmOptEnable.value = true
		}
		const [, getBackingDevResolve] = await $to<string,string>(deviceApi.getBackingDev());
		if (getBackingDevResolve) {
			backingDev.value = getBackingDevResolve
		}
		const [, getMiuiExtmDmOptTotalWriteBackResolve] = await $to<string, string>(deviceApi.getMiuiExtmDmOptTotalWriteBack());
		if (Number(getMiuiExtmDmOptTotalWriteBackResolve) && Number(getMiuiExtmDmOptTotalWriteBackResolve) > 0) {
			totalWriteBack.value = Number(getMiuiExtmDmOptTotalWriteBackResolve)
		}
		const [, getMiuiExtmDmOptTotalReadResolve] = await $to<string, string>(deviceApi.getMiuiExtmDmOptTotalRead());
		if (Number(getMiuiExtmDmOptTotalReadResolve) && Number(getMiuiExtmDmOptTotalReadResolve) > 0) {
			totalRead.value = Number(getMiuiExtmDmOptTotalReadResolve)
		}
		const [, getMiuiExtmDmOptHasWriteBackResolve] = await $to<string, string>(deviceApi.getMiuiExtmDmOptHasWriteBack());
		if (Number(getMiuiExtmDmOptHasWriteBackResolve) && Number(getMiuiExtmDmOptHasWriteBackResolve) > 0) {
			hasWriteBack.value = Number(getMiuiExtmDmOptHasWriteBackResolve)
		}
	}

	onMounted(async () => {
		nextTick(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		});
	});

	return {
		backingDev,
		miuiExtmDmOptEnable,
		totalWriteBack,
		hasWriteBack,
		totalRead
	};
}
