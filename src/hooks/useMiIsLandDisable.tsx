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
export function useMiIsLandDisable() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isDisable = ref<boolean>(false);

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

	const currentMiIslandAutoDisableTask = ref<boolean>(false);

	const changeDisableMode = async (mode: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `想${mode ? '禁用' : '恢复'}小米超级岛吗？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{
								<div>
									{mode ? '禁用' : '恢复'}{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										小米超级岛
									</span>{' '}
									后，
									{mode ? '将使用「焦点通知」的样式~' : '将恢复小米手机/平板使用「小米超级岛」~'}
									<p>
										实际生效还需要重启{' '}
										<span
											class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
											系统界面
										</span>{' '}
										，确定要继续吗？
									</p>
								</div>
							}
						</div>
					),
					positiveText: `确定${mode ? '禁用' : '恢复'}小米超级岛`,
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
				.changeMiIslandProp(mode ? false : true)
				.then(async res => {
					if (mode) {
						const [addIsMiIsLandAutoDisableTaskErr, addIsMiIsLandAutoDisableTaskRes] = await $to(
							deviceApi.addIsMiIsLandAutoDisableTask(),
						);
						if (addIsMiIsLandAutoDisableTaskErr) {
							modal.create({
								title: '操作失败',
								type: 'error',
								preset: 'dialog',
								content: () => <p>修改失败，详情请查看日志记录~</p>,
								positiveText: '确定',
							});
						} else {
							currentMiIslandAutoDisableTask.value = mode;
						}
					} else {
						const [removeIsMiIsLandAutoDisableTaskErr, removeIsMiIsLandAutoDisableTaskRes] = await $to(
							deviceApi.removeIsMiIsLandAutoDisableTask(),
						);
						if (removeIsMiIsLandAutoDisableTaskErr) {
							modal.create({
								title: '操作失败',
								type: 'error',
								preset: 'dialog',
								content: () => <p>修改失败，详情请查看日志记录~</p>,
								positiveText: '确定',
							});
						} else {
							currentMiIslandAutoDisableTask.value = mode;
						}
					}
					isDisable.value = mode;
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，已经成功{mode ? '启用' : '关闭'}小米超级岛~实际生效还需要重启{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									系统界面
								</span>{' '}
								，确定要继续吗？
							</p>
						),
						positiveText: '确定重启系统界面作用域',
						negativeText: '稍后手动重启',
						onPositiveClick() {
							deviceApi
								.killAndroidSystemUI()
								.then(async res => {
									modal.create({
										title: '重启系统界面作用域成功',
										type: 'success',
										preset: 'dialog',
										content: () => <p>已经成功为你重启系统界面作用域，请查看是否生效~</p>,
									});
								})
								.catch(err => {
									modal.create({
										title: '重启系统界面作用域失败',
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
		const [, getMiIslandPropRes] = await $to<string, string>(deviceApi.getMiIslandProp());
		if (getMiIslandPropRes && getMiIslandPropRes === 'false') {
			isDisable.value = true;
		} else {
			isDisable.value = false;
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
		isDisable,
		changeDisableMode,
		isInit,
		loading,
	};
}
