import { ref, computed, onMounted, nextTick, h } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as cacheHelper from '@/utils/cacheHelper';
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
import { useCacheStore } from '@/stores/cache';
export function useMiScreenShotsWriteClipboard() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isEnable = computed(() => cacheHelper.getCache<number>('MiScreenShotsWriteClipboardEnable') === 1);

	const isAutoEnable = computed(() => !!cacheHelper.getCache<boolean>('MiScreenShotsWriteClipboardAutoEnable'));

	const loading = ref<boolean>(true);

	const isInit = ref<boolean>(false);

	const changeEnableMode = async (mode: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: `想${mode ? '启用' : '关闭'}截图自动添加至剪贴板吗？`,
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{
								<div>
									{mode ? '启用' : '关闭'}{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										截图自动添加至剪贴板
									</span>{' '}
									后，
									{mode
										? '截图将自动保存到剪贴板，该功能仅支持小米系统内置定制版输入法。'
										: '截图不再默认添加至剪贴板~'}
								</div>
							}
						</div>
					),
					positiveText: `确定${mode ? '启用' : '关闭'}`,
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
				.changeMiScreenShotsWriteClipboardEnable(mode ? 1 : 0)
				.then(res => {
					cacheHelper.setCache('MiScreenShotsWriteClipboardEnable', mode ? 1 : 0);
					modal.create({
						title: '操作成功',
						type: 'success',
						preset: 'dialog',
						content: () => <p>好耶w，已经成功{mode ? '启用' : '关闭'}截图自动添加至剪贴板~</p>,
						positiveText: '确定',
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

	const changeIsAutoEnableMode = async (status: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: status ? '想启用开机自配置吗？' : '想关闭开机自配置吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{status && (
								<p>
									启用截图自动添加至剪贴板{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										开机自配置
									</span>{' '}
									后，每次开机30秒后会自动启用「截图自动添加至剪贴板」，由于该功能已经被小米废弃，小米会通过「手机管家/平板管家」强制覆写为「关闭」状态，如果强制结束「手机管家/平板管家」的后台，会导致「截图自动添加至剪贴板」再次被关闭，需要手动重新启用~
								</p>
							)}
							{!status && (
								<p>
									关闭截图自动添加至剪贴板{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										开机自配置
									</span>{' '}
									后将跟随系统默认规则行为，不再自动启用「截图自动添加至剪贴板」~
								</p>
							)}
							<p>
								{status ? '启用' : '关闭'}截图自动添加至剪贴板{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									开机自配置
								</span>{' '}
								后需要设备重启才会生效，是否继续？
							</p>
						</div>
					),
					positiveText: '确定',
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
				const [
					removeIsAutoEnableMiScreenShotsWriteClipboardErr,
					removeIsAutoEnableMiScreenShotsWriteClipboardRes,
				] = await $to(deviceApi.removeIsAutoEnableMiScreenShotsWriteClipboard());
				if (removeIsAutoEnableMiScreenShotsWriteClipboardErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>修改失败，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				} else {
					const [
						addIsAutoEnableMiScreenShotsWriteClipboardErr,
						addIsAutoEnableMiScreenShotsWriteClipboardRes,
					] = await $to(deviceApi.addIsAutoEnableMiScreenShotsWriteClipboard());
					if (addIsAutoEnableMiScreenShotsWriteClipboardErr) {
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
									好耶w，已启用截图自动添加至剪贴板开机自配置~实际生效还需要重启设备，确定要重启吗？
								</p>
							),
							positiveText: '立即重启',
							negativeText: '稍后手动重启',
							onPositiveClick() {
								deviceApi.rebootDevice().catch(err => {
									modal.create({
										title: '操作失败',
										type: 'error',
										preset: 'dialog',
										content: () => <p>无法重启设备，详情请查看日志记录~</p>,
										negativeText: '确定',
									});
									return;
								});
							},
						});
					}
				}
			} else {
				const [
					removeIsAutoEnableMiScreenShotsWriteClipboardErr,
					removeIsAutoEnableMiScreenShotsWriteClipboardRes,
				] = await $to(deviceApi.removeIsAutoEnableMiScreenShotsWriteClipboard());
				if (removeIsAutoEnableMiScreenShotsWriteClipboardErr) {
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
							<p>好耶w，已关闭截图自动添加至剪贴板开机自配置~实际生效还需要重启设备，确定要重启吗？</p>
						),
						positiveText: '立即重启',
						negativeText: '稍后手动重启',
						onPositiveClick() {
							deviceApi.rebootDevice().catch(err => {
								modal.create({
									title: '操作失败',
									type: 'error',
									preset: 'dialog',
									content: () => <p>无法重启设备，详情请查看日志记录~</p>,
									negativeText: '确定',
								});
								return;
							});
						},
					});
				}
			}
		}
	};

	const fetchData = async () => {
		// MiScreenShotsWriteClipboardEnable
		const [, getMiScreenShotsWriteClipboardEnableRes] = await $to<string, string>(deviceApi.getMiScreenShotsWriteClipboardEnable());
		cacheHelper.setCache('MiScreenShotsWriteClipboardEnable', Number(getMiScreenShotsWriteClipboardEnableRes) === 1 ? 1 : 0);

		// MiScreenShotsWriteClipboardAutoEnable
		if (cacheHelper.getCache<boolean>('MiScreenShotsWriteClipboardAutoEnable') === null) {
			const [, getIsAutoEnableMiScreenShotsWriteClipboardRes] = await $to<string, string>(deviceApi.getIsAutoEnableMiScreenShotsWriteClipboard());
			cacheHelper.setCache('MiScreenShotsWriteClipboardAutoEnable', String(getIsAutoEnableMiScreenShotsWriteClipboardRes) === 'true');
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
		isEnable,
		isAutoEnable,
		changeEnableMode,
		changeIsAutoEnableMode,
		isInit,
		loading,
	};
}
