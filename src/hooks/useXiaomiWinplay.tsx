import { ref, computed, onMounted, nextTick, h } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import * as winplayHelper from '@/utils/winplayHelper';
import { differenceBy } from 'lodash-es';
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

	const isLockWinPlayConfig = ref<boolean>(false);

	const isInit = ref<boolean>(false);

	const openWinPlay = async () => {
		// 每次点击都应该检测一下云控配置是否存在
		const [, getHasWinplayConfRes] = await $to<string, string>(deviceApi.getHasWinplayConf());
		if (getHasWinplayConfRes && getHasWinplayConfRes === 'exists') {
			hasWinPlayConf.value = true;
		} else {
			hasWinPlayConf.value = false;
		}
		// WinPlay未被初始化
		if (!hasWinPlayConf.value) {
			await copyCloudWinPlayConfig();
		} else {
			const [, hasWinPlayWhiteListConfigRes] = await $to<string, string>(deviceApi.hasWinPlayWhiteListConfig());
			if (
				hasWinPlayWhiteListConfigRes &&
				hasWinPlayWhiteListConfigRes === 'Winplay whitelist configuration exists.'
			) {
				hasWinPlayWhiteListConfig.value = true;
			} else {
				hasWinPlayWhiteListConfig.value = false;
			}
			// WinPlay已被初始化
			if (hasWinPlayWhiteListConfig.value) {
				// 存在Winplay游戏白名单，移除白名单配置
				await removeWinPlayWhiteListConfig();
			} else {
				const winplaySdkRes = await import('@/assets/winplay_sdk.json');
				const [, getWinPlayConfigRes] = await $to<string, string>(deviceApi.getWinPlayConfig());
				if (getWinPlayConfigRes) {
					try {
						const currentWinPlayConfig = winplayHelper.confToJson(getWinPlayConfigRes);
						const addDifference = differenceBy(
							winplaySdkRes.content.app_profile,
							currentWinPlayConfig,
							'name',
						);
						const hasNewItems = addDifference.length > 0;
						if (hasNewItems) {
							const mergeWinplayConfigJson = [...currentWinPlayConfig, ...addDifference];
							await mergeCloudWinPlayConfig(mergeWinplayConfigJson);
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
					} catch (err) {
						await copyCloudWinPlayConfig('parseErr');
					}
				} else {
					modal.create({
						title: '获取云控配置失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>获取云控配置失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				}
			}
		}
	};

	const changeCloudAuth = async (isLock: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `确定${isLock ? '禁用' : '恢复'}云控管理么？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{isLock && '禁用云控管理后，将增强清除游戏白名单的使用稳定性，之后您也可以随时恢复云控管理'}
							{!isLock &&
								'恢复云控管理后，每次启动「PC游戏引擎」将会重新尝试获取最新云控配置，但是将导致清除游戏白名单不稳定，可能无法正常启动非白名单游戏'}
							，确定要{isLock ? '禁用' : '恢复'}云控管理吗？
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
				.setWinplayCloudConf(isLock ? 444 : 777)
				.then(res => {
					isLockWinPlayConfig.value = isLock;
					modal.create({
						title: `${isLock ? '禁用' : '恢复'}云控管理成功`,
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>好耶w，已经成功{isLock ? '禁用' : '恢复'}云控管理，请重新尝试启动PC游戏引擎~</p>
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

	const removeWinPlayWhiteListConfig = async () => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `确定移除白名单配置并禁用云控管理么？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							您当前的PC游戏引擎存在游戏白名单配置，仅能访问白名单内的Steam游戏，需要移除白名单配置并禁用云控管理后才能启动PC游戏引擎，确定要移除游戏白名单配置并禁用云控管理吗？
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
					isLockWinPlayConfig.value = true;
					modal.create({
						title: '移除成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，已经成功移除PC游戏引擎云控游戏白名单列表并禁用云控管理，请重新尝试启动PC游戏引擎~
							</p>
						),
						positiveText: '确定',
					});
				})
				.catch(err => {
					modal.create({
						title: '移除失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>移除失败，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
				});
		}
	};

	const mergeCloudWinPlayConfig = async (mergeContent: any[]) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `确定合并云控规则么？`,
					type: 'info',
					preset: 'dialog',
					content: () => {
						return (
							<div>您的PC游戏引擎存在更新的云控规则，是否合并云控规则并禁用云控管理，确定要继续吗？</div>
						);
					},
					positiveText: `确定合并`,
					negativeText: '暂不合并',
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
			// 合并：老数组 + 新增项（新增放最后）
			try {
				const mergeWinplayConfig = winplayHelper.jsonToConf(mergeContent);
				deviceApi
					.writeXiaomiWinPlayCloudConfig(mergeWinplayConfig)
					.then(res => {
						hasWinPlayConf.value = true;
						isLockWinPlayConfig.value = true;
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
			} catch (err) {
				modal.create({
					title: '合并云控配置失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>合并云控配置失败，详情请查看日志记录~</p>,
					positiveText: '确定',
				});
			}
		}
		if (negativeRes) {
			deviceApi
				.openXiaomiWinplayLauncherActivity()
				.then(res => {
					modal.create({
						title: '启动成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>好耶w，已尝试启动PC游戏引擎，请确保网络环境能够正常访问Steam，否则可能无法正常使用~</p>
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

	const copyCloudWinPlayConfig = async (copyType: 'init' | 'parseErr' = 'init') => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `确定写入云控规则么？`,
					type: 'info',
					preset: 'dialog',
					content: () => {
						if (copyType === 'init') {
							return (
								<div>
									您的PC游戏引擎尚未存在云控规则，即将写入PC游戏引擎的云控规则并禁用云控管理，确定要继续吗？
								</div>
							);
						}
						if (copyType === 'parseErr') {
							return (
								<div>
									您的PC游戏引擎云控规则解析异常，即将重新写入PC游戏引擎的云控规则并禁用云控管理，确定要继续吗？
								</div>
							);
						}
					},
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
				.copyXiaomiWinPlayCloudConfig()
				.then(res => {
					hasWinPlayConf.value = true;
					isLockWinPlayConfig.value = true;
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
		// 如果WinPlay配置文件存在
		if (hasWinPlayConf.value) {
			// 判断是否存在白名单配置
			const [, hasWinPlayWhiteListConfigRes] = await $to<string, string>(deviceApi.hasWinPlayWhiteListConfig());
			if (hasWinPlayWhiteListConfigRes && hasWinPlayWhiteListConfigRes === 'hasWinPlayWhiteListConfig') {
				hasWinPlayWhiteListConfig.value = true;
			} else {
				hasWinPlayWhiteListConfig.value = false;
			}
			// 判断权限情况
			const [, getWinplayConfAuth] = await $to<string, string>(deviceApi.getWinplayConfAuth());
			if (getWinplayConfAuth && getWinplayConfAuth === '444') {
				isLockWinPlayConfig.value = true;
			} else {
				isLockWinPlayConfig.value = false;
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
		changeCloudAuth,
		openWinPlay,
		hasWinPlayConf,
		isLockWinPlayConfig,
		hasWinPlayWhiteListConfig,
		isSupportProjectTreble,
		ProjectTrebleCurrentVerison,
		isInit,
		loading,
	};
}
