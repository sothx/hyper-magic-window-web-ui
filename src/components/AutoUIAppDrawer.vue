<script setup lang="tsx">
    import { onMounted, reactive, ref, watch, type CSSProperties } from 'vue';
    import { useDeviceStore } from '@/stores/device';
    import { createDiscreteApi, type NInput } from 'naive-ui';
    import * as validateFun from '@/utils/validateFun';
    import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
    import type AutoUIItem from '@/types/AutoUIItem';
    import { useAutoUIStore } from '@/stores/autoui';
    const props = defineProps<{
        type: 'add' | 'update',
        title: string
    }>()
    const emit = defineEmits(['submit'])

    // Refs and stores
    const activeDrawer = ref(false); // 控制drawer显示
    const deviceStore = useDeviceStore();
    const autoUIStore = useAutoUIStore()
    const { message, modal } = createDiscreteApi(['message', 'modal'])
    export interface AutoUIDrawerSubmitResult {
        name: string;
        modePayload: {
            activityRule?: AutoUIItem['activityRule'],
            skippedActivityRule?: AutoUIItem['skippedActivityRule'],
            optimizeWebView: AutoUIItem['optimizeWebView'],
            skippedAppConfigChange: AutoUIItem['skippedAppConfigChange']
        };
        loadingCallback: () => void;
        closeCallback: () => void;
    }

    let resolvePromise: (result: AutoUIDrawerSubmitResult) => void; // 用于保存Promise的resolve
    let rejectPromise: (reason?: any) => void; // 用于保存Promise的reject

    // 各类选项的定义
    interface AutoUIRuleOptions {
        label: string
        key: string,
        rule?: string
    }

    const autoUIRuleOptions: AutoUIRuleOptions[] = [
        {
            label: '空白规则',
            key: 'UNDEFINED_VIEW_POLICY',
        },
        {
            label: '全局缩放[*:0]',
            key: 'VIEW_POLICY_DEFAULT',
            rule: '*:0'
        },
        {
            label: '全局拉伸[*:1]',
            key: 'VIEW_POLICY_STRETCH',
            rule: '*:1'
        },
        {
            label: '全局栅格[*:2]',
            key: 'VIEW_POLICY_AUTO_COLUMNS',
            rule: '*:2'
        },
        {
            label: '全局浮动[*:6]',
            key: 'VIEW_POLICY_FLOAT',
            rule: '*:6'
        },
        {
            label: '精确适配',
            key: 'CUSTOM_VIEW_POLICY',
        }
    ]

    // 选项的状态
    const currentAutoUIRuleOptions = ref<AutoUIRuleOptions>(autoUIRuleOptions[0])

    const currentActivityRule = ref<AutoUIRuleOptions['rule']>('');

    const currentSkippedActivityRule = ref<AutoUIRuleOptions['rule']>('');

    const currentOptimizeWebView = ref<boolean>(false);

    const currentSkippedAppConfigChange = ref<boolean>(false);

    const currentType = ref<'add' | 'update'>();

    const AutoUIAppDrawer = ref({
        openDrawer: (initialParams?: AutoUIMergeRuleItem): Promise<AutoUIDrawerSubmitResult> => {
            return new Promise((resolve, reject) => {
                if (props.type === 'update' && !initialParams) {
                    reject(new Error('更新模式下必须传入初始化参数'));
                    message.error('初始化参数不能为空');
                    return;
                }

                if (deviceStore.androidTargetSdk && (deviceStore.androidTargetSdk > 34 || deviceStore.androidTargetSdk < 32)) {
                    reject(new Error('该功能暂时未兼容Android 11或Android 15+，请等待后续消息~'));
                    message.warning('该功能暂时未兼容Android 11或Android 15+，请等待后续消息~')
                    return;
                }

                // 保存Promise的resolve和reject
                resolvePromise = resolve;
                rejectPromise = reject;

                // add模式，初始化参数
                if (props.type === 'add') {
                    currentType.value = 'add';
                    currentActivityRule.value = ''
                    currentAutoUIRuleOptions.value = autoUIRuleOptions[0]
                    currentSkippedActivityRule.value = ''
                    currentSkippedAppConfigChange.value = false
                    currentOptimizeWebView.value = true
                }

                // 如果是update模式，初始化参数
                if (props.type === 'update' && initialParams) {
                    currentType.value = 'update';
                    currentAppName.value = initialParams.name
                    currentActivityRule.value = initialParams.autoUIRule?.activityRule || ''
                    switch (currentActivityRule.value) {
                        case '': {
                            currentAutoUIRuleOptions.value = autoUIRuleOptions[0]
                            break;
                        }
                        case '*:0': {
                            currentAutoUIRuleOptions.value = autoUIRuleOptions[1]
                            break;
                        }
                        case '*:1': {
                            currentAutoUIRuleOptions.value = autoUIRuleOptions[2]
                            break;
                        }
                        case '*:2': {
                            currentAutoUIRuleOptions.value = autoUIRuleOptions[3]
                            break;
                        }
                        case '*:6': {
                            currentAutoUIRuleOptions.value = autoUIRuleOptions[4]
                            break;
                        }
                        default: {
                            currentAutoUIRuleOptions.value = autoUIRuleOptions[5]
                            break;
                        }
                    }
                    currentSkippedActivityRule.value = initialParams.autoUIRule?.skippedActivityRule || ''
                    currentSkippedAppConfigChange.value = initialParams.autoUIRule?.skippedAppConfigChange || false
                    currentOptimizeWebView.value = initialParams.autoUIRule?.optimizeWebView || false
                }

                activeDrawer.value = true; // 打开drawer
            });
        },
        closeDrawer: () => {
            activeDrawer.value = false; // 关闭drawer
            rejectPromise('Drawer closed without submission'); // 当关闭抽屉时，Promise被拒绝
        }
    });

    // 选择应用布局优化规则时更新
    const handleAutoUIRuleSelect = (key: string, option: AutoUIRuleOptions) => {
        currentAutoUIRuleOptions.value = option;
        currentActivityRule.value = option.rule || '';
    };

    const railStyle = ({
        focused,
        checked
    }: {
        focused: boolean
        checked: boolean
    }) => {
        const style: CSSProperties = {}
        if (checked) {
            style.background = '#2080f0'
            if (focused) {
                style.boxShadow = '0 0 0 2px #2080f040'
            }
        }
        else {
            style.background = '#d03050'
            if (focused) {
                style.boxShadow = '0 0 0 2px #d0305040'
            }
        }
        return style
    }

    const currentAppName = ref<string>('');
    const currentAppNameInputStatus = ref<string>('')

    const handleDrawerSubmit = async () => {
        if (!currentAppName.value) {
            modal.create({
                title: '应用包名不能为空',
                type: 'error',
                preset: 'dialog',
                content: () => (<p>噫？应用包名不能为空（敲</p>)
            })
            return
        }
        if (props.type === 'add' && autoUIStore.allPackageName.has(currentAppName.value)) {
            modal.create({
                title: '应用包名已存在',
                type: 'error',
                preset: 'dialog',
                content: () => (<p>噫？这个应用包名已经存在列表中了（敲</p>)
            })
            return
        }
        // 开启loading
        drawerSubmitLoading.value = true;

        const closeCallback = () => {
            drawerSubmitLoading.value = false;
            activeDrawer.value = false; // 关闭drawer
        }

        const loadingCallback = () => {
            drawerSubmitLoading.value = false;
        }

        const result: AutoUIDrawerSubmitResult = {
            name: currentAppName.value,
            modePayload: {
                optimizeWebView: currentOptimizeWebView.value,
                skippedAppConfigChange: currentSkippedAppConfigChange.value,
                ...(currentAutoUIRuleOptions.value.key !== 'UNDEFINED_VIEW_POLICY' && currentActivityRule.value) ? {
                    activityRule: currentActivityRule.value
                } : {},
                ...(currentActivityRule.value && currentSkippedActivityRule.value ? {
                    skippedActivityRule: currentSkippedActivityRule.value
                } : {})
            },
            loadingCallback,
            closeCallback
        };
        resolvePromise(result)
    }

    const drawerSubmitLoading = ref<boolean>(false);

    defineExpose({
        openDrawer: AutoUIAppDrawer.value.openDrawer // 传递 openDrawer 方法
    })

    onMounted(() => {
        // console.log(import.meta.env, 'import.meta.env')
    })


