import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import $to from 'await-to-js';
import { divide } from 'lodash-es';

export function useFbo() {
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const deviceStore = useDeviceStore();
	const isSupportGameMode = computed(() => {
		return deviceStore.miuiCompatEnable && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk > 31;
	});

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const fboStartCount = ref<number>();

	const fboEnable = ref<boolean>(false);

	const fboServiceCtrl = ref<boolean>(false);

	const fboInstalld = ref<string>('');

	const isAutoStartFbo = ref<boolean>(false);

    const handleEnableFbo = async () => {
        if (fboEnable.value) {
            modal.create({
                title: '启用状态说明',
                type: 'success',
                preset: 'dialog',
                content: () => <p>当前焕新存储已经是启用状态~</p>,
                negativeText: '确定',
            });
            return;
        }
        const [setFboEnableErr,setFboEnableRes] = await $to(
            deviceApi.setFboEnable()
        )
        if (setFboEnableRes) {
            const [setFboEnableErr,setFboEnableRes] = await $to(
                deviceApi.setFboEnable()
            )
            if (setFboEnableErr) {
                modal.create({
                    title: '操作失败',
                    type: 'error',
                    preset: 'dialog',
                    content: () => <p>修改失败，详情请查看日志记录~</p>,
                    negativeText: '确定',
                });
            } else {
                fboEnable.value = true;
                reload()
            }
        }
    }

    const handleEnableFboServiceCtrl = async () => {
        if (fboServiceCtrl.value) {
            modal.create({
                title: '激活状态说明',
                type: 'success',
                preset: 'dialog',
                content: () => <p>当前焕新存储已经是激活状态~</p>,
                negativeText: '确定',
            });
            return;
        }
        const [setFboServiceCtrlErr,setFboServiceCtrlRes] = await $to(
            deviceApi.setFboServiceCtrl()
        )
        if (setFboServiceCtrlErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            modal.create({
                title: '操作成功',
                type: 'success',
                preset: 'dialog',
                content: () => <p>已激活焕新存储，激活后仍然需要满足条件才会在特定时间触发焕新存储~</p>,
                positiveText: '确定',
            });
            fboServiceCtrl.value = true;
            const [fboInstalldErr,fboInstalldRes] = await $to(deviceApi.getFboInstalld());
            if (fboInstalldRes) {
                fboInstalld.value = fboInstalldRes
            } else {
                fboInstalld.value = ''
            }
        }
    }

    const changeIsAutoEnableFboRes = async (status: boolean) => {
                if (status) {
                    const [removeIsAutoEnableFboErr, removeIsAutoEnableFboRes] = await $to(
                        deviceApi.removeIsAutoEnableFbo(),
                    );
                    if (removeIsAutoEnableFboErr) {
                        modal.create({
                            title: '操作失败',
                            type: 'error',
                            preset: 'dialog',
                            content: () => <p>修改失败，详情请查看日志记录~</p>,
                            negativeText: '确定',
                        });
                        return;
                    } else {
                        const [addIsAutoEnableFboErr, addIsAutoEnableFboRes] = await $to(
                            deviceApi.addIsAutoEnableFbo()
                        );
                        if (addIsAutoEnableFboErr) {
                            modal.create({
                                title: '操作失败',
                                type: 'error',
                                preset: 'dialog',
                                content: () => <p>修改失败，详情请查看日志记录~</p>,
                                negativeText: '确定',
                            });
                        } else {
                            modal.create({
                                title: '操作成功',
                                type: 'success',
                                preset: 'dialog',
                                content: () => <p>已强制启用焕新存储，但该功能受系统底层支持情况而异，不支持的设备即使启用也不会生效~</p>,
                                positiveText: '确定',
                            });
                            const [setFboEnableErr,setFboEnableRes] = await $to(
                                deviceApi.setFboEnable()
                            )
                            if (setFboEnableErr) {
                                modal.create({
                                    title: '操作失败',
                                    type: 'error',
                                    preset: 'dialog',
                                    content: () => <p>修改失败，详情请查看日志记录~</p>,
                                    negativeText: '确定',
                                });
                            } else {
                                isAutoStartFbo.value = true;
                            }
                        }
                    }
                } else {
                    const [removeIsAutoEnableFboErr, removeIsAutoEnableFboRes] = await $to(
                        deviceApi.removeIsAutoEnableFbo(),
                    );
                    if (removeIsAutoEnableFboErr) {
                        modal.create({
                            title: '操作失败',
                            type: 'error',
                            preset: 'dialog',
                            content: () => <p>修改失败，详情请查看日志记录~</p>,
                            negativeText: '确定',
                        });
                    } else {
                        modal.create({
                            title: '操作成功',
                            type: 'success',
                            preset: 'dialog',
                            content: () => <p>已将焕新存储启用状态恢复为系统默认行为~</p>,
                            positiveText: '确定',
                        });
                        isAutoStartFbo.value = false;
                    }
                }
    }

	const reload = async () => {
		const [, getIsAutoEnableFboRes] = await $to<string, string>(
			deviceApi.getIsAutoEnableFbo(),
		);
		if (getIsAutoEnableFboRes === 'true') {
            isAutoStartFbo.value = true;
		} else {
            isAutoStartFbo.value = false;
        }
		const [fboEnableErr, fboEnableRes] = await $to(deviceApi.getFboEnable());
		if (fboEnableRes === 'true') {
			fboEnable.value = true;
		} else {
			fboEnable.value = false;
		}

		const [fFboServiceCtrlErr, fboServiceCtrlRes] = await $to(deviceApi.getFboServiceCtrl());
		if (fboServiceCtrlRes === 'true') {
			fboServiceCtrl.value = true;
		} else {
			fboServiceCtrl.value = false;
		}

        const [fboInstalldErr,fboInstalldRes] = await $to(deviceApi.getFboInstalld());
        if (fboInstalldRes) {
            fboInstalld.value = fboInstalldRes
        } else {
            fboInstalld.value = ''
        }
	};

	onMounted(() => {
		reload();
	});

	return {
		fboEnable,
		fboServiceCtrl,
        changeIsAutoEnableFboRes,
        isAutoStartFbo,
        fboInstalld,
        handleEnableFbo,
        handleEnableFboServiceCtrl,
        reload
	};
}
