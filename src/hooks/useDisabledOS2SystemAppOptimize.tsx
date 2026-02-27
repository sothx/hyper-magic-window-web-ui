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

export function useDisabledOS2SystemAppOptimize() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const changeDisabledOS2SystemAppOptimize = async (value: boolean) => {
        const [removeIsDisabledOS2SystemAppOptimizeErr, removeIsDisabledOS2SystemAppOptimizeRes] = await $to(
            deviceApi.removeIsDisabledOS2SystemAppOptimize(),
        );
        if (removeIsDisabledOS2SystemAppOptimizeErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                positiveText: '确定',
            });
            return;
        }
        if (value) {
            const [addIsDisabledOS2SystemAppOptimizeErr, addIsDisabledOS2SystemAppOptimizeRes] = await $to(
                deviceApi.addIsDisabledOS2SystemAppOptimize(),
            );
            if (addIsDisabledOS2SystemAppOptimizeErr) {
                modal.create({
                    title: '操作失败',
                    type: 'error',
                    preset: 'dialog',
                    content: () => <p>修改失败，详情请查看日志记录~</p>,
                    positiveText: '确定',
                });
                return;
            }
        }
        deviceStore.isDisabledOS2SystemAppOptimize = value;
    };


    onMounted(() => {
    });

    return {
        change: changeDisabledOS2SystemAppOptimize
    };
}