</script>

<template>
    <!-- Button Slot -->
    <slot v-bind="{ openDrawer: AutoUIAppDrawer.openDrawer }"></slot>

    <!-- Drawer -->
    <n-drawer v-model:show="activeDrawer" :default-width="500" placement="right">
        <n-drawer-content :title="props.title" closable>
            <n-input-group :class="(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2) ? '' : 'mb-5'">
                <n-input-group-label size="large">应用包名</n-input-group-label>
                <n-input size="large" :status="currentAppNameInputStatus" v-model:value="currentAppName"
                    :allow-input="(value: string) => validateFun.validateAndroidPackageName(value)"
                    :readonly="props.type === 'update'" placeholder="请输入应用包名" />
            </n-input-group>
            <n-card :bordered="false" title="应用布局优化规则" size="small">
                <n-dropdown v-model:value="currentAutoUIRuleOptions" size="large" trigger="click"
                    :options="autoUIRuleOptions" @select="handleAutoUIRuleSelect">
                    <n-button block type="info" dashed>{{ currentAutoUIRuleOptions.label
                        }}</n-button>
                </n-dropdown>
            </n-card>
            <n-card v-if="currentAutoUIRuleOptions.key === 'CUSTOM_VIEW_POLICY'" :bordered="false" title="自定义应用布局优化规则"
                size="small">
                <n-input-group>
                    <n-input :allow-input="(value: string) => validateFun.validateAutoUIRule(value)" type="textarea"
                        :autosize="{ minRows: 1, maxRows: 3 }" v-model:value="currentActivityRule"
                        placeholder="请输入自定义应用布局优化规则" />
                </n-input-group>
            </n-card>
            <n-card v-if="currentAutoUIRuleOptions.key === 'CUSTOM_VIEW_POLICY' && currentActivityRule" :bordered="false"
                title="跳过应用布局优化的Activity规则" size="small">
                <n-input-group>
                    <n-input :allow-input="(value: string) => validateFun.validateAutoUISkipActivityRule(value)"
                        type="textarea" :autosize="{ minRows: 1, maxRows: 3 }"
                        v-model:value="currentSkippedActivityRule" placeholder="请输入跳过应用布局优化的Activity规则" />
                </n-input-group>
            </n-card>
            <n-card :bordered="false" title="优化WebView页面" size="small">
                <n-switch :rail-style="railStyle" v-model:value="currentOptimizeWebView" size="large">
                    <template #checked>
                        优化WebView页面
                    </template>
                    <template #unchecked>
                        不优化WebView页面
                    </template>
                </n-switch>
            </n-card>
            <n-card :bordered="false" title="跳过应用配置改变" size="small">
                <n-switch :rail-style="railStyle" v-model:value="currentSkippedAppConfigChange" size="large">
                    <template #checked>
                        跳过应用配置改变
                    </template>
                    <template #unchecked>
                        不跳过应用配置改变
                    </template>
                </n-switch>
            </n-card>
            <template #footer>
                <n-button type="info" v-model:loading="drawerSubmitLoading" @click="() => handleDrawerSubmit()">
                    提交
                </n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<style scoped></style>