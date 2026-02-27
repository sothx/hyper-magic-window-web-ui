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
export function useProjectTrebleCvwFull() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isProjectTrebleSupport = ref<boolean>(false);

	const currentVerison = ref<number>(1);

	const isGlobalEnable = ref<boolean>(false);

	const isDefaultDesktopEnable = ref<boolean>(false);

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

	type DesktopModeType  = 'DefaultDesktopMode' | 'MiuiDesktopMode'

    const isSupport = computed(() => {
        return isProjectTrebleSupport.value && currentVerison.value >= 2;
    })

	const changeEnableMode = async (switchMode: boolean, desktopMode: DesktopModeType) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `想${switchMode ? '启用' : '禁用'}${desktopMode === 'DefaultDesktopMode' ? '普通桌面' : '工作台'}无极小窗吗？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{
								<div>
									{switchMode ? '启用' : '禁用'}{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										{ desktopMode === 'DefaultDesktopMode' ? '普通桌面无极小窗' : '工作台无极小窗' }
									</span>{' '}
									后，
									{switchMode
										? `${desktopMode === 'DefaultDesktopMode' ? '普通桌面' : '工作台'}模式下任意应用小窗支持无级调节~`
										: `将恢复小米平板系统默认${desktopMode === 'DefaultDesktopMode' ? '普通桌面' : '工作台'}模式下的应用小窗体验~`}
									<p>
										实际生效还需要重启{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											系统界面
										</span>{' '}
										作用域，确定要继续吗？
									</p>
								</div>
							}
						</div>
					),
					positiveText: `确定${switchMode ? '启用' : '禁用'}${desktopMode === 'DefaultDesktopMode' ? '普通桌面' : '工作台'}无极小窗`,
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
			const currentApi = desktopMode === 'DefaultDesktopMode' ? deviceApi.changeProjectTrebleCvwFullDefaultDesktopEnable : deviceApi.changeProjectTrebleCvwFullGlobalEnable
			currentApi(switchMode ? 1 : 0)
				.then(res => {
					if (desktopMode === 'DefaultDesktopMode') {
						isDefaultDesktopEnable.value = switchMode;
					} else {
						isGlobalEnable.value = switchMode;
					}
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，已经成功{switchMode ? '启用' : '禁用'}${desktopMode === 'DefaultDesktopMode' ? '普通桌面' : '工作台'}模式下的无极小窗~实际生效还需要重启{' '}
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
						positiveText: '确定',
					});
				});
		}
	};

	const fetchData = async () => {
		const [, getProjectTrebleCvwFullVersionRes] = await $to<string, string>(
			deviceApi.getProjectTrebleCvwFullVersion(),
		);
		if (getProjectTrebleCvwFullVersionRes && typeof Number(getProjectTrebleCvwFullVersionRes) === 'number') {
			currentVerison.value = Number(getProjectTrebleCvwFullVersionRes);
		} else {
			currentVerison.value = 1;
		}
		if (currentVerison.value >= 2) {
            const [, getProjectTrebleSupoortCvwFullForPropRes] = await $to<string, string>(
				deviceApi.getProjectTrebleSupoortCvwFullForProp(),
			);
            if (getProjectTrebleSupoortCvwFullForPropRes && getProjectTrebleSupoortCvwFullForPropRes === 'true') {
				isProjectTrebleSupport.value = true;
			} else {
				isProjectTrebleSupport.value = false;
			}
			const [, getProjectTrebleSupportCvwFullGlobalEnableRes] = await $to<string, string>(
				deviceApi.getProjectTrebleSupportCvwFullGlobalEnable(),
			);
			if (
				getProjectTrebleSupportCvwFullGlobalEnableRes &&
				Number(getProjectTrebleSupportCvwFullGlobalEnableRes) === 1
			) {
				isGlobalEnable.value = true;
			} else {
				isGlobalEnable.value = false;
			}
            const [, getProjectTrebleCvwFullDefaultDesktopEnableRes] = await $to<string, string>(
				deviceApi.getProjectTrebleCvwFullDefaultDesktopEnable(),
			);
			if (
				getProjectTrebleCvwFullDefaultDesktopEnableRes &&
				Number(getProjectTrebleCvwFullDefaultDesktopEnableRes) === 1
			) {
				isDefaultDesktopEnable.value = true;
			} else {
				isDefaultDesktopEnable.value = false;
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
		currentVerison,
		isSupport,
		isGlobalEnable,
        isDefaultDesktopEnable,
		changeEnableMode,
		isInit,
		loading,
	};
}
