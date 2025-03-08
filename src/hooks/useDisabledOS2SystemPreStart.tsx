import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import {
	NButton,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
	type DataTableColumns,
	type NInput,
} from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';

export function useDisabledOS2SystemPreStart() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const loading = ref<boolean>(false);

	const isInit = ref<boolean>(false);

	const moduleCurrent = ref<boolean>(false);

	const buildCurrent = ref<boolean>(false);

	const isShow = computed(() => {
		return isInit.value && buildCurrent.value;
	});

	const change = async (value: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: value ? '想开启应用预加载吗？' : '想禁用应用预加载吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{!value && (
								<p>
									禁用{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										应用预加载
									</span>{' '}
									后，触摸系统桌面上的{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										任意应用
									</span>{' '}
									不再触发应用预加载，需要设备重启才会生效，确定要继续开启并重启吗？
								</p>
							)}
							{value && (
								<p>
									开启{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										应用预加载
									</span>{' '}
									后，触摸系统桌面上的{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										任意应用
									</span>{' '}
									将会触发应用预加载，需要设备重启才会生效，确定要继续开启并重启吗？
								</p>
							)}
						</div>
					),
					positiveText: '确定，并立即重启',
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
			const [removeDisabledPreStartProcErr] = await $to(deviceApi.removeDisabledPreStartProc());
			if (removeDisabledPreStartProcErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法修改应用预加载的配置，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				loading.value = false;
				return;
			}
			if (!value) {
				const [addDisabledPreStartProcErr] = await $to(deviceApi.addDisabledPreStartProc());
				if (addDisabledPreStartProcErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法修改应用预加载的配置，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					loading.value = false;
					return;
				}
				loading.value = false;
				moduleCurrent.value = false;
			} else {
				loading.value = false;
				moduleCurrent.value = true;
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

	const get = async () => {
		loading.value = true;
		const [getPreStartProcForBuildErr, getPreStartProcForBuildRes] = await $to<string, string>(
			deviceApi.getPreStartProcForBuild(),
		);
		if (getPreStartProcForBuildErr) {
			loading.value = false;
			return;
		}
		if (getPreStartProcForBuildRes === 'true') {
			buildCurrent.value = true;
		} else {
			buildCurrent.value = false;
		}
		const [getPreStartProcForModuleErr, getPreStartProcForModuleRes] = await $to<string, string>(
			deviceApi.getPreStartProcForModule(),
		);
		if (getPreStartProcForBuildErr) {
			loading.value = false;
			return;
		}
		if (getPreStartProcForModuleRes === 'false') {
			moduleCurrent.value = false;
		} else {
			moduleCurrent.value = true;
		}
		loading.value = false;
	};

	onMounted(async () => {
		await get();
		isInit.value = true;
	});

	return {
		moduleCurrent,
		buildCurrent,
		isShow,
		loading,
		change,
		isInit,
	};
}
