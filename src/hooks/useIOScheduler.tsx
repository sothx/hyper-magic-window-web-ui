import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import $to from 'await-to-js';
import { parseSchedulerOutput } from '@/utils/common';

export function useIOScheduler() {
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const smartFocusIO = ref<deviceApi.SmartFocusIOResult['stdout']>();
	const deviceStore = useDeviceStore();
	const schedulerList = ref<string[]>();
	const currentScheduler = ref<string>();
	const currentPropScheduler = ref<string>();
	const loading = ref<boolean>(true);
	const isInit = ref<boolean>(false);
	const isNeedShowModuleTips = computed(() => {
		return deviceStore.deviceInfo.socModel === 'SM8475' &&
					deviceStore.androidTargetSdk &&
					deviceStore.androidTargetSdk >= 34 &&
					smartFocusIO.value !== 'on'
	});
	const isSupportSmartFocusIO = computed(() => {
		return Array.isArray(schedulerList.value) && schedulerList.value.includes('cpq')
	})

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});
	const changeIOScheduler = async (scheduler: string) => {
		const [negativeRes, positiveRes] = await $to(
			new Promise((resolve, reject) => {
				modal.create({
					title: currentScheduler.value !== scheduler && currentPropScheduler.value !== scheduler ? '想应用该磁盘IO调度策略吗？' : '想移除并重置该磁盘IO调度策略吗？',
					type: 'info',
					preset: 'dialog',
					content: () => (
						<div>
							<p>
								{currentScheduler.value !== scheduler && currentPropScheduler.value !== scheduler ? '应用' : '移除并重置'}{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									磁盘IO调度策略
								</span>{' '}
								{
									currentScheduler.value !== scheduler && currentPropScheduler.value !== scheduler ? '将立即生效，' : '需要设备重启后才会生效，'
								}
							</p>
							<p>是否继续{currentScheduler.value !== scheduler && currentPropScheduler.value !== scheduler ? '应用' : '移除并重置'}该磁盘IO调度策略？</p>
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
			const [removeAutoSettingIOSchedulerErr] = await $to(deviceApi.removeAutoSettingIOScheduler());
			if (removeAutoSettingIOSchedulerErr) {
				modal.create({
					title: '操作失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
					negativeText: '确定',
				});
				return;
			}
			if (currentScheduler.value !== scheduler && currentPropScheduler.value !== scheduler) {
				const [writeIOSchedulerErr] = await $to(deviceApi.writeIOScheduler(scheduler));
				if (writeIOSchedulerErr) {
						modal.create({
							title: '操作失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>无法写入新的磁盘IO调度，详情请查看日志记录~</p>,
							negativeText: '确定',
						});
						return;
				}
				const [addAutoSettingIOSchedulerErr] = await $to(deviceApi.addAutoSettingIOScheduler(scheduler));
				if (addAutoSettingIOSchedulerErr) {
					modal.create({
						title: '操作失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>无法修改模块配置文件，详情请查看日志记录~</p>,
						negativeText: '确定',
					});
					return;
				}
				currentPropScheduler.value = scheduler;
				currentScheduler.value = scheduler;
				modal.create({
					title: '操作成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>好耶w，已经成功配置磁盘IO调度~</p>
					),
					positiveText: '确定',
				});
			} else {
				currentPropScheduler.value = undefined;
				modal.create({
					title: '操作成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>好耶w，已经成功移除并重置磁盘IO调度~实际生效还需要重启设备，确定要重启吗？</p>
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
	};

	const fetchData = async () => {
		loading.value = true;
		const [, getSmartFocusIORes] = await $to<string, string>(deviceApi.getSmartFocusIO());
		const [,getAutoSettingIOSchedulerRes] = await $to<string,string>(deviceApi.getAutoSettingIOScheduler());
		if (getAutoSettingIOSchedulerRes) {
			currentPropScheduler.value = getAutoSettingIOSchedulerRes;
		} else {
			currentPropScheduler.value = undefined;
		}
		const [,getIOSchedulerRes] = await $to<string,string>(deviceApi.getIOScheduler());
		if (getIOSchedulerRes) {
			const { schedulerList: outputSchedulerList, currentScheduler : outputCurrentScheduler } = parseSchedulerOutput(getIOSchedulerRes);
			schedulerList.value = outputSchedulerList;
			currentScheduler.value = outputCurrentScheduler;
		}

		if (getSmartFocusIORes === 'on') {
			smartFocusIO.value = 'on';
		} else {
			smartFocusIO.value = 'off';
		}
		loading.value = false;
		isInit.value = true;

	};

	onMounted(() => {
		setTimeout(() => {
			fetchData(); // 确保 UI 先渲染，再执行耗时操作
		}, 0);
	});

	return {
		smartFocusIO,
		loading,
		isInit,
		currentScheduler,
		currentPropScheduler,
		isNeedShowModuleTips,
		isSupportSmartFocusIO,
		schedulerList,
		changeIOScheduler,
	};
}
