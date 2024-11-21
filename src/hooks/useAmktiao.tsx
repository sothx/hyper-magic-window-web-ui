import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
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
export interface KeyboardModeOptions {
	label: string;
    type: string;
	key: 0 | 1 | 2;
}


export type PenUpdate = 0 | 1;

export type PenEnable = 0 | 1;

export type KeyboardMode = 0 | 1 | 2;
export function useAmktiao() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const hasPenUpdateControl = ref<boolean>(false);

	const hasPenEnableControl = ref<boolean>(false);

	const hasKeyboardControl = ref<boolean>(false);

	const currentPenUpdate = ref<PenUpdate>(0);

	const currentPenEnable = ref<PenEnable>(0);

	const currentKeyboardMode = ref<KeyboardMode>(0);

	const keyboardModeOptions = ref<KeyboardModeOptions[]>([
		{
			label: '关闭键盘',
            type: 'error',
			key: 0,
		},
		{
			label: '连接键盘',
            type: 'success',
			key: 1,
		},
		{
			label: '复位键盘',
            type: 'warning',
			key: 2,
		},
	]);

	const currentKeyboardModeSelect = ref<KeyboardModeOptions>({
		label: '关闭键盘',
        type: 'error',
		key: 0,
	});

	const changeKeyboardMode = (mode: KeyboardMode) => {
        deviceApi.putCurrentKeyboardMode(mode).then(((res) => {
			currentKeyboardMode.value = mode;
			currentKeyboardModeSelect.value = keyboardModeOptions.value[mode]
        })).catch((err) => {
            modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
        })
    };

    const changePenUpdateMode = (value: boolean) => {
        deviceApi.putCurrentPenUpdate(value ? 1 : 0).then(((res) => {
			currentPenUpdate.value = value ? 1 : 0;
        })).catch((err) => {
            modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
        })
    }

    const changePenEnableMode = (value: boolean) => {
        deviceApi.putCurrentPenEnable(value ? 1 : 0).then(((res) => {
			currentPenEnable.value = value ? 1 : 0;
        })).catch((err) => {
            modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
        })
    }

	onMounted(() => {});

	return {
		hasPenUpdateControl,
		hasPenEnableControl,
		hasKeyboardControl,
		currentPenUpdate,
		currentPenEnable,
		currentKeyboardMode,
		keyboardModeOptions,
		currentKeyboardModeSelect,
		changeKeyboardMode,
        changePenUpdateMode,
        changePenEnableMode
	};
}
