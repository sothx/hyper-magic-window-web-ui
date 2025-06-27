import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import $to from 'await-to-js';
import { divide } from 'lodash-es';

export interface messageCenterOptions {
	label: string;
	key: string;
}

export function useJoyose() {
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const deviceStore = useDeviceStore();
	const isSupportGameMode = computed(() => {
		return deviceStore.miuiCompatEnable && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk > 31;
	});

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const clearCloudData = async () => {
		modal.create({
			title: '确定要重置 Joyose 云控数据么？',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<div>
					<p>重置 Joyose 云控数据后系统会尝试重新获取 Joyose 的云控数据，清确保当前在 Wifi 网络环境下，否则无法正常获取云控数据。</p>
					<p>(如仍然无法获取到新的 Joyose 云控数据，请尝试重启设备)</p>
				</div>
			),
			positiveText: '确定重置云控数据',
			negativeText: '取消',
			onPositiveClick: () => {
				deviceApi
					.clearJoyose()
					.then(res => {
						modal.create({
							title: '好耶，重置云控数据成功',
							type: 'success',
							preset: 'dialog',
							content: () => (
								<p>
									好耶w，已经成功重置 Joyose 云控数据，系统会尝试重新获取 Joyose
									的云控数据，清确保当前在 Wifi 网络环境下，否则无法正常获取云控数据~
								</p>
							),
							positiveText: '确定',
						});
					})
					.catch(err => {
						modal.create({
							title: '重置云控数据失败',
							type: 'error',
							preset: 'dialog',
							content: () => <>
								<p>重置云控数据失败，可能 Joyose 相关服务被禁用，部分性能调度、系统线程优化、屏蔽云控类模块会禁止 Joyose 相关服务，如不需要系统 Joyose 云控调度可以选择忽略。</p>
								<p>详情错误请查看日志记录~</p>
							</>,
							negativeText: '确定',
						});
					});
			},
		});
	};

	onMounted(() => {});

	return {
		clearCloudData,
	};
}
