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
    vsync?: number,
    synthetic?: boolean,
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

    const selectDisplayMode = async (data:DisplayModeItem) => {
        modal.create({
            title: '想应用该配置吗?',
            type: 'info',
            preset: 'dialog',
            content: () => <p>应用后设备分辨率将配置为{data.width}x{data.height}，刷新率将配置为{data.fps}Hz，在设备下次重启前将一直维持该配置，该功能可能受触控笔和其他第三方模块影响不一定生效，如需恢复系统设置内的默认分辨率及刷新率配置，请手动重启设备。{deviceStore.deviceCharacteristics === 'tablet' && <span>连接触控笔蓝牙期间，为了确保触控笔正常工作，系统也会强行重置该配置，断开触控笔蓝牙后需要重新配置，</span>}确定要继续应用该配置么？</p>,
            negativeText: '取消',
            positiveText: '确定',
            onPositiveClick() {
                setDisplayMode(data.id - 1);
            }
        });
    }

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
        setDisplayMode,
        selectDisplayMode
    }


}