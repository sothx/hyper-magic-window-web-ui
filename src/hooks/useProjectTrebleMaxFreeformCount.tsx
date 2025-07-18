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

export function useProjectTrebleMaxFreeformCount() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const isInit = ref<boolean>(false);

    const isLoading = ref<boolean>(false);

    const isEditDefaultDesktopModeMaxFreeformMaxCount = ref<boolean>(false);

    const isEditMiuiDesktopModeMaxFreeformMaxCount = ref<boolean>(false);

    const currentDefaultDesktopModeMaxFreeformMaxCount = ref<number>(2);

    const currentMiuiDesktopModeMaxFreeformMaxCount = ref<number>(4);

    const isSupportDefaultDesktopModeMaxFreeformMaxCount = ref<boolean>(false);

    const isSupportMiuiDesktopModeMaxFreeformMaxCount = ref<boolean>(false);

    type DesktopModeType  = 'DefaultDesktopMode' | 'MiuiDesktopMode'

    const changeMaxFreeformCount = async (type:DesktopModeType,countNum: number) => {
        const [putCurrenMaxFreeformMaxCountResErr, putCurrenMaxFreeformMaxCountRes] = await $to(
            type === 'DefaultDesktopMode' ? deviceApi.putCurrentDefaultDesktopMaxFreeformMaxCount(countNum) : deviceApi.putCurrentMiuiDesktopMaxFreeformMaxCount(countNum)
        );
        if (putCurrenMaxFreeformMaxCountResErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            if (type === 'DefaultDesktopMode') {
                currentDefaultDesktopModeMaxFreeformMaxCount.value = countNum;
                isEditDefaultDesktopModeMaxFreeformMaxCount.value = false;
            } else {
                currentMiuiDesktopModeMaxFreeformMaxCount.value = countNum;
                isEditMiuiDesktopModeMaxFreeformMaxCount.value = false;
            }
            modal.create({
                title: '操作成功',
                type: 'success',
                preset: 'dialog',
                content: () => (
                    <p>
                        好耶w，已经成功修改{ type === 'DefaultDesktopMode' ? '默认桌面' : '工作台模式' }下的最大小窗数量~实际生效还需要重启系统界面作用域，确定要继续吗？
                    </p>
                ),
                positiveText: '立即重启作用域',
                negativeText: '稍后手动重启',
                onPositiveClick() {
                    deviceApi
                        .killAndroidSystemUI()
                        .then(() => {
                            modal.create({
                                title: '重启系统界面成功',
                                type: 'success',
                                preset: 'dialog',
                                content: () => <p>已经成功为你重启系统界面的作用域，请查看是否生效~</p>,
                            });
                        })
                        .catch(err => {
                            modal.create({
                                title: '重启系统界面失败',
                                type: 'error',
                                preset: 'dialog',
                                content: () => <p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>,
                                negativeText: '确定',
                            });
                            return;
                        });
                },
            });
        }
    };


    const fetchData = async () => {
        isLoading.value = true;
        const [,getIsSupportMiuiDesktopMaxFreeformMaxNumRes] = await $to(
                deviceApi.getIsSupportMiuiDesktopMaxFreeformMaxNum(),
        );
        if (getIsSupportMiuiDesktopMaxFreeformMaxNumRes === 'true') {
            isSupportMiuiDesktopModeMaxFreeformMaxCount.value = true;
        }
        const [,getIsSupportDefaultDesktopMaxFreeformMaxNumRes] = await $to(
                deviceApi.getIsSupportDefaultDesktopMaxFreeformMaxNum(),
        );
        if (getIsSupportDefaultDesktopMaxFreeformMaxNumRes === 'true') {
            isSupportDefaultDesktopModeMaxFreeformMaxCount.value = true;
        }

        if (isSupportMiuiDesktopModeMaxFreeformMaxCount.value) {
            const [, getCurrentMiuiDesktopMaxFreeformMaxCountRes] = await $to(deviceApi.getCurrentMiuiDesktopMaxFreeformMaxCount());
            if (Number(getCurrentMiuiDesktopMaxFreeformMaxCountRes) && Number(getCurrentMiuiDesktopMaxFreeformMaxCountRes) >= 4) {
                currentMiuiDesktopModeMaxFreeformMaxCount.value = Number(getCurrentMiuiDesktopMaxFreeformMaxCountRes);
            } else {
                currentMiuiDesktopModeMaxFreeformMaxCount.value = 4;
            }
        }

        if (isSupportDefaultDesktopModeMaxFreeformMaxCount.value) {
            const [, getCurrentDefaultDesktopMaxFreeformMaxCountRes] = await $to(deviceApi.getCurrentDefaultDesktopMaxFreeformMaxCount());
            if (Number(getCurrentDefaultDesktopMaxFreeformMaxCountRes) && Number(getCurrentDefaultDesktopMaxFreeformMaxCountRes) >= 2) {
                currentDefaultDesktopModeMaxFreeformMaxCount.value = Number(getCurrentDefaultDesktopMaxFreeformMaxCountRes);
            } else {
                currentDefaultDesktopModeMaxFreeformMaxCount.value = 2;
            }
        }
        isLoading.value = false;
        isInit.value = true;
    };

    onMounted(() => {
        setTimeout(() => {
            fetchData(); // 确保 UI 先渲染，再执行耗时操作
        }, 0);
    });

    return {
        isEditDefaultDesktopModeMaxFreeformMaxCount,
        isEditMiuiDesktopModeMaxFreeformMaxCount,
        currentDefaultDesktopModeMaxFreeformMaxCount,
        currentMiuiDesktopModeMaxFreeformMaxCount,
        isSupportDefaultDesktopModeMaxFreeformMaxCount,
        isSupportMiuiDesktopModeMaxFreeformMaxCount,
        changeMaxFreeformCount,
        isInit,
        isLoading,
    };
}
