<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { useEmbeddedStore } from '@/stores/embedded';
import type MergeRuleItem from "@/types/MergeRuleItem";
import { createDiscreteApi, type NInput } from 'naive-ui';
import * as validateFun from '@/utils/validateFun';
const props = defineProps<{
    type: 'add' | 'update',
    title: string
}>()
const emit = defineEmits(['submit'])

// Refs and stores
const activeDrawer = ref(false); // 控制drawer显示
const deviceStore = useDeviceStore();
const embeddedStore = useEmbeddedStore();
const { message } = createDiscreteApi(['message'])

let resolvePromise: (result: any) => void; // 用于保存Promise的resolve
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
        label: '强制应用所有界面横屏',
        key: 'fullScreen_nra:cr:rcr:nr',
        rule: 'nra:cr:rcr:nr'
    },
    {
        label: '继承应用自身设置横屏',
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
        label: '大尺寸(11:10)',
        key: 'ratio_11_10',
        ratio: 1.1
    },
    {
        label: '中尺寸',
        key: 'ratio_default',
    },
    {
        label: '小尺寸(15:10)',
        key: 'ratio_15_10',
        ratio: 1.5
    },
    {
        label: '小尺寸(18:10)',
        key: 'ratio_18:10',
        ratio: 1.8
    },
    {
        label: '自定义',
        key: 'ratio_custom'
    }
]

// 选项的状态
const currentFullScreenRuleOptions = ref<fullScreenRuleOptions>({
    label: '强制应用所有界面横屏',
    key: 'fullScreen_nra:cr:rcr:nr',
    rule: 'nra:cr:rcr:nr'
})

const currentFullRule = ref<fullScreenRuleOptions['rule']>();

const currentFixedOrientationRatio = ref<fixedOrientationRatioOptions>({
    label: '中尺寸',
    key: 'ratio_default'
})

const currentRatio = ref<number>();

