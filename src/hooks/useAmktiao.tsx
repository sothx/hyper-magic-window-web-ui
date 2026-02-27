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

export type PenUpdateAutoTask = 0 | 1;

export type TpFirmware = 0 | 1;

export type GameMode = 0 | 1;

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
	const hasTpFirmwareControl = ref<boolean>(false);
	const hasGameModeControl = ref<boolean>(false);

	const currentPenUpdate = ref<PenUpdate>(0);

	const currentPenEnable = ref<PenEnable>(0);

	const currentKeyboardMode = ref<KeyboardMode>(0);

	const currentPenUpdateAutoTask = ref<boolean>(false);

	const currentTpFirmware = ref<TpFirmware>(0);

	const currentTpFirmwareAutoTask = ref<boolean>(false);

	const currentGameMode = ref<TpFirmware>(0);

	const currentGameModeAutoTask = ref<boolean>(false);

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
						positiveText: '确定',
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
				positiveText: '确定',
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
						positiveText: '确定',
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
									positiveText: '确定',
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
										positiveText: '确定',
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
									positiveText: '确定',
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
						positiveText: '确定',
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
									positiveText: '确定',
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
										positiveText: '确定',
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
									positiveText: '确定',
								});
							}
						},
					});
					currentPenUpdate.value = 0;
				}
			}
		}
	};

	const changeTpFirewareMode = async (value: boolean) => {
		const [putCurrentTpFirmwareErr, putCurrentTpFirmwareRes] = await $to(
			deviceApi.putCurrentTpFirmware(value ? 1 : 0),
		);
		if (putCurrentTpFirmwareErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				positiveText: '确定',
			});
		} else {
			if (value) {
				const [addIsAmktiaoTpFirmwareErr, addIsAmktiaoTpFirmwareRes] = await $to(
					deviceApi.addIsAmktiaoTpFirmware(),
				);
				if (addIsAmktiaoTpFirmwareErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '切换成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>切换触控驱动成功，关闭屏幕再点亮屏幕即可更新触控驱动~</p>,
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
										<p>获取屏幕信息失败，请手动关闭屏幕再点亮屏幕即可更新触控驱动，详细请查看日志~</p>
									),
									positiveText: '确定',
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
											<p>操作失败，请手动关闭屏幕再点亮屏幕即可更新触控驱动，详细请查看日志~</p>
										),
										positiveText: '确定',
									});
									return;
								}
								modal.create({
									title: '切换成功',
									type: 'success',
									preset: 'dialog',
									content: () => (
										<p>已经为您关闭屏幕并重新点亮屏幕，请查看触控驱动是否已成功切换~</p>
									),
									positiveText: '确定',
								});
							} else {
								modal.create({
									title: '操作失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>检测到您目前的屏幕状态并非亮屏状态，请手动关闭屏幕再点亮屏幕即可更新触控驱动，详细请查看日志~</p>
									),
									positiveText: '确定',
								});
							}
						},
					});
					currentTpFirmware.value = 1;
				}
			} else {
				const [removeIsAmktiaoTpFirmwareErr, removeIsAmktiaoTpFirmwareRes] = await $to(
					deviceApi.removeIsAmktiaoTpFirmware(),
				);
				if (removeIsAmktiaoTpFirmwareErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '切换成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>切换触控驱动成功，关闭屏幕再点亮屏幕即可更新触控驱动~</p>,
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
										<p>获取屏幕信息失败，请手动关闭屏幕再点亮屏幕即可更新触控驱动，详细请查看日志~</p>
									),
									positiveText: '确定',
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
											<p>操作失败，请手动关闭屏幕再点亮屏幕即可更新触控驱动，详细请查看日志~</p>
										),
										positiveText: '确定',
									});
									return;
								}
								modal.create({
									title: '切换成功',
									type: 'success',
									preset: 'dialog',
									content: () => (
										<p>已经为您关闭屏幕并重新点亮屏幕，请查看触控驱动是否已成功切换~</p>
									),
									positiveText: '确定',
								});
							} else {
								modal.create({
									title: '操作失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>检测到您目前的屏幕状态并非亮屏状态，请手动关闭屏幕再点亮屏幕即可更新触控驱动，详细请查看日志~</p>
									),
									positiveText: '确定',
								});
							}
						},
					});
					currentTpFirmware.value = 0;
				}
			}
		}
	};

	const changeGameMode = async (value: boolean) => {
		const [putCurrentGameModeErr, putCurrentGameModeRes] = await $to(
			deviceApi.putCurrentGameMode(value ? 1 : 0),
		);
		if (putCurrentGameModeErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				positiveText: '确定',
			});
		} else {
			if (value) {
				const [addIsAmktiaoGameModeErr, addIsAmktiaoGameModeRes] = await $to(
					deviceApi.addIsAmktiaoGameMode(),
				);
				if (addIsAmktiaoGameModeErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '切换成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>切换游戏模式成功，关闭屏幕再点亮屏幕即可切换游戏模式~</p>,
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
										<p>获取屏幕信息失败，请手动关闭屏幕再点亮屏幕即可切换游戏模式，详细请查看日志~</p>
									),
									positiveText: '确定',
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
											<p>操作失败，请手动关闭屏幕再点亮屏幕即可切换游戏模式，详细请查看日志~</p>
										),
										positiveText: '确定',
									});
									return;
								}
								modal.create({
									title: '切换成功',
									type: 'success',
									preset: 'dialog',
									content: () => (
										<p>已经为您关闭屏幕并重新点亮屏幕，请查看游戏模式是否已成功切换~</p>
									),
									positiveText: '确定',
								});
							} else {
								modal.create({
									title: '操作失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>检测到您目前的屏幕状态并非亮屏状态，请手动关闭屏幕再点亮屏幕即可更新游戏模式，详细请查看日志~</p>
									),
									positiveText: '确定',
								});
							}
						},
					});
					currentGameMode.value = 1;
				}
			} else {
				const [removeIsAmktiaoGameModeErr, removeIsAmktiaoGameModeRes] = await $to(
					deviceApi.removeIsAmktiaoGameMode(),
				);
				if (removeIsAmktiaoGameModeErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '切换成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>切换游戏模式成功，关闭屏幕再点亮屏幕即可更新游戏模式~</p>,
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
										<p>获取屏幕信息失败，请手动关闭屏幕再点亮屏幕即可更新游戏模式，详细请查看日志~</p>
									),
									positiveText: '确定',
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
											<p>操作失败，请手动关闭屏幕再点亮屏幕即可更新游戏模式，详细请查看日志~</p>
										),
										positiveText: '确定',
									});
									return;
								}
								modal.create({
									title: '切换成功',
									type: 'success',
									preset: 'dialog',
									content: () => (
										<p>已经为您关闭屏幕并重新点亮屏幕，请查看游戏模式是否已成功切换~</p>
									),
									positiveText: '确定',
								});
							} else {
								modal.create({
									title: '操作失败',
									type: 'error',
									preset: 'dialog',
									content: () => (
										<p>检测到您目前的屏幕状态并非亮屏状态，请手动关闭屏幕再点亮屏幕即可更新游戏模式，详细请查看日志~</p>
									),
									positiveText: '确定',
								});
							}
						},
					});
					currentTpFirmware.value = 0;
				}
			}
		}
	};

	const changePenUpdateAutoTaskMode = async (value: boolean) => {
			if (value) {
				const [addIsAmktiaoPenUpdateAutoTaskErr, addIsAmktiaoPenUpdateAutoTaskRes] = await $to(
					deviceApi.addIsAmktiaoPenUpdateAutoTask(),
				);
				if (addIsAmktiaoPenUpdateAutoTaskErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>您已启用「手写笔驱动开机自优化」，开启后每次开机首次解锁屏幕后，模块会尝试重新关闭屏幕再点亮一次，以便「二代笔驱动」立即生效~</p>,
						positiveText: '确定',
					});
					currentPenUpdateAutoTask.value = value;
				}
			} else {
				const [removeIsAmktiaoPenUpdateAutoTaskErr, removeIsAmktiaoPenUpdateAutoTaskRes] = await $to(
					deviceApi.removeIsAmktiaoPenUpdateAutoTask(),
				);
				if (removeIsAmktiaoPenUpdateAutoTaskErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>您已关闭「手写笔驱动开机自优化」，每次开机后，您需要手动关闭并重新点亮屏幕，才能使「二代笔驱动」立即生效~</p>,
						positiveText: '确定',
					});
					currentPenUpdateAutoTask.value = value;
				}
			}
	}

	const changeTpFirewareModeAutoTask = async (value: boolean) => {
			if (value) {
				const [addIsAmktiaoTpFirmwareAutoTaskErr, addIsAmktiaoTpFirmwareAutoTaskRes] = await $to(
					deviceApi.addIsAmktiaoTpFirmwareAutoTask(),
				);
				if (addIsAmktiaoTpFirmwareAutoTaskErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>您已启用「老版触控驱动开机自优化」，开启后每次开机首次解锁屏幕后，模块会尝试重新关闭屏幕再点亮一次，以便「老版触控驱动」立即生效~</p>,
						positiveText: '确定',
					});
					currentTpFirmwareAutoTask.value = value;
				}
			} else {
				const [removeIsAmktiaoTpFirmwareAutoTaskErr, removeIsAmktiaoTpFirmwareAutoTaskRes] = await $to(
					deviceApi.removeIsAmktiaoTpFirmwareAutoTask(),
				);
				if (removeIsAmktiaoTpFirmwareAutoTaskErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>您已关闭「老版触控驱动开机自优化」，每次开机后，您需要手动关闭并重新点亮屏幕，才能使「老版触控驱动」立即生效~</p>,
						positiveText: '确定',
					});
					currentTpFirmwareAutoTask.value = value;
				}
			}
	}

	const changeGameModeAutoTask = async (value: boolean) => {
			if (value) {
				const [addIsAmktiaoGameModeAutoTaskErr, addIsAmktiaoGameModeAutoTaskRes] = await $to(
					deviceApi.addIsAmktiaoGameModeAutoTask(),
				);
				if (addIsAmktiaoGameModeAutoTaskErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>您已启用「游戏模式开机自优化」，开启后每次开机首次解锁屏幕后，模块会尝试重新关闭屏幕再点亮一次，以便「游戏模式」立即生效~</p>,
						positiveText: '确定',
					});
					currentGameModeAutoTask.value = value;
				}
			} else {
				const [removeIsAmktiaoGameModeAutoTaskErr, removeIsAmktiaoGameModeAutoTaskRes] = await $to(
					deviceApi.removeIsAmktiaoGameModeAutoTask(),
				);
				if (removeIsAmktiaoGameModeAutoTaskErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				} else {
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>您已关闭「游戏模式开机自优化」，每次开机后，您需要手动关闭并重新点亮屏幕，才能使「游戏模式」立即生效~</p>,
						positiveText: '确定',
					});
					currentGameModeAutoTask.value = value;
				}
			}
	}

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
				positiveText: '确定',
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
						positiveText: '确定',
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
						positiveText: '确定',
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
		const [, getHasTpFirmwareControlRes] = await $to<string, string>(deviceApi.getHasTpFirmwareControl());
		if (getHasTpFirmwareControlRes) {
			hasTpFirmwareControl.value = true;
		}
		const [,getHasGameModeControlRes] = await $to<string, string>(deviceApi.getHasGameModeControl());
		if (getHasGameModeControlRes) {
			hasGameModeControl.value = true;
		}
		// 移植包触控板固件控制
		if (hasTpFirmwareControl.value) {
			const [, getCurrentTpFirmwareResolve] = await $to<string, string>(deviceApi.getCurrentTpFirmware());

			if (Number(getCurrentTpFirmwareResolve)) {
				currentTpFirmware.value = 1;
			}

			const [, getIsAmktiaoTpFirmwareAutoTaskRes] = await $to<string, string>(deviceApi.getIsAmktiaoTpFirmwareAutoTask());
			if (getIsAmktiaoTpFirmwareAutoTaskRes && String(getIsAmktiaoTpFirmwareAutoTaskRes) === 'true') {
				currentTpFirmwareAutoTask.value = true;
			} else {
				currentTpFirmwareAutoTask.value = false;
			}
		}
		// 移植包手写笔控制
		if (hasPenUpdateControl.value) {
			const [, getCurrentPenUpdateResolve] = await $to<string, string>(deviceApi.getCurrentPenUpdate());

			if (Number(getCurrentPenUpdateResolve)) {
				currentPenUpdate.value = 1;
			}

			const [, getIsAmktiaoPenUpdateAutoTaskRes] = await $to<string, string>(deviceApi.getIsAmktiaoPenUpdateAutoTask());
			if (getIsAmktiaoPenUpdateAutoTaskRes && String(getIsAmktiaoPenUpdateAutoTaskRes) === 'true') {
				currentPenUpdateAutoTask.value = true;
			} else {
				currentPenUpdateAutoTask.value = false;
			}
		}
		if (hasPenEnableControl.value) {
			const [, getCurrentPenEnableResolve] = await $to<string, string>(deviceApi.getCurrentPenEnable());

			if (Number(getCurrentPenEnableResolve)) {
				currentPenEnable.value = 1;
			}
		}
		// 移植包键盘控制
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
		hasTpFirmwareControl,
		hasGameModeControl,
		currentGameMode,
		currentGameModeAutoTask,
		changeGameMode,
		changeGameModeAutoTask,
		currentPenUpdate,
		currentPenEnable,
		currentPenUpdateAutoTask,
		currentKeyboardMode,
		keyboardModeOptions,
		currentKeyboardModeSelect,
		changeKeyboardMode,
		changePenUpdateMode,
		changePenUpdateAutoTaskMode,
		changePenEnableMode,
		changeTpFirewareMode,
		changeTpFirewareModeAutoTask,
		currentTpFirmware,
		currentTpFirmwareAutoTask,
		enableSetting,
		isInit,
		loading,
	};
}
