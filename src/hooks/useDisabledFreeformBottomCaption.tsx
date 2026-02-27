import { ref, computed, onMounted, nextTick, h } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import { RenderJsx } from '@/components/RenderJSX';
import {
    NButton,
    createDiscreteApi,
    darkTheme,
    lightTheme,
    type ButtonProps,
    type ConfigProviderProps,
    type DataTableColumns,
    type NInput,
} from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';
export function useDisabledFreeformBottomCaption() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const isEnable = ref<boolean>(false);

    const isSupport = ref<boolean>(false);

    const loading = ref<boolean>(true);

    const isInit = ref<boolean>(false);

    const changeEnableMode = async (mode: boolean) => {
        const [negativeRes, positiveRes] = await $to(
            new Promise((resolve, reject) => {
                modal.create({
                    title: `想${mode ? '禁用' : '恢复'}小窗手势提示条（小白条）吗？`,
                    type: 'info',
                    preset: 'dialog',
                    content: () => (
                        <div>
                            {
                                <div>
                                    {mode ? '禁用' : '恢复'}{' '}
                                    <span
                                        class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                        小窗手势提示条（小白条）
                                    </span>{' '}
                                    后，
                                    {mode
                                        ? '所有小窗将不再显示手势提示条（小白条）~'
                                        : '将恢复系统默认的所有小窗应用显示手势提示条（小白条）~'}
                                        <p>
                                            实际生效还需要重启{' '}
                                            <span
                                                class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                                系统界面
                                            </span>{' '}，确定要继续吗？
                                        </p>
                                </div>
                            }
                        </div>
                    ),
                    positiveText: `确定${mode ? '禁用' : '恢复'}小窗手势提示条（小白条）`,
                    negativeText: '我再想想',
                    onPositiveClick: () => {
                        resolve('positiveClick');
                    },
                    onNegativeClick: () => {
                        reject('negativeClick');
                    },
                });
            }),
        );
        if (positiveRes) {
            deviceApi
                .putIsDisableFreeformBottomCaption(mode ? 1 : 0)
                .then(res => {
                    isEnable.value = mode;
                    modal.create({
                        title: '操作成功',
                        type: 'success',
                        preset: 'dialog',
                        content: () => (
                            <p>
                                好耶w，已经成功{mode ? '禁用' : '恢复'}小窗手势提示条（小白条）~实际生效还需要重启{' '}
                                <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                    系统界面
                                </span>{' '}，确定要继续吗？
                            </p>
                        ),
                        positiveText: '确定重启作用域',
                        negativeText: '稍后手动重启',
                        onPositiveClick() {
                            deviceApi
                                .killAndroidSystemUI()
                                .then(async res => {
                                    modal.create({
                                        title: '重启作用域成功',
                                        type: 'success',
                                        preset: 'dialog',
                                        content: () => <p>已经成功为你重启对应的作用域，请查看是否生效~</p>,
                                    });
                                })
                                .catch(err => {
                                    modal.create({
                                        title: '重启作用域失败',
                                        type: 'error',
                                        preset: 'dialog',
                                        content: () => (
                                            <p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>
                                        ),
                                    });
                                });
                        },
                    });
                })
                .catch(err => {
                    modal.create({
                        title: '操作失败',
                        type: 'error',
                        preset: 'dialog',
                        content: () => <p>修改失败，详情请查看日志记录~</p>,
                        positiveText: '确定',
                    });
                });
        }
    };

    const fetchData = async () => {
        const [, getIsSupportDisableFreeformBottomCaptionRes] = await $to<string, string>(
            deviceApi.getIsSupportDisableFreeformBottomCaption(),
        );
        if (
            getIsSupportDisableFreeformBottomCaptionRes &&
            getIsSupportDisableFreeformBottomCaptionRes === 'true'
        ) {
            isSupport.value = true;
        } else {
            isSupport.value = false;
        }

        if (isSupport.value) {
            const [, getIsDisableFreeformBottomCaptionRes] = await $to<string, string>(
                deviceApi.getIsDisableFreeformBottomCaption(),
            );
            if (
                getIsDisableFreeformBottomCaptionRes &&
                Number(getIsDisableFreeformBottomCaptionRes) === 1
            ) {
                isEnable.value = true;
            } else {
                isEnable.value = false;
            }
        }
        isInit.value = true;
        loading.value = false;
    };

    onMounted(() => {
        setTimeout(() => {
            fetchData(); // 确保 UI 先渲染，再执行耗时操作
        }, 0);
    });

    return {
        isEnable,
        changeEnableMode,
        isInit,
        loading,
        isSupport
    };
}
