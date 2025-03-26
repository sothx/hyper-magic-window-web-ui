import { ref, computed, onMounted, reactive, h, renderSlot, type CSSProperties } from 'vue';
import { useDeviceStore } from '@/stores/device'
import * as deviceApi from '@/apis/deviceApi';
import $to from 'await-to-js';
import { type ConfigProviderProps, darkTheme, lightTheme, createDiscreteApi, NSwitch } from 'naive-ui';

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
    const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
        const style: CSSProperties = {};
        if (checked) {
            style.background = '#2080f0';
            if (focused) {
                style.boxShadow = '0 0 0 2px #2080f040';
            }
        } else {
            style.background = '#d03050';
            if (focused) {
                style.boxShadow = '0 0 0 2px #d0305040';
            }
        }
        return style;
    };
    const deviceStore = useDeviceStore();

    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

    const supportHDRTypes = computed(() => {
        if (Array.isArray(deviceStore.displayModeList) && deviceStore.displayModeList.length) {
            return deviceStore.displayModeList[0].supportedHdrTypes
        }

        return []
    })

    const formatDisplayModeList = computed(() => {
        return deviceStore.displayModeList.map(item => ({
            ...item,
            fps: Math.round(item.fps), // 将 fps 转换为整数
            alternativeRefreshRates: item.alternativeRefreshRates.map(rate => Math.round(rate)) // 将 alternativeRefreshRates 转换为整数数组
          }));
    })

    

    const selectDisplayMode = async (data:DisplayModeItem) => {
        const switchRender = () => h(
            NSwitch, // 目标组件
            {
                class: 'mt-2',
                railStyle: railStyle
            },
            {
              checked: () => '开机自启动', // checked 插槽的内容
              unchecked: () => '仅本次生效', // unchecked 插槽的内容
            }
        )
        modal.create({
            title: '想应用该配置吗?',
            type: 'info',
            preset: 'dialog',
            content: () => <div>应用后设备分辨率将配置为{data.width}x{data.height}，刷新率将配置为{data.fps}Hz，在设备下次重启前将一直维持该配置，该功能可能受触控笔和其他第三方模块影响不一定生效，如需恢复系统设置内的默认分辨率及刷新率配置，请手动重启设备。{deviceStore.deviceType === 'tablet' && <span>连接触控笔蓝牙期间，为了确保触控笔正常工作，系统也会强行重置该配置，断开触控笔蓝牙后需要重新配置，</span>}确定要继续应用该配置么？</div>,
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
    })


    return {
        supportHDRTypes,
        formatDisplayModeList,
        setDisplayMode,
        selectDisplayMode
    }


}