const embeddedAppDrawer = ref({
    openDrawer: (initialParams?: any) => {
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

            // 如果是update模式，初始化参数
            if (props.type === 'update' && initialParams) {
                if (initialParams.fullScreenRule) {
                    const foundRule = fullScreenRuleOptions.find(option => option.key === initialParams.fullScreenRule.key);
                    currentFullScreenRuleOptions.value = foundRule || fullScreenRuleOptions[0];
                    currentFullRule.value = foundRule?.rule;
                }
                if (initialParams.fixedOrientationRatio) {
                    const foundRatio = fixedOrientationRatioOptions.find(option => option.key === initialParams.fixedOrientationRatio.key);
                    currentFixedOrientationRatio.value = foundRatio || fixedOrientationRatioOptions[0];
                    currentRatio.value = foundRatio?.ratio;
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

// 提交时处理数据并解析Promise
const handleSubmit = () => {
    const result = {
        fullScreenRule: currentFullScreenRuleOptions.value,
        fixedOrientationRatio: currentFixedOrientationRatio.value,
        customRatio: currentRatio.value
    };
    resolvePromise(result); // 解析Promise并返回结果
    message.info('参数已提交');
    activeDrawer.value = false; // 关闭drawer
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

const currentSettingMode = ref<MergeRuleItem["settingMode"]>('fullScreen');

const currentAppName = ref<string>('');
const currentAppNameInputStatus = ref<string>('')

const validAppNameBlur = (value: string) => {
    if (!value) {
        currentAppNameInputStatus.value = 'error'
    } else {
        currentAppNameInputStatus.value = ''
    }
}

const isSupportEmbedded = ref<boolean>(false);

defineExpose({
    openDrawer: embeddedAppDrawer.value.openDrawer // 传递 openDrawer 方法
})


</script>

<template>
    <!-- Button Slot -->
    <slot v-bind="{ openDrawer: embeddedAppDrawer.openDrawer }"></slot>

    <!-- Drawer -->
    <n-drawer v-model:show="activeDrawer" :width="502" placement="right">
        <n-drawer-content :title="props.title" closable>
            <n-input-group class="mb-5">
                <n-input-group-label size="large">应用包名</n-input-group-label>
                <n-input size="large" :status="currentAppNameInputStatus" v-model="currentAppName"
                    :allow-input="(value: string) => validateFun.validateAndroidPackageName(value)"
                    :readonly="props.type === 'update'" placeholder="请输入应用包名"
                    @input="(value: string) => validAppNameBlur(value)" />
            </n-input-group>
            <n-tabs type="segment" animated size="large" v-model:value="currentSettingMode">
                <n-tab-pane name="embedded" tab="平行窗口" v-if="props.type === 'update' && isSupportEmbedded">
                    <n-alert :show-icon="false" :bordered="false" title="应用分屏显示" type="success">
                        开启后，未适配横屏应用界面将通过平行窗口显示
                    </n-alert>
                </n-tab-pane>
                <n-tab-pane name="fullScreen" tab="全屏">
                    <n-alert :show-icon="false" :bordered="false" title="应用横屏显示" type="info">
                        开启后，未适配横屏应用界面将全屏显示，并可更改显示比例
                    </n-alert>
                    <n-card class="mt-2" :bordered="false" title="横屏显示规则" size="small">
                        <n-dropdown v-model="currentFullScreenRuleOptions" size="large" trigger="hover"
                            :options="fullScreenRuleOptions" @select="handleFullScreenRuleSelect">
                            <n-button block size="large" type="info" dashed>{{ currentFullScreenRuleOptions.label
                                }}</n-button>
                        </n-dropdown>
                    </n-card>
                    <n-card v-if="currentFullScreenRuleOptions.key === 'fullScreen_custom'" class="mt-2"
                        :bordered="false" title="自定义横屏规则" size="small">
                        <n-input-group class="mb-5">
                            <n-input size="large" v-model="currentFullRule" placeholder="请输入横屏规则" />
                        </n-input-group>
                    </n-card>
                    <n-card class="mt-2" :bordered="false" title="平行窗口滑动条" size="small">
                        <div class="mb-4">
                            <n-tag :bordered="false" type="success">
                                适用于原生适配 Android Embedded 的应用
                            </n-tag>
                        </div>
                        <n-switch :rail-style="railStyle" size="large">
                            <template #checked>
                                启用平行窗口滑动条
                            </template>
                            <template #unchecked>
                                禁用平行窗口滑动条
                            </template>
                        </n-switch>
                    </n-card>
                </n-tab-pane>
                <n-tab-pane name="fixedOrientation" tab="居中布局">
                    <n-alert :show-icon="false" :bordered="false" title="应用居中显示" type="warning">
                        开启后，未适配横屏应用界面将居中显示，并可更改显示比例
                    </n-alert>
                    <n-card class="mt-2" :bordered="false" title="居中显示比例" size="small">
                        <n-dropdown v-model="currentFixedOrientationRatio" size="large" trigger="hover"
                            :options="fixedOrientationRatioOptions" @select="handleFixedOrientationRatioSelect">
                            <n-button size="large" block type="error" dashed>{{ currentFixedOrientationRatio.label
                                }}</n-button>
                        </n-dropdown>
                    </n-card>
                    <n-card v-if="currentFixedOrientationRatio.key === 'ratio_custom'" class="mt-2" :bordered="false"
                        title="自定义显示比例" size="small">
                        <n-slider size="small" v-model:value="currentRatio" :min="1.01" :max="1.99" :step="0.01" />
                        <n-input-number class="pt-3" placeholder="请输入自定义显示比例" v-model:value="currentRatio" :min="1.01"
                            :max="1.99" :step="0.01" />
                    </n-card>
                </n-tab-pane>
                <n-tab-pane name="disabled" tab="原始布局">
                    <n-alert :show-icon="false" :bordered="false" title="应用原始布局" type="error">
                        开启后，将禁用任何系统规则干预，应用会根据自身的适配规则进行显示，大多数应用仅竖屏显示
                    </n-alert>
                </n-tab-pane>
            </n-tabs>
            <template #footer>
                <n-button type="info" @click="() => resolvePromise({})">
                    提交
                </n-button>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>

<style scoped></style>