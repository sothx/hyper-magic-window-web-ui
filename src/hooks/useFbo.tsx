import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import $to from 'await-to-js';
import { divide } from 'lodash-es';
import { spawn } from '@/utils/kernelsu';

export function useFbo() {
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const deviceStore = useDeviceStore();
	const isSupportGameMode = computed(() => {
		return deviceStore.miuiCompatEnable && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk > 31;
	});

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const fboEnable = ref<boolean>(false);

	const fboServiceCtrl = ref<boolean>(false);

	const fboInstalld = ref<string>('');

	const isAutoStartFbo = ref<boolean>(false);

	const isAutoRegularlyFbo = ref<boolean>(false);

	const handleEnableFbo = async () => {
		if (fboEnable.value) {
			modal.create({
				title: '启用状态说明',
				type: 'success',
				preset: 'dialog',
				content: () => <p>当前焕新存储已经是启用状态~</p>,
				negativeText: '确定',
			});
			return;
		}
		const [setFboEnableErr, setFboEnableRes] = await $to(deviceApi.setFboEnable());
		if (setFboEnableRes) {
			const [setFboEnableErr, setFboEnableRes] = await $to(deviceApi.setFboEnable());
			if (setFboEnableErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
			} else {
				fboEnable.value = true;
				reload();
			}
		}
	};

	const handleEnableFboServiceCtrl = async () => {
		if (fboServiceCtrl.value) {
			modal.create({
				title: '激活状态说明',
				type: 'success',
				preset: 'dialog',
				content: () => <p>当前焕新存储已经是激活状态~</p>,
				negativeText: '确定',
			});
			return;
		}
		const [setFboServiceCtrlErr, setFboServiceCtrlRes] = await $to(deviceApi.setFboServiceCtrl());
		if (setFboServiceCtrlErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		} else {
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => <p>已激活焕新存储，激活后仍然需要满足条件才会在特定时间触发焕新存储~</p>,
				positiveText: '确定',
			});
			fboServiceCtrl.value = true;
			const [fboInstalldErr, fboInstalldRes] = await $to(deviceApi.getFboInstalld());
			if (fboInstalldRes) {
				fboInstalld.value = fboInstalldRes;
			} else {
				fboInstalld.value = '';
			}
		}
	};

	const changeIsAutoRegularlyFbo = async (status: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: status ? '想启用每日闲时维护吗？' : '想关闭每日闲时维护吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{status && (
								<p>
									启用焕新存储{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										每日闲时维护
									</span>{' '}
									后，每天夜间12点20分会自动激活焕新存储的运行状态，激活后仍然需要满足条件才会在特定时间触发焕新存储~
								</p>
							)}
                            {!status && (
								<p>
									关闭焕新存储{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										每日闲时维护
									</span>{' '}
									后将跟随系统默认规则触发，不再每天夜间自动激活焕新存储的运行状态~
								</p>
							)}
							<p>
								{status ? '启用' : '关闭'}焕新存储{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									每日闲时维护
								</span>{' '}
								后需要设备重启才会生效，是否立即重启？
							</p>
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
			if (status) {
				const [removeIsAutoRegularlyFboErr, removeIsAutoRegularlyFboRes] = await $to(
					deviceApi.removeIsAutoRegularlyFbo(),
				);
				if (removeIsAutoRegularlyFboErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				} else {
					const [addIsAutoRegularlyFboErr, addIsAutoRegularlyFboRes] = await $to(
						deviceApi.addIsAutoRegularlyFbo(),
					);
					if (addIsAutoRegularlyFboErr) {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>修改失败，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
					} else {
						const [setFboEnableErr, setFboEnableRes] = await $to(deviceApi.setFboEnable());
						if (setFboEnableErr) {
							modal.create({
								title: '操作失败',
								type: 'error',
								preset: 'dialog',
								content: () => <p>修改失败，详情请查看日志记录~</p>,
								negativeText: '确定',
							});
						} else {
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
							isAutoRegularlyFbo.value = true;
							modal.create({
								title: '操作成功',
								type: 'success',
								preset: 'dialog',
								content: () => <p>已启用焕新存储的每日闲时维护~</p>,
								positiveText: '确定',
							});
						}
					}
				}
			} else {
				const [removeIsAutoRegularlyFboErr, removeIsAutoRegularlyFboRes] = await $to(
					deviceApi.removeIsAutoRegularlyFbo(),
				);
				if (removeIsAutoRegularlyFboErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
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
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>已关闭焕新存储的每日闲时维护~</p>,
						positiveText: '确定',
					});
					isAutoRegularlyFbo.value = false;
				}
			}
		}
	};

	const changeIsAutoEnableFbo = async (status: boolean) => {
		if (status) {
			const [removeIsAutoEnableFboErr, removeIsAutoEnableFboRes] = await $to(deviceApi.removeIsAutoEnableFbo());
			if (removeIsAutoEnableFboErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			} else {
				const [addIsAutoEnableFboErr, addIsAutoEnableFboRes] = await $to(deviceApi.addIsAutoEnableFbo());
				if (addIsAutoEnableFboErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
				} else {
					const [setFboEnableErr, setFboEnableRes] = await $to(deviceApi.setFboEnable());
					if (setFboEnableErr) {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>修改失败，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
					} else {
						modal.create({
							title: '操作成功',
							type: 'success',
							preset: 'dialog',
							content: () => (
								<p>
									已强制启用焕新存储，但该功能受系统底层支持情况而异，不支持的设备即使启用也不会生效~
								</p>
							),
							positiveText: '确定',
						});
						isAutoStartFbo.value = true;
					}
				}
			}
		} else {
			const [removeIsAutoEnableFboErr, removeIsAutoEnableFboRes] = await $to(deviceApi.removeIsAutoEnableFbo());
			if (removeIsAutoEnableFboErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>修改失败，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
			} else {
				modal.create({
					title: '操作成功',
					type: 'success',
					preset: 'dialog',
					content: () => <p>已将焕新存储启用状态恢复为系统默认行为~</p>,
					positiveText: '确定',
				});
				isAutoStartFbo.value = false;
			}
		}
	};

	const reload = async () => {
		const [, getIsAutoEnableFboRes] = await $to<string, string>(deviceApi.getIsAutoEnableFbo());
		if (getIsAutoEnableFboRes === 'true') {
			isAutoStartFbo.value = true;
		} else {
			isAutoStartFbo.value = false;
		}
		const [, getIsAutoRegularlyFboRes] = await $to<string, string>(deviceApi.getIsAutoRegularlyFbo());
		if (getIsAutoRegularlyFboRes === 'true') {
			isAutoRegularlyFbo.value = true;
		} else {
			isAutoRegularlyFbo.value = false;
		}
		const [fboEnableErr, fboEnableRes] = await $to(deviceApi.getFboEnable());
		if (fboEnableRes === 'true') {
			fboEnable.value = true;
		} else {
			fboEnable.value = false;
		}

		const [fFboServiceCtrlErr, fboServiceCtrlRes] = await $to(deviceApi.getFboServiceCtrl());
		if (fboServiceCtrlRes === 'true') {
			fboServiceCtrl.value = true;
		} else {
			fboServiceCtrl.value = false;
		}

		const [fboInstalldErr, fboInstalldRes] = await $to(deviceApi.getFboInstalld());
		if (fboInstalldRes) {
			fboInstalld.value = fboInstalldRes;
		} else {
			fboInstalld.value = '';
		}
	};

	onMounted(() => {
		reload();
	});

	return {
		fboEnable,
		fboServiceCtrl,
		changeIsAutoEnableFbo,
		changeIsAutoRegularlyFbo,
		isAutoStartFbo,
		isAutoRegularlyFbo,
		fboInstalld,
		handleEnableFbo,
		handleEnableFboServiceCtrl,
		reload,
	};
}
