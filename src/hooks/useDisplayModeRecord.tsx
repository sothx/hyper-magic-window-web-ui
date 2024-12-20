import { ref, computed, onMounted, reactive } from 'vue';
import { useDeviceStore } from '@/stores/device'
import * as deviceApi from '@/apis/deviceApi';
import $to from 'await-to-js';
import { type ConfigProviderProps, darkTheme, lightTheme, createDiscreteApi } from 'naive-ui';

export interface DisplayModeItem {
    id: number,
    width: number,
    height: number,
    fps: number,
    alternativeRefreshRates: number[],
    supportedHdrTypes: number[]
}

export function useDisplayModeRecord() {
    const deviceStore = useDeviceStore();

    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

    const displayModeList = ref<DisplayModeItem[]>([])

    const formatDisplayModeList = computed(() => {
        return displayModeList.value.map(item => ({
            ...item,
            fps: Math.round(item.fps), // 将 fps 转换为整数
            alternativeRefreshRates: item.alternativeRefreshRates.map(rate => Math.round(rate)) // 将 alternativeRefreshRates 转换为整数数组
          }));
    })

    const setDisplayMode = async (displayModeID: number) => {
        const [setDisplayModeErr,setDisplayModeRes] = await $to(deviceApi.setDisplayMode(displayModeID))
        if (setDisplayModeErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        }
        if (setDisplayModeRes) {
            modal.create({
                title: '操作成功',
                type: 'success',
                preset: 'dialog',
                content: () => <p>已成功应用该分辨率及刷新率配置，在设备下次重启前将一直维持该配置，如需恢复系统设置内的默认分辨率及刷新率配置，请手动重启设备。</p>,
                negativeText: '确定',
            });
        }
    }



    onMounted(async () => {
        const [getDiplayModeListErr,getDiplayModeListRes] = await $to(deviceApi.getDisplayModeRecord())
        if (getDiplayModeListErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        }
        if (getDiplayModeListRes) {
            displayModeList.value = getDiplayModeListRes;
        }
    })


    return {
        displayModeList,
        formatDisplayModeList,
        setDisplayMode
    }


}