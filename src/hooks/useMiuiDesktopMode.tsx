import { ref, computed, onMounted } from 'vue';
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

export type KeyboardMode = 0 | 1 | 2;
export function useMiuiDesktopMode() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const currentMiuiDktMode = ref<boolean>(false);

	const changeMiuiDktMode = async (value: boolean) => {
		const [putCurrentPenEnableErr, putCurrentPenEnableRes] = await $to(
			deviceApi.putCurrentMiuiDktMode(value ? 1 : 'null')
		);
		if (putCurrentPenEnableErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		} else {
			currentMiuiDktMode.value = value;
		}
	}

	onMounted(async () => {
        if (deviceStore.enabledMiuiDesktopMode) {
			const [, getCurrentMiuiDktModeResolve] = await $to<string, string>(deviceApi.getCurrentMiuiDktMode());

			if (Number(getCurrentMiuiDktModeResolve) === 1) {
				currentMiuiDktMode.value = true;
			}
		}
	});

	return {
		currentMiuiDktMode,
		changeMiuiDktMode
	};
}
