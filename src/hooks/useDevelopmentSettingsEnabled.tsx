import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import {
    createDiscreteApi,
    darkTheme,
    lightTheme,
    type ConfigProviderProps,
} from 'naive-ui';
import * as deviceApi from '@/apis/deviceApi';

export function useDevelopmentSettingsEnabled() {
    const deviceStore = useDeviceStore();
    const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
        theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
    }));

    const { message, modal } = createDiscreteApi(['message', 'modal'], {
        configProviderProps: configProviderPropsRef,
    });

    const isEnabled = ref<boolean>(false);




    const change = async (value: 1 | 0) => {
        const [putDevelopmentSettingsEnabledErr, putDevelopmentSettingsEnabledRes] = await $to(
            deviceApi.putDevelopmentSettingsEnabled(value)
        );
        if (putDevelopmentSettingsEnabledErr) {
            modal.create({
                title: '操作失败',
                type: 'error',
                preset: 'dialog',
                content: () => <p>修改失败，详情请查看日志记录~</p>,
                negativeText: '确定',
            });
        } else {
            isEnabled.value =  value === 1 ? true : false
        }
    };


    onMounted(async () => {
        const [, getDevelopmentSettingsEnabledRes] = await $to<string, string>(deviceApi.getDevelopmentSettingsEnabled());
        if (getDevelopmentSettingsEnabledRes === 'true') {
            isEnabled.value = true
        } else {
            isEnabled.value = false
        }
    });

    return {
        change,
        isEnabled
    };
}
