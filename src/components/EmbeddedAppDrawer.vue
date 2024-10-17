<script setup lang="tsx">
    import { onMounted, reactive, ref, watch, type CSSProperties } from 'vue';
    import { useDeviceStore } from '@/stores/device';
    import { useEmbeddedStore } from '@/stores/embedded';
    import type EmbeddedMergeRuleItem from "@/types/EmbeddedMergeRuleItem";
    import { createDiscreteApi, type NInput } from 'naive-ui';
    import * as validateFun from '@/utils/validateFun';
    import $to from 'await-to-js'
    const props = defineProps<{
        type: 'add' | 'update',
        title: string
    }>()
    const emit = defineEmits(['submit'])

    // Refs and stores
    const activeDrawer = ref(false); // 控制drawer显示
    const deviceStore = useDeviceStore();
    const embeddedStore = useEmbeddedStore();
    const { message, modal } = createDiscreteApi(['message', 'modal'])
    export interface EmbeddedAppDrawerSubmitResult {
        name: string;
        settingMode: EmbeddedMergeRuleItem["settingMode"];
        modePayload: {
            fullRule?: string;
            skipSelfAdaptive?: boolean;
            isShowDivider?: boolean;
            supportFullSize?: boolean;
            ratio?: number;
        };
        loadingCallback: () => void;
        closeCallback: () => void;
    }

    let resolvePromise: (result: EmbeddedAppDrawerSubmitResult) => void; // 用于保存Promise的resolve
    let rejectPromise: (reason?: any) => void; // 用于保存Promise的reject

    // 各类选项的定义
    interface fullScreenRuleOptions {
        label: string
        key: string,
        rule?: string
    }

    interface fixedOrientationRatioOptions {
        label: string
        key: string
        ratio?: number
    }

    const fullScreenRuleOptions: fullScreenRuleOptions[] = [
        {
            label: '强制应用所有界面横屏[nra:cr:rcr:nr]',
            key: 'fullScreen_nra:cr:rcr:nr',
            rule: 'nra:cr:rcr:nr'
        },
        {
            label: '继承应用自身设置横屏[*]',
            key: 'fullScreen_*',
            rule: '*'
        },
        {
            label: '自定义',
            key: 'fullScreen_custom'
        }
    ]

    const fixedOrientationRatioOptions: fixedOrientationRatioOptions[] = [
        {
            label: '大尺寸[11:10]',
            key: 'ratio_11_10',
            ratio: 1.1
        },
        {
            label: '中尺寸',
            key: 'ratio_default',
        },
        {
            label: '小尺寸[15:10]',
            key: 'ratio_15_10',
            ratio: 1.5
        },
        {
            label: '小尺寸[18:10]',
            key: 'ratio_18:10',
            ratio: 1.8
        },
        {
            label: '自定义',
            key: 'ratio_custom'
        }
    ]

    // 选项的状态
    const currentFullScreenRuleOptions = ref<fullScreenRuleOptions>(fullScreenRuleOptions[0])

    const currentFullRule = ref<fullScreenRuleOptions['rule']>();

    const currentSupportFullSize = ref<boolean>(true);

    const currentRuleMode = ref<EmbeddedMergeRuleItem["ruleMode"]>();

    const currentType = ref<'add' | 'update'>();

    const currentFixedOrientationRatio = ref<fixedOrientationRatioOptions>(fixedOrientationRatioOptions[1])

    const currentRatio = ref<number>();

    const currentSupportModes = ref<EmbeddedMergeRuleItem["settingMode"][]>([]);

    const embeddedAppDrawer = ref({
        openDrawer: (initialParams?: EmbeddedMergeRuleItem): Promise<EmbeddedAppDrawerSubmitResult> => {
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
                    currentFullScreenRuleOptions.value = fullScreenRuleOptions[0]
                    currentFullRule.value = 'nra:cr:rcr:nr'
                    currentSupportModes.value = ['fullScreen', 'fixedOrientation', 'disabled']
                }

                // 如果是update模式，初始化参数
                if (props.type === 'update' && initialParams) {
                    currentType.value = 'update';
                    currentRuleMode.value = initialParams.ruleMode
                    currentAppName.value = initialParams.name
                    isSupportEmbedded.value = initialParams.isSupportEmbedded
                    const initialSupportModes: EmbeddedMergeRuleItem["settingMode"][] = ['disabled']
                    if (initialParams.fixedOrientationRule?.supportModes?.includes('fo')) {
                        initialSupportModes.unshift('fixedOrientation')
                    }
                    if (initialParams.fixedOrientationRule?.supportModes?.includes('full')) {
                        initialSupportModes.unshift('fullScreen')
                    }
                    if (isSupportEmbedded.value) {
                        initialSupportModes.unshift('embedded')
                    }
                    currentSupportModes.value = initialSupportModes
                    currentSettingMode.value = initialParams.settingMode;
                    currentSkipSelfAdaptive.value = initialParams.fixedOrientationRule?.disable ?? false
                    currentIsShowDivider.value = initialParams.fixedOrientationRule?.isShowDivider ?? false
                    currentFullRule.value = initialParams.embeddedRules?.fullRule ?? undefined
                    if (currentFullRule.value === 'nra:cr:rcr:nr') {
                        currentFullScreenRuleOptions.value = fullScreenRuleOptions[0]

                    } else if (initialParams.embeddedRules && !initialParams.embeddedRules.hasOwnProperty('fullRule')) {
                        currentFullRule.value = 'nra:cr:rcr:nr'
                        currentFullScreenRuleOptions.value = fullScreenRuleOptions[0]
                    } else if (currentFullRule.value === '*') {
                        currentFullScreenRuleOptions.value = fullScreenRuleOptions[1]
                    } else {
                        currentFullScreenRuleOptions.value = fullScreenRuleOptions[2]
                    }
                    currentSupportFullSize.value = initialParams.embeddedRules?.supportFullSize ?? false
                    currentRatio.value = initialParams.fixedOrientationRule?.ratio ?? undefined
                    if (currentRatio.value) {
                        if (currentRatio.value === 1.1) {
                            currentFixedOrientationRatio.value = fixedOrientationRatioOptions[0]
                        } else if (currentRatio.value === 1.5) {
                            currentFixedOrientationRatio.value = fixedOrientationRatioOptions[2]
                        } else if (currentRatio.value === 1.8) {
                            currentFixedOrientationRatio.value = fixedOrientationRatioOptions[3]
                        } else {
                            currentFixedOrientationRatio.value = fixedOrientationRatioOptions[4]
                        }
                    } else {
                        currentFixedOrientationRatio.value = fixedOrientationRatioOptions[1]
                    }
                }

                activeDrawer.value = true; // 打开drawer
            });
        },
        closeDrawer: () => {
            activeDrawer.value = false; // 关闭drawer
            rejectPromise('Drawer closed without submission'); // 当关闭抽屉时，Promise被拒绝
        }
    });

    // 选择全屏规则时更新
    const handleFullScreenRuleSelect = (key: string, option: fullScreenRuleOptions) => {
        currentFullScreenRuleOptions.value = option;
        currentFullRule.value = ['fullScreen_nra:cr:rcr:nr', 'fullScreen_*'].includes(key) ? option.rule : undefined;
    };

    // 选择显示比例时更新
    const handleFixedOrientationRatioSelect = (key: string, option: fixedOrientationRatioOptions) => {
        currentFixedOrientationRatio.value = option;
        currentRatio.value = ['ratio_11_10', 'ratio_15_10', 'ratio_18:10'].includes(key) ? option.ratio : (key === 'ratio_custom' ? 1.5 : undefined);
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

    const currentSettingMode = ref<EmbeddedMergeRuleItem["settingMode"]>('fullScreen');

    const currentSkipSelfAdaptive = ref<boolean>(false);

    const currentIsShowDivider = ref<boolean>(true);

    const currentAppName = ref<string>('');
    const currentAppNameInputStatus = ref<string>('')

    const isSupportEmbedded = ref<boolean>(false);

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
        if (currentSettingMode.value === 'fullScreen' && !currentFullRule.value) {
            modal.create({
                title: '应用全屏规则不能为空',
                type: 'error',
                preset: 'dialog',
                content: () => (<p>噫？应用全屏规则不能为空（敲</p>)
            })
            return
        }
        if (props.type === 'add' && embeddedStore.allPackageName.has(currentAppName.value)) {
            modal.create({
                title: '应用包名已存在',
                type: 'error',
                preset: 'dialog',
                content: () => (<p>噫？这个应用包名已经存在列表中了（敲</p>)
            })
            return
        }
        if (props.type === 'update' && isSupportEmbedded.value && currentSettingMode.value === 'fullScreen') {
            const [embeddedToFullScreenModalNegative] = await $to(new Promise<string>((resolve, reject) => {
                modal.create({
                    title: '确认使用全屏规则吗？',
                    type: 'warning',
                    preset: 'dialog',
                    content: () => {
                        if (currentRuleMode.value === 'custom') {
                            return (
                                <p>当前应用已存在 <span class="font-bold text-gray-600">平行窗口的自定义规则</span> ，继续提交将导致 <span class="font-bold text-gray-600">平行窗口的自定义规则</span> 丢失。确定要继续吗？</p>
                            )
                        } else {
                            return (
                                <p>当前应用已存在 <span class="font-bold text-gray-600">平行窗口的模块规则</span> ，继续更新将会被更替为 <span class="font-bold text-gray-600">全屏规则</span> ，如后续需要改回 <span class="font-bold text-gray-600">平行窗口的模块规则</span> 则需要先清除自定义规则，确定要继续吗？</p>
                            )
                        }
                    },
                    positiveText: '确定继续',
                    negativeText: '我再想想',
                    onPositiveClick: () => {
                        resolve('positiveClick')
                    },
                    onNegativeClick: () => {
                        reject('negativeClick')
                    }
                })
            }))
            if (embeddedToFullScreenModalNegative) {
                return;
            }
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

        const result: EmbeddedAppDrawerSubmitResult = {
            name: currentAppName.value,
            settingMode: currentSettingMode.value,
            modePayload: {
                ...(currentSettingMode.value === 'fullScreen' && { fullRule: currentFullRule.value }),
                ...(currentSettingMode.value === 'fullScreen' && { skipSelfAdaptive: currentSkipSelfAdaptive.value }),
                ...(currentSettingMode.value === 'fullScreen' && { isShowDivider: currentIsShowDivider.value }),
                ...(currentSettingMode.value === 'fullScreen' && { supportFullSize: currentSupportFullSize.value }),
                ...(currentSettingMode.value === 'fixedOrientation' && { ratio: currentRatio.value })
            },
            loadingCallback,
            closeCallback
        };
        resolvePromise(result)
    }

    const drawerSubmitLoading = ref<boolean>(false);

    const handleCurrentSupportModes = (value: EmbeddedMergeRuleItem["settingMode"][]) => {
        const order = ['embedded', 'fullScreen', 'fixedOrientation', 'disabled'];
        value.sort((a, b) => {
            return order.indexOf(a) - order.indexOf(b);
        });
        currentSupportModes.value = value
        currentSettingMode.value = value[0]
        // message.info(JSON.stringify(value))
    }

    const isShowTabs = ref<boolean>(true);

    watch(() => currentSupportModes.value, (newValue) => {
        if (newValue) {
            isShowTabs.value = false
            setTimeout(() => {
                isShowTabs.value = true
            }, 0);
        }
    });


    defineExpose({
        openDrawer: embeddedAppDrawer.value.openDrawer // 传递 openDrawer 方法
    })

    onMounted(() => {
        // console.log(import.meta.env, 'import.meta.env')
    })


</script>

<template>
    <!-- Button Slot -->
    <slot v-bind="{ openDrawer: embeddedAppDrawer.openDrawer }"></slot>

    <!-- Drawer -->
    <n-drawer v-model:show="activeDrawer" :default-width="500" placement="right">
        <n-drawer-content :title="props.title" closable>
            <n-input-group class="mb-5">
                <n-input-group-label size="large">应用包名</n-input-group-label>
                <n-input size="large" :status="currentAppNameInputStatus" v-model:value="currentAppName"
                    :allow-input="(value: string) => validateFun.validateAndroidPackageName(value)"
                    :readonly="props.type === 'update'" placeholder="请输入应用包名" />
            </n-input-group>
            <n-card :bordered="false" title="支持的规则" size="small" v-if="deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2">
                <n-checkbox-group size="large" v-model:value="currentSupportModes"
                    @update:value="handleCurrentSupportModes">
                    <n-grid :y-gap="8" :cols="2">
                        <n-gi v-if="currentType === 'update'">
                            <n-checkbox :disabled="true" checked-value="embedded" value="embedded" label="平行窗口" />
                        </n-gi>
                        <n-gi>
                            <n-checkbox value="fullScreen" label="全屏" />
                        </n-gi>
                        <n-gi>
                            <n-checkbox value="fixedOrientation" label="居中布局" />
                        </n-gi>
                        <n-gi>
                            <n-checkbox :disabled="true" checked-value="disabled" value="disabled" label="原始布局" />
                        </n-gi>
                    </n-grid>
                </n-checkbox-group>
            </n-card>
            <n-tabs type="segment" v-if="isShowTabs" animated v-model:value="currentSettingMode">
                <n-tab-pane name="embedded" tab="平行窗口" v-if="props.type === 'update' && isSupportEmbedded">
                    <n-alert :show-icon="false" :bordered="false" title="应用分屏显示" type="success">
                        开启后，未适配横屏应用界面将通过平行窗口显示
                    </n-alert>
                </n-tab-pane>
                <n-tab-pane name="fullScreen" tab="全屏"
                    v-if="(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 ? currentSupportModes.includes('fullScreen') : true)">
                    <n-alert :show-icon="false" :bordered="false" title="应用横屏显示" type="info">
                        开启后，未适配横屏应用界面将全屏显示，并可更改显示规则
                    </n-alert>
                    <n-card :bordered="false" title="横屏显示规则" size="small">
                        <n-dropdown v-model="currentFullScreenRuleOptions" size="large" trigger="click"
                            :options="fullScreenRuleOptions" @select="handleFullScreenRuleSelect">
                            <n-button block type="info" dashed>{{ currentFullScreenRuleOptions.label
                                }}</n-button>
                        </n-dropdown>
                    </n-card>
                    <n-card v-if="currentFullScreenRuleOptions.key === 'fullScreen_custom'" :bordered="false"
                        title="自定义横屏规则" size="small">
                        <n-input-group>
                            <n-input v-model:value="currentFullRule" placeholder="请输入横屏规则" />
                        </n-input-group>
                    </n-card>
                    <n-card class="" :bordered="false" title="跳过应用自适配声明" size="small">
                        <div class="mb-4">
                            <n-tag :bordered="false" type="success">
                                适用于即使设置了 <span class="font-bold">横屏规则</span> 仍无法横屏的应用
                            </n-tag>
                        </div>
                        <n-switch :rail-style="railStyle" v-model:value="currentSkipSelfAdaptive" size="large">
                            <template #checked>
                                跳过自适配声明
                            </template>
                            <template #unchecked>
                                不跳过自适配声明
                            </template>
                        </n-switch>
                    </n-card>
                    <n-card :bordered="false" title="平行窗口滑动条" size="small">
                        <div class="mb-4">
                            <n-tag :bordered="false" type="success">
                                适用于原生适配 <span class="font-bold">Android Embedded</span> 的应用
                            </n-tag>
                        </div>
                        <n-switch :rail-style="railStyle" v-model:value="currentIsShowDivider" size="large">
                            <template #checked>
                                启用平行窗口滑动条
                            </template>
                            <template #unchecked>
                                关闭平行窗口滑动条
                            </template>
                        </n-switch>
                    </n-card>
                    <n-card :bordered="false" title="平行窗口可滑动至全屏" v-if="currentIsShowDivider" size="small">
                        <div class="mb-4">
                            <n-tag :bordered="false" type="success">
                                适用于原生适配 <span class="font-bold">Android Embedded</span> 的应用
                            </n-tag>
                        </div>
                        <n-switch :rail-style="railStyle" v-model:value="currentSupportFullSize" size="large">
                            <template #checked>
                                平行窗口可滑动至全屏
                            </template>
                            <template #unchecked>
                                平行窗口不可滑动至全屏
                            </template>
                        </n-switch>
                    </n-card>
                </n-tab-pane>
                <n-tab-pane name="fixedOrientation" tab="居中布局"
                    v-if="(deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 ? currentSupportModes.includes('fixedOrientation') : true)">
                    <n-alert :show-icon="false" :bordered="false" title="应用居中显示" type="warning">
                        开启后，未适配横屏应用界面将居中显示，并可更改显示比例
                    </n-alert>
                    <n-card :bordered="false" title="居中显示比例" size="small">
                        <n-dropdown v-model:value="currentFixedOrientationRatio" size="large" trigger="click"
                            :options="fixedOrientationRatioOptions" @select="handleFixedOrientationRatioSelect">
                            <n-button block type="error" dashed>{{ currentFixedOrientationRatio.label
                                }}</n-button>
                        </n-dropdown>
                    </n-card>
                    <n-card v-if="currentFixedOrientationRatio.key === 'ratio_custom'" :bordered="false" title="自定义显示比例"
                        size="small">
                        <n-slider size="small" v-model:value="currentRatio" :min="1.01" :max="1.99" :step="0.01" />
                        <n-input-number :show-button="false" class="pt-3" readonly placeholder="请输入自定义显示比例"
                            v-model:value="currentRatio" :min="1.01" :max="1.99" :step="0.01" />
                    </n-card>
                </n-tab-pane>
                <n-tab-pane name="disabled" tab="原始布局">
                    <n-alert :show-icon="false" :bordered="false" title="应用原始布局" type="error">
                        开启后，将禁用任何系统规则干预，应用会根据自身的适配规则进行显示，大多数应用仅竖屏显示
                    </n-alert>
                </n-tab-pane>
            </n-tabs>
            <template #footer>
                <n-button type="info" v-model:loading="drawerSubmitLoading" @click="() => handleDrawerSubmit()">
                    提交
                </n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<style scoped></style>