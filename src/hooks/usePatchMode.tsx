import { ref, computed, onMounted, nextTick } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import {
	NButton,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
	type DataTableColumns,
	type NInput,
} from 'naive-ui';
import * as embeddedApi from '@/apis/embeddedApi';
import { useEmbeddedStore } from '@/stores/embedded';

export function usePatchMode() {
	const deviceStore = useDeviceStore();
	const embeddedStore = useEmbeddedStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const loading = ref<boolean>(false);

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const showReloadModal = async () => {
		const [, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: '是否需要重新生成定制应用数据？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<p>
							检测到您最近已经更新了模块版本并且开启了{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								定制模式
							</span>{' '}
							，模块需要重新操作{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								生成定制应用数据
							</span>{' '}
							，确定要继续吗？
						</p>
					),
					positiveText: '确定',
					negativeText: '取消',
					onPositiveClick() {
						resolve('success');
					},
					onNegativeClick() {
						reject('cancel');
					},
					onMaskClick() {
						reject('cancel');
					},
					onClose() {
						reject('cancel');
					},
				});
			}),
		);
		if (positiveRes) {
			await reloadPatchMode();
		}
		embeddedStore.isNeedShowReloadPathModeDialog = false;
		deviceStore.needReloadData = false;
	};

	const reloadPatchMode = async () => {
		await deviceStore.getAndroidApplicationPackageList();
		await deviceStore.getInstalledAppPackageInfoList();
		loading.value = true;
		const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(embeddedApi.updateEmbeddedApp());
		if (submitUpdateEmbeddedAppErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
			});
			loading.value = false;
		} else {
			embeddedStore.updateMergeRuleList();
			loading.value = false;
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						{embeddedStore.isDeepPatchMode && (
							<p>
								好耶w，检测到您已启用{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									深度定制模式
								</span>{' '}
								，已根据您当前已安装应用列表重新{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									修剪模块应用适配列表
								</span>{' '}
								，后续每次更新模块或者安装新的应用后，均需要重新操作{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									生成定制应用数据
								</span>{' '}
								。
							</p>
						)}
						{!embeddedStore.isDeepPatchMode && (
							<p>
								好耶w，已根据您设备当前的整体应用情况重新{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									修剪模块应用适配列表
								</span>{' '}
								，后续每次更新模块或者安装新的应用后，建议重新操作{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									生成定制应用数据
								</span>{' '}
								。
							</p>
						)}
					</div>
				),
				positiveText: '确定',
			});
		}
	};

	const changePatchMode = async (value: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: value ? '想切换为定制模式吗？' : '想切换为完整模式吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{value && (
								<p>
									切换为{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										定制模式
									</span>{' '}
									后，模块会以您设备的整体应用情况{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										修剪模块应用适配列表
									</span>{' '}
									，以解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，后续每次更新模块或者安装新的应用后，建议前往{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										应用横屏布局
									</span>{' '}
									重新{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										生成定制应用数据
									</span>{' '}
									，确定要继续吗？
								</p>
							)}
							{!value && (
								<p>
									切换为{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										完整模式
									</span>{' '}
									后，可以获得模块提供的大量应用适配，同时可能会导致部分老机型由于系统优化不佳而导致的卡顿、掉帧等问题，确定要继续吗？
								</p>
							)}
						</div>
					),
					positiveText: '确定继续',
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
			loading.value = true;
			const [removeIsPatchModeErr] = await $to(deviceApi.removeIsPatchMode());
			if (removeIsPatchModeErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法移除定制模式的配置项，详情请查看日志记录~</p>,
					positiveText: '确定',
				});
				loading.value = false;
				return;
			}
			if (value) {
				const [addIsPatchModeErr] = await $to(deviceApi.addIsPatchMode());
				if (addIsPatchModeErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法切换为定制模式，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
					loading.value = false;
					return;
				}
				embeddedStore.isPatchMode = true;
			} else {
				loading.value = false;
				embeddedStore.isPatchMode = false;
			}
			await deviceStore.getAndroidApplicationPackageList();
			await deviceStore.getInstalledAppPackageInfoList();
			const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(embeddedApi.updateEmbeddedApp());
			if (submitUpdateEmbeddedAppErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
				});
				embeddedStore.isPatchMode = !embeddedStore.isPatchMode;
				loading.value = false;
			} else {
				modal.create({
					title: '操作成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<div>
							{value && (
								<p>
									好耶w，已成功切换为{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										定制模式
									</span>{' '}
									，模块已根据您设备当前的整体应用情况{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										修剪模块应用适配列表
									</span>{' '}
									，以解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，建议每次更新模块或者安装新的应用后，均需要在前往{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										应用横屏布局
									</span>{' '}
									界面重新{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										生成定制应用数据
									</span>{' '}
									。
								</p>
							)}
							{!value && (
								<p>
									好耶w，已成功切换为{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										完整模式
									</span>{' '}
									，可以获得模块提供的大量应用适配，同时可能会导致部分老机型由于系统优化不佳而导致的卡顿、掉帧等问题。
								</p>
							)}
						</div>
					),
					positiveText: '确定',
				});
				loading.value = false;
				embeddedStore.updateMergeRuleList();
			}
		}
	};

	const changeDeepPatchMode = async (value: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: value ? '想启用深度定制模式吗？' : '想关闭深度定制模式吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{value && (
								<p>
									启用{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										深度定制模式
									</span>{' '}
									后，模块将仅根据{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										当前已安装应用修剪模块应用适配列表
									</span>{' '}
									，不再提供{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										高频应用适配列表
									</span>{' '}
									作为兜底，可以进一步优化老机型由于系统优化不佳而导致的卡顿、掉帧等问题，但后续每次更新模块或者安装新的应用后，均需要前往{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										应用横屏布局
									</span>{' '}
									重新{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										生成定制应用数据
									</span>{' '}
									，确定要继续吗？
								</p>
							)}
							{!value && (
								<p>
									关闭{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										深度定制模式
									</span>{' '}
									后，模块会以更符合大多数人的设备整体应用情况{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										修剪模块应用适配列表
									</span>{' '}
									，确定要继续吗？
								</p>
							)}
						</div>
					),
					positiveText: '确定继续',
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
			loading.value = true;
			const [removeIsDeepPatchModeErr] = await $to(deviceApi.removeIsDeepPatchMode());
			if (removeIsDeepPatchModeErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法移除深度定制模式的配置项，详情请查看日志记录~</p>,
					positiveText: '确定',
				});
				loading.value = false;
				return;
			}
			if (value) {
				const [addIsDeepPatchModeErr] = await $to(deviceApi.addIsDeepPatchMode());
				if (addIsDeepPatchModeErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法切换为深度定制模式，详情请查看日志记录~</p>,
						positiveText: '确定',
					});
					loading.value = false;
					return;
				}
				embeddedStore.isDeepPatchMode = true;
			} else {
				loading.value = false;
				embeddedStore.isDeepPatchMode = false;
			}
			await deviceStore.getAndroidApplicationPackageList();
			await deviceStore.getInstalledAppPackageInfoList();
			const [submitUpdateEmbeddedAppErr, submitUpdateEmbeddedAppRes] = await $to(embeddedApi.updateEmbeddedApp());
			if (submitUpdateEmbeddedAppErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，更新失败了QwQ，详细错误请查看错误日志~</p>,
				});
				embeddedStore.isPatchMode = !embeddedStore.isPatchMode;
				loading.value = false;
			} else {
				modal.create({
					title: '操作成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<div>
							{value && (
								<p>
									好耶w，已成功启用{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										深度定制模式
									</span>{' '}
									，模块将仅根据当前已安装应用{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										修剪模块应用适配列表
									</span>{' '}
									，不再提供{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										高频应用适配列表
									</span>{' '}
									作为兜底，可以进一步解决老机型由于系统优化不佳而导致的卡顿、掉帧等问题，但后续每次更新模块或者安装新的应用后，均需要前往{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										应用横屏布局
									</span>{' '}
									界面重新{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										生成定制应用数据
									</span>{' '}
									。
								</p>
							)}
							{!value && (
								<p>
									好耶w，已成功关闭{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										深度定制模式
									</span>{' '}
									，模块会以更符合大多数人的设备整体应用情况{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										修剪模块应用适配列表
									</span>{' '}
									。
								</p>
							)}
						</div>
					),
					positiveText: '确定',
				});
				loading.value = false;
				embeddedStore.updateMergeRuleList();
			}
		}
	};

	return {
		reloadPatchMode,
		changePatchMode,
		changeDeepPatchMode,
		showReloadModal,
		loading,
	};
}
