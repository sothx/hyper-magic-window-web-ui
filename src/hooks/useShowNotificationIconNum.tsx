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
export function useShowNotificationIcon() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const currentNum = ref<number>(3);

	const changeEnableMode = async (value: boolean) => {
		if (value) {
			const [removeIsEnableShowNotificationIconNumErr] = await $to<string,string>(deviceApi.removeIsEnableShowNotificationIconNum());
			if (removeIsEnableShowNotificationIconNumErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			const [addIsEnableShowNotificationIconNumErr] = await $to<string,string>(deviceApi.addIsEnableShowNotificationIconNum());
			if (addIsEnableShowNotificationIconNumErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			deviceStore.isEnableShowNotificationIconNum = true;

		} else {
			const [removeIsEnableShowNotificationIconNumErr] = await $to<string,string>(deviceApi.removeIsEnableShowNotificationIconNum());
			if (removeIsEnableShowNotificationIconNumErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			deviceStore.isEnableShowNotificationIconNum = false;
		}
	}

	const changeNum = async (num: number) => {
		const [removeShowNotificationIconNumErr] = await $to<string,string>(deviceApi.removeShowNotificationIconNum());
		if (removeShowNotificationIconNumErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
			return;
		}

		const [addShowNotificationIconNumErr] = await $to<string,string>(deviceApi.addShowNotificationIconNum(num));

		if (addShowNotificationIconNumErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		}

		const [putCurrentStatusBarShowNotificationIconErr] = await $to<string,string>(deviceApi.putCurrentStatusBarShowNotificationIcon(num));

		if (putCurrentStatusBarShowNotificationIconErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		}
	}

	onMounted(async () => {
        if (deviceStore.isEnableShowNotificationIconNum) {
			const [, getIsEnableShowNotificationIconNumResolve] = await $to<string, string>(deviceApi.getIsEnableShowNotificationIconNum());
			if (getIsEnableShowNotificationIconNumResolve && !Number.isNaN(Number(getIsEnableShowNotificationIconNumResolve))) {
				const numRes = Number(getIsEnableShowNotificationIconNumResolve)
				currentNum.value = numRes
			}
		}
	});

	return {
		currentNum,
		changeNum,
		changeEnableMode
	};
}
