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

	const isInit = ref<boolean>(false);

	const fetchData = async () => {
		const [
			[, getMiuiExtmDmOptEnableResolve],
			[, getBackingDevResolve],
			[, getMiuiExtmDmOptTotalWriteBackResolve],
			[, getMiuiExtmDmOptTotalReadResolve],
			[, getMiuiExtmDmOptHasWriteBackResolve]
		] = await Promise.all([
			$to<string, string>(deviceApi.getMiuiExtmDmOptEnable()),
			$to<string, string>(deviceApi.getBackingDev()),
			$to<string, string>(deviceApi.getMiuiExtmDmOptTotalWriteBack()),
			$to<string, string>(deviceApi.getMiuiExtmDmOptTotalRead()),
			$to<string, string>(deviceApi.getMiuiExtmDmOptHasWriteBack())
		]);
	
		// 赋值
		if (getMiuiExtmDmOptEnableResolve === 'true') miuiExtmDmOptEnable.value = true;
		if (getBackingDevResolve) backingDev.value = getBackingDevResolve;
		if (Number(getMiuiExtmDmOptTotalWriteBackResolve) > 0) totalWriteBack.value = Number(getMiuiExtmDmOptTotalWriteBackResolve);
		if (Number(getMiuiExtmDmOptTotalReadResolve) > 0) totalRead.value = Number(getMiuiExtmDmOptTotalReadResolve);
		if (Number(getMiuiExtmDmOptHasWriteBackResolve) > 0) hasWriteBack.value = Number(getMiuiExtmDmOptHasWriteBackResolve);

		isInit.value = true;
	};

	onMounted(() => {
		setTimeout(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		},0);
	});

	return {
		backingDev,
		miuiExtmDmOptEnable,
		totalWriteBack,
		hasWriteBack,
		totalRead,
		isInit
	};
}
