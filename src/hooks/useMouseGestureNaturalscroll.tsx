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

export type IsInvisibleMode = 0 | 1;

export function useMouseGestureNaturalscroll() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const currentMouseGestureNaturalscroll = ref<IsInvisibleMode>(0);


    const changeMouseGestureNaturalscroll = async (value: boolean) => {
        const [setMouseGestureNaturalscrollErr, setMouseGestureNaturalscrollRes] = await $to(
            deviceApi.setMouseGestureNaturalscroll(value ? 1 : 0),
        );
        if (setMouseGestureNaturalscrollErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            currentMouseGestureNaturalscroll.value = value ? 1 : 0;
        }
    };


    onMounted(async () => {
        const [, getMouseGestureNaturalscrollRes] = await $to<string, string>(deviceApi.getMouseGestureNaturalscroll());
        if (Number(getMouseGestureNaturalscrollRes)) {
            currentMouseGestureNaturalscroll.value = 1;
        }
    });

    return {
        currentMouseGestureNaturalscroll,
        changeMouseGestureNaturalscroll
    };
}
