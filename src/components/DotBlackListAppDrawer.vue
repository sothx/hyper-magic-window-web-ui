<script setup lang="tsx">
import { computed, onMounted, reactive, ref, watch, type CSSProperties } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type NInput } from 'naive-ui';
import * as validateFun from '@/utils/validateFun';
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import type AutoUIItem from '@/types/AutoUIItem';
import { useAutoUIStore } from '@/stores/autoui';
import { useDotBlackListStore } from '@/stores/dotBlackList';
const dotBlackListStore = useDotBlackListStore();
import { useLogsStore } from '@/stores/logs';
type NInputInstance = InstanceType<typeof NInput>;
const currentSkippedActivityRuleRef = ref<NInputInstance | null>(null);
const currentActivityRuleRef = ref<NInputInstance | null>(null);
const props = defineProps<{
	type: 'add' | 'update';
	title: string;
}>();
const emit = defineEmits(['submit']);

// Refs and stores
const activeDrawer = ref(false); // 控制drawer显示
const deviceStore = useDeviceStore();
const autoUIStore = useAutoUIStore();
const logsStore = useLogsStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
export interface DotBlackListDrawerSubmitResult {
	name: string;
	loadingCallback: () => void;
	closeCallback: () => void;
}

let resolvePromise: (result: DotBlackListDrawerSubmitResult) => void; // 用于保存Promise的resolve
let rejectPromise: (reason?: any) => void; // 用于保存Promise的reject

const DotBlackListAppDrawer = ref({
	openDrawer: (initialParams?: AutoUIMergeRuleItem): Promise<DotBlackListDrawerSubmitResult> => {
		return new Promise((resolve, reject) => {
			if (props.type === 'update' && !initialParams) {
				reject(new Error('更新模式下必须传入初始化参数'));
				message.error('初始化参数不能为空');
				return;
			}

			// 保存Promise的resolve和reject
			resolvePromise = resolve;
			rejectPromise = reject;

			currentAppName.value = '';

			activeDrawer.value = true; // 打开drawer
		});
	},
	closeDrawer: () => {
		activeDrawer.value = false; // 关闭drawer
		rejectPromise('Drawer closed without submission'); // 当关闭抽屉时，Promise被拒绝
	},
});
const resizeDrawerContentFun = (isResize: boolean) => {
	const autoUIDrawerContentEl = document.querySelector('.n-drawer-content');
	if (autoUIDrawerContentEl instanceof HTMLElement) {
		logsStore.info(`resizeDrawerContent`, isResize);
		autoUIDrawerContentEl.style.height = isResize ? `calc(100% + 200px)` : `100%`;
	}
};

const currentAppName = ref<string>('');
const currentAppNameInputStatus = ref<string>('');

const handleDrawerSubmit = async () => {
	if (!currentAppName.value) {
		modal.create({
			title: '应用包名不能为空',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？应用包名不能为空（敲</p>,
		});
		return;
	}
	if (dotBlackListStore.allPackageName.has(currentAppName.value)) {
		modal.create({
			title: '应用包名已存在',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？这个应用包名已经存在列表中了（敲</p>,
		});
		return;
	}
	// 开启loading
	drawerSubmitLoading.value = true;

	const closeCallback = () => {
		drawerSubmitLoading.value = false;
		activeDrawer.value = false; // 关闭drawer
	};

	const loadingCallback = () => {
		drawerSubmitLoading.value = false;
	};

	const result: DotBlackListDrawerSubmitResult = {
		name: currentAppName.value,
		loadingCallback,
		closeCallback,
	};

	modal.create({
		title: '确认隐藏窗口控制器吗？',
		type: 'warning',
		preset: 'dialog',
		content: () => {
			return (
				<p>
					窗口控制器的隐藏受小米云控规则下发影响，如果隐藏窗口控制器失效，请重新操作{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						热重载应用数据
					</span>{' '}
					，如后续需要恢复{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						窗口控制器
					</span>{' '}
					的显示，则需要先清除自定义规则，确定要继续吗？
				</p>
			);
		},
		positiveText: '确定隐藏',
		negativeText: '我再想想',
		onPositiveClick: async () => {
			resolvePromise(result);
		},
		onNegativeClick() {
			loadingCallback();
		},
		onMaskClick() {
			loadingCallback();
		},
		onClose() {
			loadingCallback();
		},
	});
};

const drawerSubmitLoading = ref<boolean>(false);

defineExpose({
	openDrawer: DotBlackListAppDrawer.value.openDrawer, // 传递 openDrawer 方法
});
</script>

<template>
	<!-- Button Slot -->
	<slot v-bind="{ openDrawer: DotBlackListAppDrawer.openDrawer }"></slot>

	<!-- Drawer -->
	<n-drawer v-model:show="activeDrawer" :default-width="500" placement="right">
		<n-drawer-content
			body-content-class="auto-ui-drawer-content"
			:scrollbar-props="{
				trigger: 'none',
			}"
			:title="props.title"
			closable>
			<n-input-group :class="deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 ? '' : 'mb-5'">
				<n-input-group-label size="large">应用包名</n-input-group-label>
				<n-input
					size="large"
					:status="currentAppNameInputStatus"
					v-model:value="currentAppName"
					:allow-input="(value: string) => validateFun.validateAndroidPackageName(value)"
					:readonly="props.type === 'update'"
					placeholder="请输入应用包名" />
			</n-input-group>
      <n-alert :show-icon="false" :bordered="false" title="隐藏窗口控制器" type="info" class="mt-5">
						添加后，应用上方的窗口控制器将被隐藏
			</n-alert>
			<template #footer>
				<n-button type="info" v-model:loading="drawerSubmitLoading" @click="() => handleDrawerSubmit()">
					提交
				</n-button>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<style scoped></style>
