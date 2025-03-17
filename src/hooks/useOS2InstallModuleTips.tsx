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

export function useOS2InstallModuleTips() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });




    const change = async (value: boolean) => {
        const [negativeRes, positiveRes] = await $to(
            new Promise((resolve, reject) => {
                modal.create({
                    title: value ? '想禁用模块使用须知吗？' : '想开启模块使用须知吗？',
                    type: 'info',
                    preset: 'dialog',
                    content: () => (
                        <div>
                            {!value && (
                                <p>
                                    开启{' '}
                                    <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                        模块使用须知
                                    </span>{' '}
                                    后，模块每次安装过程会带使用须知的{' '}
                                    <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                        强提醒
                                    </span>{' '}，需要设备重启才会生效，确定要继续开启并重启吗？
                                </p>
                            )}
                            {value && (
                                <p>
                                    禁用{' '}
                                    <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                        模块使用须知
                                    </span>{' '}
                                    后，模块每次安装过程将会{' '}
                                    <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                        静默安装
                                    </span>{' '}，需要设备重启才会生效，确定要继续禁用并重启吗？
                                </p>
                            )}
                        </div>
                    ),
                    positiveText: '确定，并立即重启',
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
            const [removeDisabledOS2InstallModuleTipsErr] = await $to(deviceApi.removeDisabledOS2InstallModuleTips());
            if (removeDisabledOS2InstallModuleTipsErr) {
                modal.create({
                    title: '操作失败',
                    type: 'error',
                    preset: 'dialog',
                    content: () => <p>无法修改模块使用须知，详情请查看日志记录~</p>,
                    negativeText: '确定',
                });
                return;
            }
            if (value) {
                const [addDisabledOS2InstallModuleTipsErr] = await $to(deviceApi.addDisabledOS2InstallModuleTips());
                if (addDisabledOS2InstallModuleTipsErr) {
                    modal.create({
                        title: '操作失败',
                        type: 'error',
                        preset: 'dialog',
                        content: () => <p>无法修改模块使用须知，详情请查看日志记录~</p>,
                        negativeText: '确定',
                    });
                    return;
                }
                deviceStore.isDisabledOS2InstallModuleTips = true;
            } else {
                deviceStore.isDisabledOS2InstallModuleTips = false;
            }
            const [rebootDeviceErr] = await $to(deviceApi.rebootDevice());
            if (rebootDeviceErr) {
                modal.create({
                    title: '操作失败',
                    type: 'error',
                    preset: 'dialog',
                    content: () => <p>无法重启设备，详情请查看日志记录~</p>,
                    negativeText: '确定',
                });
                return;
            }
        }
    };

    onMounted(async () => {
    });

    return {
        change
    };
}
