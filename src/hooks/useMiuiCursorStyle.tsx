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

export type miuiCursorStyleType = 3 | 1 | 0;

export function useMiuiCursorStyle() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const currentMiuiCursorStyleType = ref<miuiCursorStyleType>(3);


    const changeMiuiCursorStyleType = async (value: miuiCursorStyleType) => {
        const [setMiuiCursorStyleTypeErr, setMiuiCursorStyleTypeRes] = await $to(
            deviceApi.setMiuiCursorStyleType(value),
        );
        if (setMiuiCursorStyleTypeErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            currentMiuiCursorStyleType.value = value;
        }
    };


    onMounted(async () => {
        const [, getMiuiCursorStyleTypeRes] = await $to<string, string>(deviceApi.getMiuiCursorStyleType());
        if (getMiuiCursorStyleTypeRes && Number(getMiuiCursorStyleTypeRes)) {
            currentMiuiCursorStyleType.value = Number(getMiuiCursorStyleTypeRes) as miuiCursorStyleType;
        }
    });

    return {
        currentMiuiCursorStyleType,
        changeMiuiCursorStyleType
    };
}
