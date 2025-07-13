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

	const isEditFreeformMaxNum = ref<boolean>(false);

	const currentFreeformMaxNum = ref<number>(4);

	const currentMiuiDktMode = ref<boolean>(false);

	const isSupportFreeformMaxNum = ref<boolean>(false);

	const changeMiuiDktMode = async (value: boolean) => {
		const [putCurrentPenEnableErr, putCurrentPenEnableRes] = await $to(
			deviceApi.putCurrentMiuiDktMode(value ? 1 : 'null'),
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
	};

	const changeFreeformMaxNum = async (value: number) => {
		const [setMiuiDesktopModeFreeformMaxNumErr, setMiuiDesktopModeFreeformMaxNumRes] = await $to(
			deviceApi.setMiuiDesktopModeFreeformMaxNum(value),
		);
		if (setMiuiDesktopModeFreeformMaxNumErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		} else {
			currentFreeformMaxNum.value = value;
			isEditFreeformMaxNum.value = false;
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<p>
						好耶w，已经成功修改工作台模式下的最大前台应用数量~实际生效还需要重启系统界面作用域，确定要继续吗？
					</p>
				),
				positiveText: '立即重启作用域',
				negativeText: '稍后手动重启',
				onPositiveClick() {
					deviceApi
						.killAndroidSystemUI()
						.then(() => {
							modal.create({
								title: '重启系统界面成功',
								type: 'success',
								preset: 'dialog',
								content: () => <p>已经成功为你重启系统界面的作用域，请查看是否生效~</p>,
							});
						})
						.catch(err => {
							modal.create({
								title: '重启系统界面失败',
								type: 'error',
								preset: 'dialog',
								content: () => <p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>,
								negativeText: '确定',
							});
							return;
						});
				},
			});
		}
	};

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
							<p>是否继续激活？</p>
						</div>
					),
					positiveText: '确认',
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
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => <p>好耶w，已经成功激活工作台模式~实际生效还需要重启设备，确定要重启吗？</p>,
				positiveText: '立即重启',
				negativeText: '稍后手动重启',
				onPositiveClick() {
					deviceApi.rebootDevice().catch(err => {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>无法重启设备，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
						return;
					});
				},
			});
		}
	};

	const fetchData = async () => {
		if (deviceStore.enabledMiuiDesktopMode) {
			const [, getCurrentMiuiDktModeResolve] = await $to<string, string>(deviceApi.getCurrentMiuiDktMode());

			if (Number(getCurrentMiuiDktModeResolve) === 1) {
				currentMiuiDktMode.value = true;
			}
		}
		const [, getProjectTrebleSupportDesktopModeFreeformMaxNumResolve] = await $to<string>(
			deviceApi.getProjectTrebleSupportDesktopModeFreeformMaxNum(),
		);
		if (getProjectTrebleSupportDesktopModeFreeformMaxNumResolve === 'true') {
			isSupportFreeformMaxNum.value = true;
		}

		if (isSupportFreeformMaxNum.value) {
			const [, getMiuiDesktopModeFreeformMaxNumRes] = await $to<number>(deviceApi.getMiuiDesktopModeFreeformMaxNum());
			if (Number(getMiuiDesktopModeFreeformMaxNumRes) && Number(getMiuiDesktopModeFreeformMaxNumRes) >= 4) {
				currentFreeformMaxNum.value = Number(getMiuiDesktopModeFreeformMaxNumRes);
			} else {
				currentFreeformMaxNum.value = 4;
			}
		}

		isInit.value = true;
	};

	onMounted(() => {
		setTimeout(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		}, 0);
	});

	return {
		currentMiuiDktMode,
		changeMiuiDktMode,
		isEditFreeformMaxNum,
		changeFreeformMaxNum,
		currentFreeformMaxNum,
		isSupportFreeformMaxNum,
		changeMiuiDesktopModeEnabled,
		isInit,
	};
}
