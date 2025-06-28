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

export function useVideoWallpaperLoop() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const change = async () => {
        const [setHomeVideoWallpaperLoopErr,setHomeVideoWallpaperLoopRes] = await $to<string,string>(deviceApi.setHomeVideoWallpaperLoop())
        if (setHomeVideoWallpaperLoopErr) {
            modal.create({
                title: '设置桌面壁纸循环播放失败',
                type: 'error',
                preset: 'dialog',
                content: () => (
                    <p>发生异常错误，设置动态壁纸循环播放失败QwQ，详细错误请查看日志~</p>
                ),
            });
            return;
        }
        const [setLockVideoWallpaperLoopErr,setLockVideoWallpaperLoopRes] = await $to<string,string>(deviceApi.setLockVideoWallpaperLoop())
        if (setLockVideoWallpaperLoopErr) {
            modal.create({
                title: '设置锁屏壁纸循环播放失败',
                type: 'error',
                preset: 'dialog',
                content: () => (
                    <p>发生异常错误，设置动态壁纸循环播放失败QwQ，详细错误请查看日志~</p>
                ),
            });
            return;
        }
        modal.create({
            title: '设置循环播放成功',
            type: 'success',
            preset: 'dialog',
            content: () => (
                <p>
                    好耶w，已经成功动态壁纸循环播放~实际生效还需要重启{' '}
                    <span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
                        壁纸
                    </span>{' '}
                    的作用域，确定要继续吗？
                </p>
            ),
            positiveText: '确定重启作用域',
            negativeText: '稍后手动重启',
            onPositiveClick() {
                deviceApi
                    .killMiWallpaper()
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
                                <p>发生异常错误，重启壁纸作用域失败QwQ，详细错误请查看日志~</p>
                            ),
                        });
                    });
            },
        });
    }

    return {
        change
    };
}
