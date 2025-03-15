import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import $to from 'await-to-js';

export function useGameMode() {
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

	const vaildModuleVersion = async () => {
		return new Promise((resolve, reject) => {
			if (
				deviceStore.androidTargetSdk >= 35 &&
				deviceStore.MIOSVersion &&
				deviceStore.MIOSVersion >= 2 &&
				deviceStore.deviceCharacteristics === 'tablet'
			) {
				if (deviceStore.MIOSVersion === 2) {
					if (
						!['pad-ext-', 'pad-hyperos2-based-on-vanillaIceCream-'].some(
							item =>
								((deviceStore.moduleInfo && deviceStore.moduleInfo.version) || '').indexOf(item) === 0,
						)
					) {
						modal.create({
							title: '获取专版模块',
							type: 'info',
							preset: 'dialog',
							content: () => (
								<div>
									<p>
										需要安装{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											小米平板安卓15澎湃2.0专版(pad-hyperos2-based-on-vanillaIceCream)
										</span>{' '}
										才可以正常使用{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											游戏显示布局
										</span>{' '}
										，请先替换模块版本~
									</p>
									<p>下载地址:https://caiyun.139.com/m/i?135CeBMHACC6p</p>
								</div>
							),
							positiveText: '复制下载链接到剪切板',
							negativeText: '取消',
							onPositiveClick: () => {
								navigator.clipboard.writeText(`https://caiyun.139.com/m/i?135CeBMHACC6p`);
							},
							onNegativeClick: () => {},
						});
						reject('error');
					} else {
						resolve('success');
					}
				} else {
					modal.create({
						title: '未适配系统版本',
						type: 'error',
						preset: 'dialog',
						content: () => <p>该系统版本尚未适配游戏显示布局，请等待模块后续更新~</p>,
					});
					reject('error');
				}
			} else {
				resolve('success');
			}
		});
	};

	const changeGameMode = async (value: boolean) => {
		if (value) {
			const [vaildModuleVersionErr] = await $to(vaildModuleVersion());
			if (vaildModuleVersionErr) {
				return;
			}
		}
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: value ? '想开启游戏显示布局吗？' : '想关闭游戏显示布局吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							<p>
								{value ? '开启' : '关闭'}{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									游戏显示布局
								</span>{' '}
								后需要设备重启才会生效~
							</p>
							{value &&
								deviceStore.deviceCharacteristics === 'tablet' &&
								deviceStore.MIOSVersion &&
								deviceStore.MIOSVersion >= 2 &&
								deviceStore.androidTargetSdk >= 35 && (
									<p>
										从Hyper OS 2.0开始，小米平板需要搭配配套的{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											修改版平板/手机管家
										</span>{' '}
										才能使用游戏显示布局，详情请前往模块首页了解~
									</p>
								)}
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
			const [deleteGameModeErr] = await $to(deviceApi.deleteGameMode());
			if (deleteGameModeErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			if (value) {
				const [addGameModeErr] = await $to(deviceApi.addGameMode());
				if (addGameModeErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				}
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

	onMounted(() => {});

	return {
		vaildModuleVersion,
		changeGameMode,
		isSupportGameMode,
	};
}
