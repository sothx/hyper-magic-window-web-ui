import { ref, computed, onMounted } from 'vue';
import $to from 'await-to-js';
import { useDeviceStore } from '@/stores/device'
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
import { useLogsStore } from '@/stores/logs';

export function useMIUIContentExtension() {

    const deviceStore = useDeviceStore();

    const logsStore = useLogsStore();

    const isInstallMIUIContentExtension =  ref<boolean>(false);

        const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
            theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
        }));
    
        const { message, modal } = createDiscreteApi(['message', 'modal'], {
            configProviderProps: configProviderPropsRef,
        });

    const open = async () => {
        if (!isInstallMIUIContentExtension.value) {
            await navigator.clipboard.writeText(`https://caiyun.139.com/m/i?135CdxVMTx4nf`);
            modal.create({
                title: '无法打开传送门',
                type: 'error',
                preset: 'dialog',
                content: () => (
                    <div>
                        <p>未检测到系统存在传送门，请先通过模块修补传送门再进入~</p>
                        <p>已经复制模块下载链接到剪切板了，请务必选择固化并修复传送门~</p>
                        <p>下载链接:https://caiyun.139.com/m/i?135CdxVMTx4nf</p>
                    </div>
                ),
                negativeText: '确定',
            });
            return;
        }
        modal.create({
            title: '确认打开传送门吗？',
            type: 'info',
            preset: 'dialog',
            content: () => (
                <div>
                    <p>
                        即将打开{' '}
                        <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                            传送门
                        </span>{' '}
                        管理界面，确定要继续吗？
                    </p>
                </div>
            ),
            positiveText: '确定打开',
            negativeText: '我再想想',
            onPositiveClick: async () => {
                deviceApi.openMIUIContentExtension().then(
                    res => {
                        modal.create({
                            title: '已开启',
                            type: 'success',
                            preset: 'dialog',
                            content: () => (
                                <div>
                                    <p>好耶OwO~</p>
                                    <p>
                                        已经成功开启{' '}
                                        <span
                                            class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                                            传送门
                                        </span>{' '}
                                        的管理界面了~
                                    </p>
                                </div>
                            ),
                            positiveText: '确定',
                        });
                    },
                    err => {
                        modal.create({
                            title: '无法打开传送门',
                            type: 'error',
                            preset: 'dialog',
                            content: () => <p>出现异常，无法正常打开传送门QwQ，详细问题可浏览日志记录~</p>,
                            negativeText: '确定',
                        });
                    },
                );
            },
        });
    }

    const fix = async () => {
        console.log('进来了修复')
        const [deleteErr,deleteRes] = await $to<string,string>(deviceApi.deleteMIUIContentExtensionSettings())
        if (deleteErr) {
            logsStore.error('修复传送门失败',deleteErr)
            console.log('进来了修复失败',deleteErr)
            return;
        }
        console.log('进来了修复成功',deleteRes)
        logsStore.success('修复传送门成功',deleteRes)
        modal.create({
            title: '更新设置成功',
            type: 'success',
            preset: 'dialog',
            content: () => (
                <p>
                    好耶w，已经成功修复传送门~实际生效还需要重启{' '}
                    <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                        平板/手机管家
                    </span>{' '}
                    的作用域，确定要继续吗？
                </p>
            ),
            positiveText: '确定重启作用域',
            negativeText: '稍后手动重启',
            onPositiveClick() {
                deviceApi
                    .killGameBoosterApp('com.miui.contentextension')
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
    }


    onMounted(() => {
        deviceApi.getHasInstalledMIUIContentExtension().then((res) => {
            if (res === 'exists') {
                isInstallMIUIContentExtension.value = true
            }
        })
    })


    return {
        open,
        fix,
        isInstallMIUIContentExtension
    }


}