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

    const changePenUpdateMode = async (value: boolean) => {
		const [putCurrentPenUpdateErr, putCurrentPenUpdateRes] = await $to(deviceApi.putCurrentPenUpdate(value ? 1 : 0))
		if (putCurrentPenUpdateErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		} else {
			if (value) {
				const [addIsAmktiaoPenUpdateErr,addIsAmktiaoPenUpdateRes] = await $to(deviceApi.addIsAmktiaoPenUpdate())
				if (addIsAmktiaoPenUpdateErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
					currentPenUpdate.value = 1;
				}
			} else {
				const [removeIsAmktiaoPenUpdateErr,removeIsAmktiaoPenUpdateRes] = await $to(deviceApi.removeIsAmktiaoPenUpdate())
				if (removeIsAmktiaoPenUpdateErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
					currentPenUpdate.value = 0;
				}
			}
		}
    }

    const changePenEnableMode = async (value: boolean) => {
		const [putCurrentPenEnableErr, putCurrentPenEnableRes] = await $to(deviceApi.putCurrentPenEnable(value ? 1 : 0))
		if (putCurrentPenEnableErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		} else {
			if (value) {
				const [addIsAmktiaoPenEnableErr,addIsAmktiaoPenEnableRes] = await $to(deviceApi.addIsAmktiaoPenEnable())
				if (addIsAmktiaoPenEnableErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
					currentPenEnable.value = 1;
				}
			} else {
				const [removeIsAmktiaoPenEnableErr,removeIsAmktiaoPenEnableRes] = await $to(deviceApi.removeIsAmktiaoPenEnable())
				if (removeIsAmktiaoPenEnableErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
					currentPenEnable.value = 0;
				}
			}
		}
    }

	onMounted(async () => {
			// 移植包键盘和手写笔控制
			if (deviceStore.hasPenUpdateControl) {
				const [, getCurrentPenUpdateResolve] = await $to<string, string>(
					deviceApi.getCurrentPenUpdate(),
				);

				if (Number(getCurrentPenUpdateResolve)) {
					currentPenUpdate.value = 1;
				}
			}
			if (deviceStore.hasPenEnableControl) {
				const [, getCurrentPenEnableResolve] = await $to<string, string>(
					deviceApi.getCurrentPenEnable(),
				);

				if (Number(getCurrentPenEnableResolve)) {
					currentPenEnable.value = 1;
				}
			}
			if (deviceStore.hasKeyboardControl) {
				const [, getCurrentKeyboardModeResolve] = await $to<string, string>(
					deviceApi.getCurrentKeyboardMode(),
				);

				if (getCurrentKeyboardModeResolve) {
					const mode:KeyboardMode = Number(getCurrentKeyboardModeResolve) as KeyboardMode
					currentKeyboardMode.value = mode;
					currentKeyboardModeSelect.value = keyboardModeOptions.value[mode]
				}
			}
	});

	return {
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
