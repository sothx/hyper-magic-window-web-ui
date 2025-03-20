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

export function usePointerSpeed() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const loading = ref<boolean>(true);
    const isInit = ref<boolean>(false);

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const currentPointerSpeed = ref<number>(0);


    const changePointerSpeed = async (value: number) => {
        const [setPointerSpeedErr, setPointerSpeedRes] = await $to(
            deviceApi.setPointerSpeed(value)
        );
        if (setPointerSpeedErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            currentPointerSpeed.value = value
        }
    };

    const fetchData = async () => {
        const [, getPointerSpeedRes] = await $to<string, string>(deviceApi.getPointerSpeed());
        if (Number(getPointerSpeedRes)) {
            currentPointerSpeed.value = Number(getPointerSpeedRes);
        }
        isInit.value = true;
		loading.value = false;
    }


    onMounted(() => {
        setTimeout(() => {
            fetchData(); // 确保 UI 先渲染，再执行耗时操作
        },0);
    });

    return {
        changePointerSpeed,
        currentPointerSpeed,
        isInit,
        loading
    };
}
