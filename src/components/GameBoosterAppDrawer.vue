<script setup lang="tsx">
import { computed, onMounted, reactive, readonly, ref, watch, type CSSProperties } from 'vue';
import { useDeviceStore } from '@/stores/device';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type NInput } from 'naive-ui';
import * as validateFun from '@/utils/validateFun';
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import type AutoUIItem from '@/types/AutoUIItem';
import { useAutoUIStore } from '@/stores/autoui';
import { useDotBlackListStore } from '@/stores/dotBlackList';
const dotBlackListStore = useDotBlackListStore();
import { useLogsStore } from '@/stores/logs';
import {
	gameRatioOptions,
	gameGravityOptions,
	type GameGravityOptions,
	type GameRatioOptions,
} from '@/constant/gameBooster';
import { mapKeys } from 'lodash-es';
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
const GAME_RATIO_OPTIONS = gameRatioOptions([
	{
		label: '自定义',
		value: 'custom',
		type: 'primary',
		color: {
			color: 'rgba(155, 89, 182, 0.1)',
			borderColor: 'rgba(155, 89, 182, 0.3)',
			textColor: '#9b59b6',
		},
	},
]);
const GAME_RATIO_VALUE_MAP = mapKeys(GAME_RATIO_OPTIONS, item => item.value);
const GAME_GRAVITY_OPTIONS = gameGravityOptions();
const GAME_GRAVITY_VALUE_MAP = mapKeys(GAME_GRAVITY_OPTIONS, item => item.value);
const deviceStore = useDeviceStore();
const autoUIStore = useAutoUIStore();
const logsStore = useLogsStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
export interface GameBoosterAppSubmitResult {
	appName: string;
	packageName: string;
	gameRatio: string;
	gameGravity: string;
	loadingCallback: () => void;
	closeCallback: () => void;
}

export interface GameBoosterAppInput {
	appName: string;
	packageName: string;
	gameRatio: string;
	gameGravity: string;
}

let resolvePromise: (result: GameBoosterAppSubmitResult) => void; // 用于保存Promise的resolve
let rejectPromise: (reason?: any) => void; // 用于保存Promise的reject

const GameBoosterAppDrawer = ref({
	openDrawer: (initialParams?: GameBoosterAppInput): Promise<GameBoosterAppSubmitResult> => {
		return new Promise((resolve, reject) => {
			if (props.type === 'update' && !initialParams) {
				reject(new Error('更新模式下必须传入初始化参数'));
				message.error('初始化参数不能为空');
				return;
			}

			if (props.type === 'update') {
				currentPackageName.value = initialParams?.packageName || '';
				currentAppName.value = initialParams?.appName || '';
				if (initialParams?.gameGravity) {
					currentGameGravity.value = GAME_GRAVITY_VALUE_MAP[initialParams.gameGravity];
				}
				if (initialParams?.gameRatio) {
					if (GAME_RATIO_VALUE_MAP[initialParams.gameRatio]) {
						currentGameRatio.value = GAME_RATIO_VALUE_MAP[initialParams.gameRatio];
						currentCustomGameRatio.value = initialParams.gameRatio;
					} else {
						currentGameRatio.value = GAME_RATIO_VALUE_MAP['custom'];
						currentCustomGameRatio.value = initialParams.gameRatio;
					}
				}
			}

			// 保存Promise的resolve和reject
			resolvePromise = resolve;
			rejectPromise = reject;

			activeDrawer.value = true; // 打开drawer
		});
	},
	closeDrawer: () => {
		activeDrawer.value = false; // 关闭drawer
		rejectPromise('Drawer closed without submission'); // 当关闭抽屉时，Promise被拒绝
	},
});

const currentAppName = ref<string>('');
const currentPackageName = ref<string>('');

const currentGameGravity = ref<GameGravityOptions>(GAME_GRAVITY_OPTIONS[0]);

const currentGameRatio = ref<GameRatioOptions>(GAME_RATIO_OPTIONS[0]);

const currentCustomGameRatio = ref<string>('');

