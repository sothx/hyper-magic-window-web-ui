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

export type KeyboardMode = 0 | 1 | 2;
export function useMiuiDesktopMode() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});
	
	const isInit = ref<boolean>(false);

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

	const changeMiuiDesktopModeEnabled = async () => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: '想激活工作台模式吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							<p>
								激活{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									工作台模式
								</span>{' '}
								后需要设备重启才会生效~
							</p>
							<p>是否立即重启？</p>
						</div>
					),
					positiveText: '确认并立即重启',
					negativeText: '取消',
					onPositiveClick: () => {
						resolve('positiveClick');
					},
					onNegativeClick: () => {
						reject('negativeClick');
					},
				});
			}),
		);
		if (positiveRes) {
			const [removeIsAddDesktopModeEnabledErr, removeIsAddDesktopModeEnabledRes] = await $to(
				deviceApi.removeIsAddDesktopModeEnabled(),
			);
			if (removeIsAddDesktopModeEnabledErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			const [addIsAddDesktopModeEnabledErr, addIsAddDesktopModeEnabledRes] = await $to(
				deviceApi.addIsAddDesktopModeEnabled(),
			);
			if (addIsAddDesktopModeEnabledErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			const [removeMiuiDesktopModeEnabledErr, removeMiuiDesktopModeEnabledRes] = await $to(
				deviceApi.removeMiuiDesktopModeEnabled(),
			);
			if (removeMiuiDesktopModeEnabledErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			const [addMiuiDesktopModeEnabledErr, addMiuiDesktopModeEnabledRes] = await $to(
				deviceApi.addMiuiDesktopModeEnabled(),
			);
			if (addMiuiDesktopModeEnabledErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			const [rebootDeviceErr] = await $to(deviceApi.rebootDevice());
			if (rebootDeviceErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法重启设备，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
		}
	};

	const fetchData = async () => {
		if (deviceStore.enabledMiuiDesktopMode) {
			const [, getCurrentMiuiDktModeResolve] = await $to<string, string>(deviceApi.getCurrentMiuiDktMode());

			if (Number(getCurrentMiuiDktModeResolve) === 1) {
				currentMiuiDktMode.value = true;
			}
		}
		isInit.value = true;
	}

	onMounted(() => {
		setTimeout(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		},0);
	});

	return {
		currentMiuiDktMode,
		changeMiuiDktMode,
		changeMiuiDesktopModeEnabled,
		isInit
	};
}
