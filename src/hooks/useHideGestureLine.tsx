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
export interface KeyboardModeOptions {
    label: string;
    type: string;
    key: 0 | 1 | 2;
}

export type IsHideGestureLine = 0 | 1;

export function useHideGestureLine() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const currentIsHideGestureLine = ref<IsHideGestureLine>(0);


    const changeIsHideGestureLine = async (value: boolean) => {
        const [setHideGestureLineErr, setHideGestureLineRes] = await $to(
            deviceApi.setHideGestureLine(value ? 1 : 0),
        );
        if (setHideGestureLineErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            if (value) {
                const [addIsHideGestureLineErr, addIsHideGestureLineRes] = await $to(
                    deviceApi.addIsHideGestureLine(),
                );
                if (addIsHideGestureLineErr) {
                    modal.create({
                        title: '操作失败',
                        type: 'error',
                        preset: 'dialog',
                        content: () => <p>修改失败，详情请查看日志记录~</p>,
                        negativeText: '确定',
                    });
                } else {
                    modal.create({
                        title: '修改成功',
                        type: 'success',
                        preset: 'dialog',
                        content: () => <p>好耶w！隐藏手势提示线（小白条）成功，请知晓，隐藏手势提示线（小白条）的情况下，旋转建议提示按钮也将变成不可用的状态~</p>,
                        positiveText: '确定',
                    });
                    currentIsHideGestureLine.value = 1;
                }
            } else {
                const [removeIsHideGestureLineErr, removeIsHideGestureLineRes] = await $to(
                    deviceApi.removeIsHideGestureLine(),
                );
                if (removeIsHideGestureLineErr) {
                    modal.create({
                        title: '操作失败',
                        type: 'error',
                        preset: 'dialog',
                        content: () => <p>修改失败，详情请查看日志记录~</p>,
                        negativeText: '确定',
                    });
                } else {
                    modal.create({
                        title: '修改成功',
                        type: 'success',
                        preset: 'dialog',
                        content: () => <p>好耶w！已经将手势提示线（小白条）调整为显示状态~</p>,
                        positiveText: '确定',
                    });
                    currentIsHideGestureLine.value = 0;
                }
            }
        }
    };


    onMounted(async () => {
        const [, getHideGestureLineRes] = await $to<string, string>(deviceApi.getHideGestureLine());
        if (Number(getHideGestureLineRes)) {
            currentIsHideGestureLine.value = 1;
        }
    });

    return {
        currentIsHideGestureLine,
        changeIsHideGestureLine
    };
}