const handleSelectGameRatio = (key: string, option: GameRatioOptions) => {
	if (option.value === 'custom') {
		if (!deviceStore.ABTestInfo.GAME_BOOSTER_CUSTOM_RATIO) {
			modal.create({
				title: '无使用权限',
				type: 'warning',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							自定义游戏比例存在使用风险，如果配置了不恰当的自定义游戏比例，可能会触发部分游戏风控导致游戏账号被封！
						</p>
						<p>
							如仍然坚持使用自定义游戏比例，请通过做梦书的酷安动态获取自定义游戏比例的激活口令！(动态内容就有，无需私信，新功能不同口令也不相同)
						</p>
					</div>
				),
			});
			return;
		}
	}
	currentGameRatio.value = option;
	if (option.value === 'custom') {
		currentCustomGameRatio.value = '';
	} else {
		currentCustomGameRatio.value = option.value;
	}
};

const handleSelectGameGravity = (key: string, option: GameGravityOptions) => {
	currentGameGravity.value = option;
};

const handleDrawerSubmit = async () => {
	if (!currentCustomGameRatio.value) {
		modal.create({
			title: '游戏显示比例不能为空',
			type: 'error',
			preset: 'dialog',
			content: () => <p>噫？游戏显示比例不能为空（敲</p>,
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

	const result: GameBoosterAppSubmitResult = {
		appName: currentAppName.value,
		packageName: currentPackageName.value,
		gameGravity: currentGameGravity.value.value,
		gameRatio: currentCustomGameRatio.value,
		loadingCallback,
		closeCallback,
	};
	modal.create({
		title: '确认调整游戏显示布局吗？',
		type: 'warning',
		preset: 'dialog',
		content: () => {
			return (
				<p>
					调整后会改变游戏的显示比例，获得更大的游戏视野，但并非所有游戏都兼容游戏显示比例调整，且部分游戏可能会对游戏显示比例的修改作为风控管理，可能导致游戏账号被封禁，调整游戏显示布局前，即认可并了解这些须知。确定要继续吗？
				</p>
			);
		},
		positiveText: '确定调整',
		negativeText: '我再想想',
		onPositiveClick: async () => {
			resolvePromise(result);
			loadingCallback();
			closeCallback();
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
	openDrawer: GameBoosterAppDrawer.value.openDrawer, // 传递 openDrawer 方法
});
</script>

<template>
	<!-- Button Slot -->
	<slot v-bind="{ openDrawer: GameBoosterAppDrawer.openDrawer }"></slot>

	<!-- Drawer -->
	<n-drawer v-model:show="activeDrawer" :width="deviceStore.windowWidth >= 640 ? `450px` : `100%`" placement="right">
		<n-drawer-content
			body-content-class="auto-ui-drawer-content"
			:scrollbar-props="{
				trigger: 'none',
			}"
			:title="props.title"
			closable>
			<n-input-group>
				<n-input-group-label size="large">游戏名称</n-input-group-label>
				<n-input size="large" v-model:value="currentAppName" :readonly="true" placeholder="请输入游戏名称" />
			</n-input-group>
			<n-input-group class="mt-5">
				<n-input-group-label size="large">游戏包名</n-input-group-label>
				<n-input
					size="large"
					v-model:value="currentPackageName"
					:readonly="true"
					placeholder="请输入游戏包名" />
			</n-input-group>
			<n-card :bordered="false" title="游戏显示比例" size="small">
				<n-dropdown
					v-model:value="currentGameRatio"
					size="large"
					trigger="click"
					:options="GAME_RATIO_OPTIONS"
					@select="handleSelectGameRatio">
					<n-button block :type="currentGameRatio.type" :color="currentGameRatio.color?.textColor" dashed>
						{{ currentGameRatio.label }}
					</n-button>
				</n-dropdown>
				<n-input-group class="mt-5">
					<n-input
						type="number"
						ref="currentCustomGameRatioRef"
						:readonly="currentGameRatio.value !== 'custom'"
						v-model:value="currentCustomGameRatio"
						placeholder="请输入游戏显示比例" />
				</n-input-group>
			</n-card>
			<n-card :bordered="false" title="游戏显示位置" size="small">
				<n-dropdown
					v-model:value="currentGameGravity"
					size="large"
					trigger="click"
					:options="GAME_GRAVITY_OPTIONS"
					@select="handleSelectGameGravity">
					<n-button block :type="currentGameGravity.color" dashed>
						{{ currentGameGravity.label }}
					</n-button>
				</n-dropdown>
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
