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
export function useProjectTrebleVerticalScreenSplit() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isSupportProp = ref<boolean>(false);

	const currentVerison = ref<number>(1);

	const isEnableProp = ref<boolean>(false);

	const isEnableSettings = ref<boolean>(false);

	const splitScreenPlusIsInstalled = ref<boolean>(false);

	const isEnableProjectTreble = computed(() => {
		if (currentVerison.value === 2) {
			return isEnableSettings.value;
		} else {
			return isEnableProp.value;
		}
	});

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

	const openModuleDownloadUrl = () => {
		const NButtonTemplate = (text: string, type: ButtonProps['type'], onClick: ButtonProps['onClick']) => {
			return h(
				NButton,
				{
					type,
					size: 'small',
					class: 'my-3',
					block: true,
					dashed: true,
					onClick,
				},
				text,
			);
		};
		modal.create({
			title: '请选择模块的下载方式',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<>
					<p class='my-5'>请授予剪切板相关应用权限，否则可能无法正常复制到剪切板~</p>
					<div class='my-8'>
						{NButtonTemplate &&
							NButtonTemplate('通过 移动网盘 下载', 'info', () => {
								navigator.clipboard.writeText(`https://caiyun.139.com/w/i/2nQQUYS9D30nv`);
								deviceApi.openChinaMobileMCloud();
							})}
					</div>
					<div class='my-8'>
						{NButtonTemplate &&
							NButtonTemplate('通过 Github Release 下载', 'info', () => {
								navigator.clipboard.writeText(`https://github.com/HChenX/SplitScreenPlus/releases`);
								deviceApi.openUrl('https://github.com/HChenX/SplitScreenPlus/releases');
							})}
					</div>
				</>
			),
			negativeText: '关闭',
		});
	};

	const reloadSystemUI = () => {
		modal.create({
			title: '确定要重启系统界面么？',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<>
					<p>
						由于小米平板并不支持竖屏上下分屏，模块通过修改系统逻辑以实现竖屏上下分屏，可能存在不稳定等情况。
					</p>
					<p>
						{' '}
						如出现系统界面异常可以切换启用状态为 [未启用]
						后，通过重启系统界面解决界面异常问题，确定要继续吗？
					</p>
				</>
			),
			positiveText: '确定',
			negativeText: '取消',
			onPositiveClick() {
				deviceApi
					.killAndroidSystemUI()
					.then(async res => {
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
						});
					});
			},
		});
	};

	const changeEnableMode = async (mode: boolean, type: 'projectTreble' | 'module') => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `想${mode ? '启用' : '禁用'}竖屏上下分屏吗？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{
								<div>
									{mode ? '启用' : '禁用'}{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										竖屏上下分屏
									</span>{' '}
									后，
									{mode
										? '启用小米平板在竖屏下使用上下分屏，由于并非系统本身支持竖屏上下分屏（修改系统逻辑实现），因此启用后可能会存在不稳定等情况，如果使用则代表您愿意承担一切后果。'
										: '恢复小米平板系统默认情况下在竖屏下左右分屏的体验。'}
									{type === 'projectTreble' && (
										<p>
											实际生效还需要重启{' '}
											<span
												class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
												系统界面
											</span>{' '}
											作用域才会生效，确定要继续吗？
										</p>
									)}
								</div>
							}
						</div>
					),
					positiveText: `确定${mode ? '启用' : '禁用'}竖屏上下分屏`,
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
			if (type === 'projectTreble') {
				if (currentVerison.value === 2) {
					deviceApi
						.changeProjectTrebleVerticalScreenSplitEnableForSettings(mode ? 1 : 0)
						.then(res => {
							isEnableSettings.value = mode;
							modal.create({
								title: '操作成功',
								type: 'success',
								preset: 'dialog',
								content: () => (
									<p>
										好耶w，已经成功{mode ? '启用' : '禁用'}竖屏上下分屏~实际生效还需要重启{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											系统界面
										</span>{' '}
										的作用域，确定要继续吗？
									</p>
								),
								positiveText: '确定重启作用域',
								negativeText: '稍后手动重启',
								onPositiveClick() {
									deviceApi
										.killAndroidSystemUI()
										.then(async res => {
											modal.create({
												title: '重启作用域成功',
												type: 'success',
												preset: 'dialog',
												content: () => <p>已经成功为你重启对应的作用域，请查看是否生效~</p>,
											});
										})
										.catch(err => {
											modal.create({
												title: '重启作用域失败',
												type: 'error',
												preset: 'dialog',
												content: () => (
													<p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>
												),
											});
										});
								},
							});
						})
						.catch(() => {
							modal.create({
								title: '操作失败',
								type: 'error',
								preset: 'dialog',
								content: () => <p>修改失败，详情请查看日志记录~</p>,
								negativeText: '确定',
							});
						});
				} else {
					deviceApi
						.changeProjectTrebleVerticalScreenSplitEnableForProp(mode)
						.then(res => {
							isEnableProp.value = mode;
							modal.create({
								title: '操作成功',
								type: 'success',
								preset: 'dialog',
								content: () => (
									<p>
										好耶w，已经成功{mode ? '启用' : '禁用'}竖屏上下分屏~实际生效还需要重启{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											系统界面
										</span>{' '}
										的作用域，确定要继续吗？
									</p>
								),
								positiveText: '确定重启作用域',
								negativeText: '稍后手动重启',
								onPositiveClick() {
									deviceApi
										.killAndroidSystemUI()
										.then(async res => {
											modal.create({
												title: '重启作用域成功',
												type: 'success',
												preset: 'dialog',
												content: () => <p>已经成功为你重启对应的作用域，请查看是否生效~</p>,
											});
										})
										.catch(err => {
											modal.create({
												title: '重启作用域失败',
												type: 'error',
												preset: 'dialog',
												content: () => (
													<p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>
												),
											});
										});
								},
							});
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
			} else {
				deviceApi
					.changeProjectTrebleVerticalScreenSplitEnableForSettings(mode ? 1 : 0)
					.then(res => {
						isEnableSettings.value = mode ? true : false;
						modal.create({
							title: '操作成功',
							type: 'success',
							preset: 'dialog',
							content: () => (
								<>
									<p>好耶w，已经成功{mode ? '启用' : '禁用'}竖屏上下分屏，请查看是否生效~</p>
									<p>
										是否需要额外重启{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											系统界面
										</span>{' '}
										的作用域？
									</p>
								</>
							),
							positiveText: '重启作用域',
							negativeText: '关闭',
							onPositiveClick() {
								deviceApi
									.killAndroidSystemUI()
									.then(async res => {
										modal.create({
											title: '重启作用域成功',
											type: 'success',
											preset: 'dialog',
											content: () => <p>已经成功为你重启对应的作用域，请查看是否生效~</p>,
										});
									})
									.catch(err => {
										modal.create({
											title: '重启作用域失败',
											type: 'error',
											preset: 'dialog',
											content: () => (
												<p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>
											),
										});
									});
							},
						});
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
		}
	};

	const fetchData = async () => {
		const [, getSplitScreenPlusIsInstalledRes] = await $to<string, string>(deviceApi.getSplitScreenPlusIsEnabled());
		if (getSplitScreenPlusIsInstalledRes && getSplitScreenPlusIsInstalledRes === 'installed') {
			splitScreenPlusIsInstalled.value = true;
		} else {
			splitScreenPlusIsInstalled.value = false;
		}
		const [, getProjectTrebleSupoortVerticalScreenSplitForSettingsRes] = await $to<string, string>(
			deviceApi.getProjectTrebleSupoortVerticalScreenSplitForSettings(),
		);
		if (
			getProjectTrebleSupoortVerticalScreenSplitForSettingsRes &&
			Number(getProjectTrebleSupoortVerticalScreenSplitForSettingsRes) === 1
		) {
			isEnableSettings.value = true;
		} else {
			isEnableSettings.value = false;
		}
		const [, getProjectTrebleVerticalScreenSplitVersionRes] = await $to<string, string>(
			deviceApi.getProjectTrebleVerticalScreenSplitVersion(),
		);
		if (
			getProjectTrebleVerticalScreenSplitVersionRes &&
			typeof Number(getProjectTrebleVerticalScreenSplitVersionRes) === 'number'
		) {
			currentVerison.value = Number(getProjectTrebleVerticalScreenSplitVersionRes);
		} else {
			currentVerison.value = 2;
		}
		const [, getProjectTrebleSupoortVerticalScreenSplitRes] = await $to<string, string>(
			deviceApi.getProjectTrebleSupoortVerticalScreenSplitForProp(),
		);
		if (getProjectTrebleSupoortVerticalScreenSplitRes && getProjectTrebleSupoortVerticalScreenSplitRes === 'true') {
			isSupportProp.value = true;
		} else {
			isSupportProp.value = false;
		}
		const [, getProjectTrebleVerticalScreenSplitEnableRes] = await $to<string, string>(
			deviceApi.getProjectTrebleVerticalScreenSplitEnableForProp(),
		);
		if (getProjectTrebleVerticalScreenSplitEnableRes && getProjectTrebleVerticalScreenSplitEnableRes === 'true') {
			isEnableProp.value = true;
		} else {
			isEnableProp.value = false;
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
		currentVerison,
		isSupportProp,
		openModuleDownloadUrl,
		isEnableProp,
		isEnableProjectTreble,
		splitScreenPlusIsInstalled,
		reloadSystemUI,
		isEnableSettings,
		changeEnableMode,
		isInit,
		loading,
	};
}
