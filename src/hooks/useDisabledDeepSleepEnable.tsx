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

export function useDisabledDeepSleepEnable() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const isShow = computed(() => {
		return (
			deviceStore.deepSleepProp.build &&
			deviceStore.androidTargetSdk >= 34 &&
			deviceStore.deviceCharacteristics === 'tablet'
		);
	});

	const change = async (value: boolean) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: value ? '想开启深度睡眠吗？' : '想禁用深度睡眠吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							{!value && (
								<p>
									禁用{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										深度睡眠
									</span>{' '}
									后，平板不会在长时间待机的情况下关闭部分传感器，但设备整体耗电量将增加，需要设备重启才会生效，确定要继续禁用吗？
								</p>
							)}
							{value && (
								<p>
									开启{' '}
									<span
										class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
										深度睡眠
									</span>{' '}
									后，平板在长时间待机的情况下会关闭部分传感器以节省电量，需要设备重启才会生效，确定要继续开启吗？
								</p>
							)}
						</div>
					),
					positiveText: '确定',
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
			const [removeDisabledDeepSleepEnableErr] = await $to(deviceApi.removeDisabledDeepSleepEnable());
			if (removeDisabledDeepSleepEnableErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法修改深度睡眠的配置，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			if (!value) {
				const [addDisabledDeepSleepEnableErr] = await $to(deviceApi.addDisabledDeepSleepEnable());
				if (addDisabledDeepSleepEnableErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法修改深度睡眠的配置，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				}
			}
			modal.create({
				title: '操作成功',
				type: 'success',
				preset: 'dialog',
				content: () => <p>好耶w，已{value ? '开启' : '关闭'}深度睡眠~实际生效还需要重启设备，确定要重启吗？</p>,
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
	};

	onMounted(() => {});

	return {
		isShow,
		change,
	};
}
