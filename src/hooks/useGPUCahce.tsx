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

export function useGPUCahce() {
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const deviceStore = useDeviceStore();

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const clearCacheData = async () => {
		modal.create({
			title: '确定要清除GPU驱动缓存么？',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<div>
					<p>通常用于在安装GPU驱动之前，清理GPU驱动的缓存，避免潜在的问题</p>
				</div>
			),
			positiveText: '确定清理GPU驱动缓存',
			negativeText: '取消',
			onPositiveClick: () => {
				deviceApi
					.clearGPUCache()
					.then(res => {
						modal.create({
							title: '好耶，清理GPU驱动缓存成功',
							type: 'success',
							preset: 'dialog',
							content: () => <p>好耶w，已经成功清理GPU驱动缓存~</p>,
							positiveText: '确定',
						});
					})
					.catch(err => {
						modal.create({
							title: '清理GPU驱动缓存失败',
							type: 'error',
							preset: 'dialog',
							content: () => (
								<>
									<p>清理GPU驱动缓存失败，详情错误请查看日志记录~</p>
								</>
							),
							positiveText: '确定',
						});
					});
			},
		});
	};

	onMounted(() => {});

	return {
		clearCacheData,
	};
}
