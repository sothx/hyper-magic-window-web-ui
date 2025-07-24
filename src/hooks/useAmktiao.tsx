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
import { spawn } from '@/utils/kernelsu';
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

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

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

	const enableSetting = async () => {
		modal.create({
			title: '想启用该功能吗？',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<div>
					<p>
						该功能仅兼容{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							水龙(Amktiao)
						</span>{' '}
						的移植包，不兼容其他移植包作者，请确保当前使用的是水龙的移植包再启用该功能，确定要继续吗？
					</p>
				</div>
			),
			positiveText: '确认启用',
			negativeText: '我再想想',
			onPositiveClick: () => {
				deviceStore.showThirdPartySetting.amktiaoROMInterface = true;
			},
		});
	};

	const changeKeyboardMode = async (mode: KeyboardMode) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				if (mode === 1 || mode === 2) {
					modal.create({
						title: `想切换为${mode === 1 ? '键盘连接' : ''}${mode === 2 ? '键盘复位' : ''}状态吗？`,
						type: 'info',
						preset: 'dialog',
						content: () => (
							<div>
								<p>
									切换为
									{mode === 1 && (
										<span>
											{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												键盘连接
											</span>{' '}
										</span>
									)}
									{mode === 2 && (
										<span>
											{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												键盘复位
											</span>{' '}
										</span>
									)}
									状态前，请确保设备先连接上键盘，否则会存在静电击穿 CPU 的风险，确定要继续吗？
								</p>
							</div>
						),
						positiveText: `确定切换为${mode === 1 ? '键盘连接' : ''}${mode === 2 ? '键盘复位' : ''}状态`,
						negativeText: '我再想想',
						onPositiveClick: () => {
							resolve('positiveClick');
						},
						onNegativeClick: () => {
							reject('negativeClick');
						},
					});
				} else {
					resolve('positiveClick');
				}
			}),
		);
		if (positiveRes) {
			deviceApi
				.putCurrentKeyboardMode(mode)
				.then(res => {
					currentKeyboardMode.value = mode;
					currentKeyboardModeSelect.value = keyboardModeOptions.value[mode];
				})
				.catch(err => {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				});
		}
	};

	const changePenUpdateMode = async (value: boolean) => {
		const [putCurrentPenUpdateErr, putCurrentPenUpdateRes] = await $to(
			deviceApi.putCurrentPenUpdate(value ? 1 : 0),
		);
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
				const [addIsAmktiaoPenUpdateErr, addIsAmktiaoPenUpdateRes] = await $to(
					deviceApi.addIsAmktiaoPenUpdate(),
				);
				if (addIsAmktiaoPenUpdateErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
					modal.create({
						title: '切换成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>切换手写笔驱动成功，关闭屏幕再点亮屏幕即可更新固件~</p>,
						positiveText: '立即关闭并重新点亮屏幕',
						negativeText: '稍后再说',
						async onPositiveClick() {
							const [getScreenStateErr, getScreenStateRes] = await $to(deviceApi.getScreenState());
							if (getScreenStateErr) {
								modal.create({
									title: '获取屏幕信息失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>获取屏幕信息失败，请手动关闭屏幕再点亮屏幕即可更新固件，详细请查看日志~</p>
									),
									negativeText: '确定',
								});
								return;
							}
							if (getScreenStateRes === 'Awake') {
								const [rebootScreenErr] = await $to(deviceApi.rebootScreen());
								if (rebootScreenErr) {
									modal.create({
										title: '操作失败',
										type: 'error',
										preset: 'dialog',
										content: () => (
											<p>操作失败，请手动关闭屏幕再点亮屏幕即可更新固件，详细请查看日志~</p>
										),
										negativeText: '确定',
									});
									return;
								}
								modal.create({
									title: '切换成功',
									type: 'success',
									preset: 'dialog',
									content: () => (
										<p>已经为您关闭屏幕并重新点亮屏幕，请查看手写笔固件是否已成功切换~</p>
									),
									positiveText: '确定',
								});
							} else {
								modal.create({
									title: '操作失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>检测到您目前的屏幕状态并非亮屏状态，请手动关闭屏幕再点亮屏幕即可更新固件，详细请查看日志~</p>
									),
									negativeText: '确定',
								});
							}
						},
					});
					currentPenUpdate.value = 1;
				}
			} else {
				const [removeIsAmktiaoPenUpdateErr, removeIsAmktiaoPenUpdateRes] = await $to(
					deviceApi.removeIsAmktiaoPenUpdate(),
				);
				if (removeIsAmktiaoPenUpdateErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
					modal.create({
						title: '切换成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>切换手写笔驱动成功，关闭屏幕再点亮屏幕即可更新固件~</p>,
						positiveText: '立即关闭并重新点亮屏幕',
						negativeText: '稍后再说',
						async onPositiveClick() {
							const [getScreenStateErr, getScreenStateRes] = await $to(deviceApi.getScreenState());
							if (getScreenStateErr) {
								modal.create({
									title: '获取屏幕信息失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>获取屏幕信息失败，请手动关闭屏幕再点亮屏幕即可更新固件，详细请查看日志~</p>
									),
									negativeText: '确定',
								});
								return;
							}
							if (getScreenStateRes === 'Awake') {
								const [rebootScreenErr] = await $to(deviceApi.rebootScreen());
								if (rebootScreenErr) {
									modal.create({
										title: '操作失败',
										type: 'error',
										preset: 'dialog',
										content: () => (
											<p>操作失败，请手动关闭屏幕再点亮屏幕即可更新固件，详细请查看日志~</p>
										),
										negativeText: '确定',
									});
									return;
								}
								modal.create({
									title: '切换成功',
									type: 'success',
									preset: 'dialog',
									content: () => (
										<p>已经为您关闭屏幕并重新点亮屏幕，请查看手写笔固件是否已成功切换~</p>
									),
									positiveText: '确定',
								});
							} else {
								modal.create({
									title: '操作失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>检测到您目前的屏幕状态并非亮屏状态，请手动关闭屏幕再点亮屏幕即可更新固件，详细请查看日志~</p>
									),
									negativeText: '确定',
								});
							}
						},
					});
					currentPenUpdate.value = 0;
				}
			}
		}
	};

	const changePenEnableMode = async (value: boolean) => {
		const [putCurrentPenEnableErr, putCurrentPenEnableRes] = await $to(
			deviceApi.putCurrentPenEnable(value ? 1 : 0),
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
			if (value) {
				const [addIsAmktiaoPenEnableErr, addIsAmktiaoPenEnableRes] = await $to(
					deviceApi.addIsAmktiaoPenEnable(),
				);
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
				const [removeIsAmktiaoPenEnableErr, removeIsAmktiaoPenEnableRes] = await $to(
					deviceApi.removeIsAmktiaoPenEnable(),
				);
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
	};

	const fetchData = async () => {
		const [, getHasPenUpdateControlRes] = await $to<string, string>(deviceApi.getHasPenUpdateControl());
		if (getHasPenUpdateControlRes) {
			hasPenUpdateControl.value = true;
		}
		const [, getHasPenEnableControlRes] = await $to<string, string>(deviceApi.getHasPenEnableControl());
		if (getHasPenEnableControlRes) {
			hasPenEnableControl.value = true;
		}
		const [, getHasKeyboardControlRes] = await $to<string, string>(deviceApi.getHasKeyboardControl());
		if (getHasKeyboardControlRes) {
			hasKeyboardControl.value = true;
		}
		// 移植包键盘和手写笔控制
		if (hasPenUpdateControl.value) {
			const [, getCurrentPenUpdateResolve] = await $to<string, string>(deviceApi.getCurrentPenUpdate());

			if (Number(getCurrentPenUpdateResolve)) {
				currentPenUpdate.value = 1;
			}
		}
		if (hasPenEnableControl.value) {
			const [, getCurrentPenEnableResolve] = await $to<string, string>(deviceApi.getCurrentPenEnable());

			if (Number(getCurrentPenEnableResolve)) {
				currentPenEnable.value = 1;
			}
		}
		if (hasKeyboardControl.value) {
			const [, getCurrentKeyboardModeResolve] = await $to<string, string>(deviceApi.getCurrentKeyboardMode());

			if (getCurrentKeyboardModeResolve) {
				const mode: KeyboardMode = Number(getCurrentKeyboardModeResolve) as KeyboardMode;
				currentKeyboardMode.value = mode;
				currentKeyboardModeSelect.value = keyboardModeOptions.value[mode];
			}
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
		changePenEnableMode,
		enableSetting,
		isInit,
		loading,
	};
}
