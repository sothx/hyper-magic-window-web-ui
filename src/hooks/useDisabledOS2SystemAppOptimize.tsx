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

    const status = ref<boolean>(false);


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
                negativeText: '确定',
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
                    negativeText: '确定',
                });
                return;
            }
        }
        status.value = value;
    };


    onMounted(async () => {
        if (deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35) {
            const [getIsDisabledOS2SystemAppOptimizeErr, getIsDisabledOS2SystemAppOptimizeRes] = await $to<string, string>(deviceApi.getIsDisabledOS2SystemAppOptimize());
            if (getIsDisabledOS2SystemAppOptimizeErr) {
                status.value = false;
            } else {
                if (getIsDisabledOS2SystemAppOptimizeRes === 'true') {
                    status.value = true;
                } else {
                    status.value = false;
                }
                console.log(getIsDisabledOS2SystemAppOptimizeRes,status.value,'getIsDisabledOS2SystemAppOptimizeRes')
            }
        }
    });

    return {
        status,
        change: changeDisabledOS2SystemAppOptimize
    };
}
