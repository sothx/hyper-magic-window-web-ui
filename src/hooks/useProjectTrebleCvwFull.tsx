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
export interface KeyboardModeOptions {
	label: string;
	type: string;
	key: 0 | 1 | 2;
}

export type PenUpdate = 0 | 1;

export type PenEnable = 0 | 1;

export type KeyboardMode = 0 | 1 | 2;
export function useProjectTrebleCvwFull() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isSupportProp = ref<boolean>(false);

	const currentVerison = ref<number>(1);

	const isEnable = ref<boolean>(false);

	const splitScreenPlusIsInstalled = ref<boolean>(false);

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

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
			deviceApi
				.changeProjectTrebleVerticalScreenSplitEnableForProp(mode)
				.then(res => {
					isEnable.value = mode;
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，已经成功{mode ? '启用' : '禁用'}竖屏上下分屏~实际生效还需要重启{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
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
	};

	const fetchData = async () => {
		const [, getProjectTrebleSupoortCvwFullForSettingsRes] = await $to<string, string>(
			deviceApi.getProjectTrebleSupoortCvwFullForSettings(),
		);
		if (
			getProjectTrebleSupoortCvwFullForSettingsRes &&
			Number(getProjectTrebleSupoortCvwFullForSettingsRes) === 1
		) {
			isEnable.value = true;
		} else {
			isEnable.value = false;
		}
		const [, getProjectTrebleCvwFullVersionRes] = await $to<string, string>(
			deviceApi.getProjectTrebleCvwFullVersion(),
		);
		if (getProjectTrebleCvwFullVersionRes && typeof Number(getProjectTrebleCvwFullVersionRes) === 'number') {
			currentVerison.value = Number(getProjectTrebleCvwFullVersionRes);
		} else {
			currentVerison.value = 1;
		}
		const [, getProjectTrebleSupoortCvwFullForPropRes] = await $to<string, string>(
			deviceApi.getProjectTrebleSupoortCvwFullForProp(),
		);
		if (getProjectTrebleSupoortCvwFullForPropRes && getProjectTrebleSupoortCvwFullForPropRes === 'true') {
			isSupportProp.value = true;
		} else {
			isSupportProp.value = false;
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
		splitScreenPlusIsInstalled,
		reloadSystemUI,
		isEnable,
		changeEnableMode,
		isInit,
		loading,
	};
}
