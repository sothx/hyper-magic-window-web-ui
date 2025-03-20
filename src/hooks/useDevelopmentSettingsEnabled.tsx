import { ref, computed, onMounted, nextTick } from 'vue';
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

    const loading = ref<boolean>(true);

    const isInit = ref<boolean>(false);




    const change = async (value: 1 | 0) => {
        const [negativeRes, positiveRes] = await $to(
            new Promise((resolve, reject) => {
                modal.create({
                    title: `确定${value ? '开启' : '关闭'}开发者模式吗？`,
                    type: 'info',
                    preset: 'dialog',
                    content: () => (
                        <div>
                            <p>即将{value ? '开启': '关闭'}开发者模式，确定要继续吗？</p>
                        </div>
                    ),
                    positiveText: '确认',
                    negativeText: '取消',
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
        }
    };

    const fetchData = async () => {
        const [getDevelopmentSettingsEnabledErr, getDevelopmentSettingsEnabledRes] = await $to<string, string>(deviceApi.getDevelopmentSettingsEnabled());
        if (getDevelopmentSettingsEnabledRes) {
            if (getDevelopmentSettingsEnabledRes === '1') {
                isEnabled.value = true
            } else {
                isEnabled.value = false
            }
            isInit.value = true;
            loading.value = false;
        }
    }


    onMounted(() => {
        setTimeout(() => {
            fetchData(); // 确保 UI 先渲染，再执行耗时操作
        },0);
    });

    return {
        change,
        isEnabled,
        isInit,
        loading,
    };
}
