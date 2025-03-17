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

export type miuiCursorStyleType = 3 | 1 | 0;

export type miuiAutoStartCursorStyleType = 3 | 1 | 0 | undefined;

export function useMiuiCursorStyle() {
	const deviceStore = useDeviceStore();
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const currentMiuiCursorStyleType = ref<miuiCursorStyleType>(3);

    const currentAutoStartMiuiCursorStyleType = ref<miuiAutoStartCursorStyleType>();

	const changeMiuiCursorStyleType = async (value: miuiCursorStyleType) => {
		const [setMiuiCursorStyleTypeErr, setMiuiCursorStyleTypeRes] = await $to(
			deviceApi.setMiuiCursorStyleType(value),
		);
		if (setMiuiCursorStyleTypeErr) {
			modal.create({
				title: '操作失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>修改失败，详情请查看日志记录~</p>,
				negativeText: '确定',
			});
		} else {
			currentMiuiCursorStyleType.value = value;
		}
	};

	const changeAutoStartMiuiCursorStyleType = async (type: boolean) => {
        if (type) {
            const [removeMiuiCursorStyleTypeErr, removeMiuiCursorStyleTypeRes] = await $to(
                deviceApi.removeAutoStartMiuiCursorStyleType(),
            );
            if (removeMiuiCursorStyleTypeErr) {
                modal.create({
                    title: '操作失败',
                    type: 'error',
                    preset: 'dialog',
                    content: () => <p>修改失败，详情请查看日志记录~</p>,
                    negativeText: '确定',
                });
                return;
            } else {
                const [addMiuiCursorStyleTypeErr, addMiuiCursorStyleTypeRes] = await $to(
                    deviceApi.addAutoStartMiuiCursorStyleType(currentMiuiCursorStyleType.value),
                );
                if (addMiuiCursorStyleTypeErr) {
                    modal.create({
                        title: '操作失败',
                        type: 'error',
                        preset: 'dialog',
                        content: () => <p>修改失败，详情请查看日志记录~</p>,
                        negativeText: '确定',
                    });
                } else {
                    modal.create({
                        title: '添加自启动成功',
                        type: 'success',
                        preset: 'dialog',
                        content: () => <p>添加「鼠标光标样式」开机自启动配置成功，后续请通过模块 Web UI 修改「鼠标光标样式」，系统设置内的修改会在重启后失效~</p>,
                        positiveText: '确定',
                    });
                    currentAutoStartMiuiCursorStyleType.value = currentMiuiCursorStyleType.value
                }
            }
        } else {
            const [removeMiuiCursorStyleTypeErr, removeMiuiCursorStyleTypeRes] = await $to(
                deviceApi.removeAutoStartMiuiCursorStyleType(),
            );
            if (removeMiuiCursorStyleTypeErr) {
                modal.create({
                    title: '操作失败',
                    type: 'error',
                    preset: 'dialog',
                    content: () => <p>修改失败，详情请查看日志记录~</p>,
                    negativeText: '确定',
                });
            } else {
                modal.create({
                    title: '取消自启动成功',
                    type: 'success',
                    preset: 'dialog',
                    content: () => <p>取消「鼠标光标样式」开机自启动配置成功~</p>,
                    positiveText: '确定',
                });
                currentAutoStartMiuiCursorStyleType.value = undefined
            }
        }
	};

    const fetchData = async () => {
        const [, getMiuiCursorStyleTypeRes] = await $to<string, string>(deviceApi.getMiuiCursorStyleType());
		if (getMiuiCursorStyleTypeRes && Number(getMiuiCursorStyleTypeRes)) {
			currentMiuiCursorStyleType.value = Number(getMiuiCursorStyleTypeRes) as miuiCursorStyleType;
		}
        const [, getAutoStartMiuiCursorStyleTypeRes] = await $to<string, string>(deviceApi.getAutoStartMiuiCursorStyleType());
		if (getAutoStartMiuiCursorStyleTypeRes && Number(getAutoStartMiuiCursorStyleTypeRes)) {
			currentAutoStartMiuiCursorStyleType.value = Number(getAutoStartMiuiCursorStyleTypeRes) as miuiAutoStartCursorStyleType;
		}
    }

	onMounted(async () => {
        nextTick(() => {
            fetchData(); // 确保 UI 先渲染，再执行耗时操作
        });
	});

	return {
		currentMiuiCursorStyleType,
		changeMiuiCursorStyleType,
        currentAutoStartMiuiCursorStyleType,
        changeAutoStartMiuiCursorStyleType,
	};
}
