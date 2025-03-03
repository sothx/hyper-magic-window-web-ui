import { ref, computed, onMounted } from 'vue';
import $to from 'await-to-js';
import { useDeviceStore } from '@/stores/device';
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
import { useLogsStore } from '@/stores/logs';

export function useDisplaySettings() {
	const deviceStore = useDeviceStore();

	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

    const hasQComDisplayBrightness = ref<boolean>(false);

    const hasMTKDisplayBrightness = ref<boolean>(false);

	const open = async () => {
		modal.create({
			title: '确认使用伪·熄灭屏幕吗？',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<div>
					<p>
                    通过将屏幕亮度调整为0，达到熄灭屏幕但是不影响屏幕的触控操作。可能适合部分特殊场景使用，游戏或者视频场景仍然推荐使用{' '}
                        <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                            熄屏挂机
                        </span>{' '}和{' '}
                        <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                            熄屏听剧
                        </span>{' '}，使用该功能会自动关闭{' '}
                        <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                            自动亮度
                        </span>{' '}，请悉知，如需恢复屏幕显示需要敲击两次{' '}
                        <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                            电源键
                        </span>{' '}，确定要继续吗？
					</p>
				</div>
			),
			positiveText: '确定开启',
			negativeText: '我再想想',
			onPositiveClick: async () => {
                if (hasQComDisplayBrightness.value) {
                    await deviceApi.setQComDisplayBrightnessToZero()
                }
                if (hasMTKDisplayBrightness.value) {
                    await deviceApi.setMTKDisplayBrightnessToZero()
                }
			},
		});
	};

	onMounted(() => {
        deviceApi.getHasQComDisplayBrightness().then((res) => {
            if (res === 'exists') {
                hasQComDisplayBrightness.value = true
            }
        })
        deviceApi.getHasMTKDisplayBrightness().then((res) => {
            if (res === 'exists') {
                hasMTKDisplayBrightness.value = true
            }
        })
	});

	return {
        hasQComDisplayBrightness,
        open,
        hasMTKDisplayBrightness
	};
}
