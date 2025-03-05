<script setup lang="tsx">
import { computed, onMounted, reactive, ref, watch, type CSSProperties } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type NInput } from 'naive-ui';
import * as validateFun from '@/utils/validateFun';
import { useLogsStore } from '@/stores/logs';
import type EmbeddedPlaceholder from '@/types/EmbeddedPlaceholder';
const props = defineProps<{
	type: 'add' | 'update';
	title: string;
}>();
const emit = defineEmits(['submit']);

// Refs and stores
const activeDrawer = ref(false); // 控制drawer显示
const deviceStore = useDeviceStore();
const logsStore = useLogsStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
export interface EmbeddedPlaceholderDrawerSubmitResult {
	mainPageActivity: string;
	relatedPageActivity: string;
	loadingCallback: () => void;
	closeCallback: () => void;
}

let resolvePromise: (result: EmbeddedPlaceholderDrawerSubmitResult) => void; // 用于保存Promise的resolve
let rejectPromise: (reason?: any) => void; // 用于保存Promise的reject

const EmbeddedPlaceholderDrawer = ref({
	openDrawer: (initialParams?: EmbeddedPlaceholder): Promise<EmbeddedPlaceholderDrawerSubmitResult> => {
		return new Promise((resolve, reject) => {
			if (props.type === 'update' && !initialParams) {
				reject(new Error('更新模式下必须传入初始化参数'));
				message.error('初始化参数不能为空');
				return;
			}

			// 保存Promise的resolve和reject
			resolvePromise = resolve;
			rejectPromise = reject;

			if (props.type === 'update') {
				currentMainPageActivity.value = initialParams?.mainPageActivity || '';
				currentRelatedPageActivity.value = initialParams?.relatedPageActivity || '';
			} else {
				currentMainPageActivity.value = '';
				currentRelatedPageActivity.value = '';
			}

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

const currentMainPageActivity = ref<string>('');

const currentRelatedPageActivity = ref<string>('');

const handleDrawerSubmit = async () => {
	// 去除前后空格
	const mainPage = currentMainPageActivity.value.trim();
	const relatedPage = currentRelatedPageActivity.value.trim();

	// 校验逻辑
	const isMainEmpty = !mainPage;
	const isRelatedEmpty = !relatedPage;

	if ((isMainEmpty && !isRelatedEmpty) || (!isMainEmpty && isRelatedEmpty)) {
		// 其中一个有值，另一个为空 -> 报错并中断提交
		modal.create({
			title: '校验不通过',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？请确保主页面和关联页面Activity同时填写或同时为空（敲</p>,
		});
		return;
	}

	if (!isMainEmpty && mainPage === relatedPage) {
		// 两个都有值，但相同 -> 报错
		modal.create({
			title: '校验不通过',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？请主页面和关联页面不能相同（敲</p>,
		});
		drawerSubmitLoading.value = false;
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

	const result: EmbeddedPlaceholderDrawerSubmitResult = {
		mainPageActivity: currentMainPageActivity.value,
		relatedPageActivity: currentRelatedPageActivity.value,
		loadingCallback,
		closeCallback,
	};

	resolvePromise(result);
	loadingCallback();

};

const drawerSubmitLoading = ref<boolean>(false);

defineExpose({
	openDrawer: EmbeddedPlaceholderDrawer.value.openDrawer, // 传递 openDrawer 方法
});
</script>

<template>
	<!-- Button Slot -->
	<slot v-bind="{ openDrawer: EmbeddedPlaceholderDrawer.openDrawer }"></slot>

	<!-- Drawer -->
	<n-drawer v-model:show="activeDrawer" width="100%" placement="right">
		<n-drawer-content
			body-content-class="auto-ui-drawer-content"
			:scrollbar-props="{
				trigger: 'none',
			}"
			:title="props.title"
			closable>
			<n-input-group>
				<n-input-group-label size="large">主页面Activity</n-input-group-label>
				<n-input
					size="large"
					v-model:value="currentMainPageActivity"
					:allow-input="(value: string) => validateFun.vaildateActivityName(value)"
					placeholder="请输入主页面Activity" />
			</n-input-group>
			<n-input-group>
				<n-input-group-label size="large">关联页面Activity</n-input-group-label>
				<n-input
					size="large"
					v-model:value="currentRelatedPageActivity"
					:allow-input="(value: string) => validateFun.vaildateActivityName(value)"
					placeholder="请输入关联页面Activity" />
			</n-input-group>
			<template #footer>
				<n-button type="info" v-model:loading="drawerSubmitLoading" @click="() => handleDrawerSubmit()">
					提交
				</n-button>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>

<style scoped></style>
