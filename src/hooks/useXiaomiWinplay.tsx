import { ref, computed, onMounted, nextTick, h } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import { RenderJsx } from '@/components/RenderJSX';
import {
	NButton,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ButtonProps,
	type ConfigProviderProps,
	type DataTableColumns,
	type NInput,
} from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';
import { spawn } from '@/utils/kernelsu';
export interface KeyboardModeOptions {
	label: string;
	type: string;
	key: 0 | 1 | 2;
}

export type PenUpdate = 0 | 1;

export type PenEnable = 0 | 1;

export type KeyboardMode = 0 | 1 | 2;
export function useXiaomiWinPlay() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isSupportProjectTreble = ref<boolean>(false);

	const ProjectTrebleCurrentVerison = ref<number>(1);

	const XiaomiWinPlayIsInstalled = ref<boolean>(false);

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

	const fetchData = async () => {
		const [, getXiaomiWinPlayIsInstalledRes] = await $to<string, string>(deviceApi.getXiaomiWinPlayIsInstalled());
		if (getXiaomiWinPlayIsInstalledRes && getXiaomiWinPlayIsInstalledRes === 'installed') {
			XiaomiWinPlayIsInstalled.value = true;
		} else {
			XiaomiWinPlayIsInstalled.value = false;
		}
		const [, getProjectTrebleWinplayVersionRes] = await $to<string, string>(
			deviceApi.getProjectTrebleWinplayVersion(),
		);
		if (getProjectTrebleWinplayVersionRes && typeof Number(getProjectTrebleWinplayVersionRes) === 'number') {
			ProjectTrebleCurrentVerison.value = Number(getProjectTrebleWinplayVersionRes);
		} else {
			ProjectTrebleCurrentVerison.value = 1;
		}
		const [, getProjectTrebleSupportWinPlayRes] = await $to<string, string>(
			deviceApi.getProjectTrebleSupportWinPlayForProp(),
		);
		if (getProjectTrebleSupportWinPlayRes && getProjectTrebleSupportWinPlayRes === 'true') {
			isSupportProjectTreble.value = true;
		} else {
			isSupportProjectTreble.value = false;
		}
		isInit.value = true;
		loading.value = false;
	};

	onMounted(() => {
		setTimeout(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		}, 0);
	});

	return {
		XiaomiWinPlayIsInstalled,
		isSupportProjectTreble,
		ProjectTrebleCurrentVerison,
		isInit,
		loading,
	};
}
