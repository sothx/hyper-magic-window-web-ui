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

	const hasWinPlayConf = ref<boolean>(false);

	const hasWinPlayWhiteListConfig = ref<boolean>(false);

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

	const openWinPlay = async () => {
		// 只要不是移植包，每次点击都应该检测一下云控配置是否存在
		if (!isSupportProjectTreble.value) {
			const [, getHasWinplayConfRes] = await $to<string, string>(deviceApi.getHasWinplayConf());
			if (getHasWinplayConfRes && getHasWinplayConfRes === 'exists') {
				hasWinPlayConf.value = true;
			} else {
				hasWinPlayConf.value = false;
			}
		}
		// WinPlay未被初始化
		if (!hasWinPlayConf.value) {
			if (isSupportProjectTreble.value) {
				// 当前是移植包,复制模块云控配置
				await copyCloudWinPlayConf();
			} else {
				// 当前是官包,执行初始化配置
				await initCloudWinPlayConfig();
			}
		} else {
			// WinPlay已被初始化
			if (hasWinPlayWhiteListConfig.value) {
				// 存在Winplay游戏白名单，移除白名单配置
				await removeWinPlayWhiteListConfig();
			} else {
				deviceApi
					.openXiaomiWinplayLauncherActivity()
					.then(res => {
						modal.create({
							title: '启动成功',
							type: 'success',
							preset: 'dialog',
							content: () => (
								<p>
									好耶w，已尝试启动PC游戏引擎，请确保网络环境能够正常访问Steam，否则可能无法正常使用~
								</p>
							),
							positiveText: '确定',
						});
					})
					.catch(err => {
						modal.create({
							title: '启动失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>启动失败，详情请查看日志记录~</p>,
							positiveText: '确定',
						});
					});
			}
		}
	};

	const removeWinPlayWhiteListConfig = async () => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `确定移除游戏白名单配置么？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							您当前的PC游戏引擎存在游戏白名单配置，仅能访问白名单内的Steam游戏，需要移除白名单配置后才能启动PC游戏引擎，确定要移除游戏白名单配置吗？
						</div>
					),
					positiveText: `确定`,
					negativeText: '我再想想',
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
			deviceApi
				.removeWinplayWhiteListConfig()
				.then(res => {
					hasWinPlayWhiteListConfig.value = false;
					modal.create({
						title: '移除成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>好耶w，已经成功移除PC游戏引擎云控游戏白名单列表，请重新尝试启动PC游戏引擎~</p>
						),
						positiveText: '确定',
					});
				})
				.catch(err => {
					modal.create({
						title: '移除失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>写入失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				});
		}
	};

	const copyCloudWinPlayConf = async () => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `确定写入云控规则么？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{
								<div>
									您的移植包已适配PC游戏引擎，即将写入PC游戏引擎的云控规则，请确保网络环境能够正常访问Steam，确定要继续吗？
								</div>
							}
						</div>
					),
					positiveText: `确定`,
					negativeText: '我再想想',
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
			deviceApi
				.copyXiaomiWinPlayCloudConfig()
				.then(res => {
					hasWinPlayConf.value = true;
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>好耶w，已经成功写入PC游戏引擎云控规则，请重新尝试启动PC游戏引擎~</p>,
						positiveText: '确定',
					});
				})
				.catch(err => {
					modal.create({
						title: '写入失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>写入失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				});
		}
	};

	const initCloudWinPlayConfig = async () => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `确定初始化WinPlay么？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							您的PC游戏引擎尚未初始化，第一次启动系统将初始化PC游戏引擎相关容器环境，请确保网络环境能够正常访问Steam，第一次启动由于游戏白名单限制可能无法正常启动成功，但将会完成容器环境的初始化，失败后请结束PC游戏引擎的后台并尝试重新启动，确定要继续么？
						</div>
					),
					positiveText: `确定启动`,
					negativeText: '我再想想',
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
			deviceApi
				.openXiaomiWinplayLauncherActivity()
				.then(res => {
					modal.create({
						title: '启动成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，已尝试启动PC游戏引擎，请确保网络环境能够正常访问Steam，第一次启动由于游戏白名单限制可能无法正常启动成功，但将会完成容器环境的初始化，失败后请结束PC游戏引擎的后台并尝试重新启动
							</p>
						),
						positiveText: '确定',
					});
				})
				.catch(err => {
					modal.create({
						title: '启动失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>启动失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				});
		}
	};

	const fetchData = async () => {
		const [, getXiaomiWinPlayIsInstalledRes] = await $to<string, string>(deviceApi.getXiaomiWinPlayIsInstalled());
		if (getXiaomiWinPlayIsInstalledRes && getXiaomiWinPlayIsInstalledRes === 'installed') {
			XiaomiWinPlayIsInstalled.value = true;
		} else {
			XiaomiWinPlayIsInstalled.value = false;
		}
		// 如果WinPlay已安装，检测是否存在配置文件,记录保存值
		if (XiaomiWinPlayIsInstalled.value) {
			const [, getHasWinplayConfRes] = await $to<string, string>(deviceApi.getHasWinplayConf());
			if (getHasWinplayConfRes && getHasWinplayConfRes === 'exists') {
				hasWinPlayConf.value = true;
			} else {
				hasWinPlayConf.value = false;
			}
		}
		// 如果WinPlay配置文件存在，判断是否存在白名单配置
		if (hasWinPlayConf.value) {
			const [, hasWinPlayWhiteListConfigRes] = await $to<string, string>(deviceApi.hasWinPlayWhiteListConfig());
			if (
				hasWinPlayWhiteListConfigRes &&
				hasWinPlayWhiteListConfigRes === 'Winplay whitelist configuration exists.'
			) {
				hasWinPlayWhiteListConfig.value = true;
			} else {
				hasWinPlayWhiteListConfig.value = false;
			}
		}
		// 移植包适配Winplay版本号记录
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
		openWinPlay,
		hasWinPlayConf,
		hasWinPlayWhiteListConfig,
		isSupportProjectTreble,
		ProjectTrebleCurrentVerison,
		isInit,
		loading,
	};
}
