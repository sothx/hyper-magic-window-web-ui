import { ref, computed, onMounted, nextTick } from 'vue';
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

export type IsInvisibleMode = 0 | 1;

export function useInVisibleMode() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const currentIsInVisibleMode = ref<IsInvisibleMode>(0);


    const changeIsInvisibleMode = async (value: boolean) => {
        const [setInVisibleModeErr, setInVisibleModeRes] = await $to(
            deviceApi.setInVisibleMode(value ? 1 : 0),
        );
        if (setInVisibleModeErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            currentIsInVisibleMode.value = value ? 1 : 0;
        }
    };

    const fetchData = async () => {
        const [, getInVisibleModeRes] = await $to<string, string>(deviceApi.getInVisibleMode());
        if (Number(getInVisibleModeRes)) {
            currentIsInVisibleMode.value = 1;
        }
    }


    onMounted(() => {
        nextTick(() => {
            fetchData(); // 确保 UI 先渲染，再执行耗时操作
        });
    });

    return {
        currentIsInVisibleMode,
        changeIsInvisibleMode
    };
}
