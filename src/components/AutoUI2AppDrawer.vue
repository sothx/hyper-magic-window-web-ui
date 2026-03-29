<script setup lang="tsx">
import { computed, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { useDeviceStore } from '@/stores/device';
import { useAutoUI2Store } from '@/stores/autoui2';
import {
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
} from 'naive-ui';
import * as validateFun from '@/utils/validateFun';
import type AutoUI2MergeRuleItem from '@/types/AutoUI2MergeRuleItem';
import type {
	AutoUI2Activity,
	AutoUI2Package,
	AutoUI2View,
	AutoUI2ViewPolicy,
} from '@/types/AutoUI2PackageRules';

const props = defineProps<{
	type: 'add' | 'update';
	title: string;
}>();

export interface AutoUI2DrawerSubmitResult {
	pkg: AutoUI2Package;
	loadingCallback: () => void;
	closeCallback: () => void;
}

const defaultViewPolicy = (): AutoUI2ViewPolicy => ({
	range: 0,
	policytype: 'column',
	oldcolumns: 0,
	newcolumns: 0,
	itemdecorationflag: 0,
	multisetflag: 0,
	resetflag: 0,
});

const emptyView = (): AutoUI2View => ({
	name: '',
	id: '',
	path: '',
});

const emptyActivity = (): AutoUI2Activity => ({
	name: '',
	policy: -1,
	view: [],
});

const emptyPackage = (): AutoUI2Package => ({
	name: '',
	enable: true,
	describe: undefined,
	optimizeWebView: false,
	activity: [emptyActivity()],
});

const mergeRowToPackage = (row: AutoUI2MergeRuleItem): AutoUI2Package => {
	if (row.autoUI2Rule) {
		return {
			name: row.name,
			...cloneDeep(row.autoUI2Rule),
			activity: (row.autoUI2Rule.activity || []).map(act => ({
				...cloneDeep(act),
				view: act.view ? cloneDeep(act.view) : [],
			})),
		};
	}
	return {
		...emptyPackage(),
		name: row.name,
	};
};

const deviceStore = useDeviceStore();
const autoUI2Store = useAutoUI2Store();

const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});

const activeDrawer = ref(false);
const draft = ref<AutoUI2Package>(emptyPackage());
const currentRuleMode = ref<AutoUI2MergeRuleItem['ruleMode']>();
const drawerSubmitLoading = ref(false);

let resolvePromise: (result: AutoUI2DrawerSubmitResult) => void;
let rejectPromise: (reason?: unknown) => void;

const viewPolicyEnabled = ref<Record<string, boolean>>({});

const viewKey = (ai: number, vi: number) => `${ai}-${vi}`;

const setViewPolicyFlag = (ai: number, vi: number, enabled: boolean) => {
	viewPolicyEnabled.value = { ...viewPolicyEnabled.value, [viewKey(ai, vi)]: enabled };
	if (enabled) {
		const v = draft.value.activity[ai]?.view?.[vi];
		if (v && !v.view_policy) {
			v.view_policy = defaultViewPolicy();
		}
	} else {
		const v = draft.value.activity[ai]?.view?.[vi];
		if (v) {
			delete v.view_policy;
		}
	}
};

const initViewPolicyFlags = () => {
	const next: Record<string, boolean> = {};
	draft.value.activity.forEach((act, ai) => {
		act.view?.forEach((v, vi) => {
			next[viewKey(ai, vi)] = Boolean(v.view_policy);
		});
	});
	viewPolicyEnabled.value = next;
};

const addActivity = () => {
	draft.value.activity.push(emptyActivity());
};

const removeActivity = (index: number) => {
	if (draft.value.activity.length <= 1) {
		message.warning('至少保留一个 Activity');
		return;
	}
	draft.value.activity.splice(index, 1);
	initViewPolicyFlags();
};

const addView = (actIndex: number) => {
	const act = draft.value.activity[actIndex];
	if (!act.view) act.view = [];
	act.view.push(emptyView());
};

const removeView = (actIndex: number, viewIndex: number) => {
	draft.value.activity[actIndex].view?.splice(viewIndex, 1);
	initViewPolicyFlags();
};

const openDrawer = (initialParams?: AutoUI2MergeRuleItem): Promise<AutoUI2DrawerSubmitResult> => {
	return new Promise((resolve, reject) => {
		if (props.type === 'update' && !initialParams) {
			reject(new Error('更新模式下必须传入初始化参数'));
			message.error('初始化参数不能为空');
			return;
		}

		// 检查定制模式
		if (!deviceStore.isPatchMode) {
			modal.create({
				title: '需要开启定制模式',
				type: 'warning',
				preset: 'dialog',
				content: () => (
					<p>
						操作应用布局优化 2.0 需要先开启
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							定制模式
						</span>
						，请先前往模块模式设置开启定制模式。
					</p>
				),
				positiveText: '确定',
			});
			reject(new Error('未开启定制模式'));
			return;
		}

		resolvePromise = resolve;
		rejectPromise = reject;

		if (props.type === 'add') {
			draft.value = emptyPackage();
			currentRuleMode.value = undefined;
		} else if (props.type === 'update' && initialParams) {
			draft.value = mergeRowToPackage(initialParams);
			currentRuleMode.value = initialParams.ruleMode;
		}
		initViewPolicyFlags();
		activeDrawer.value = true;
	});
};

const closeDrawer = () => {
	activeDrawer.value = false;
	rejectPromise('Drawer closed without submission');
};

const handleDrawerSubmit = () => {
	if (!draft.value.name?.trim()) {
		modal.create({
			title: '应用包名不能为空',
			type: 'error',
			preset: 'dialog',
			content: () => <p>应用包名不能为空</p>,
		});
		return;
	}
	if (props.type === 'add' && autoUI2Store.allPackageName.has(draft.value.name)) {
		modal.create({
			title: '应用已存在',
			type: 'error',
			preset: 'dialog',
			content: () => <p>该应用已在列表中，请使用「编辑」修改规则。</p>,
		});
		return;
	}
	for (let i = 0; i < draft.value.activity.length; i++) {
		const act = draft.value.activity[i];
		if (!act.name?.trim()) {
			modal.create({
				title: 'Activity 不完整',
				type: 'error',
				preset: 'dialog',
				content: () => <p>第 {i + 1} 个 Activity 的类名不能为空</p>,
			});
			return;
		}
		// 验证 view_policy 必填字段
		for (let vi = 0; vi < (act.view?.length || 0); vi++) {
			const view = act.view![vi];
			if (view.view_policy) {
				if (view.view_policy.range === 0 || view.view_policy.range === undefined) {
					modal.create({
						title: 'View Policy 不完整',
						type: 'error',
						preset: 'dialog',
						content: () => <p>第 {i + 1} 个 Activity 的第 {vi + 1} 个 View 的 range 不能为空</p>,
					});
					return;
				}
				if (view.view_policy.oldcolumns === 0 || view.view_policy.oldcolumns === undefined) {
					modal.create({
						title: 'View Policy 不完整',
						type: 'error',
						preset: 'dialog',
						content: () => <p>第 {i + 1} 个 Activity 的第 {vi + 1} 个 View 的 oldcolumns 不能为空</p>,
					});
					return;
				}
				if (view.view_policy.newcolumns === 0 || view.view_policy.newcolumns === undefined) {
					modal.create({
						title: 'View Policy 不完整',
						type: 'error',
						preset: 'dialog',
						content: () => <p>第 {i + 1} 个 Activity 的第 {vi + 1} 个 View 的 newcolumns 不能为空</p>,
					});
					return;
				}
			}
		}
	}

	drawerSubmitLoading.value = true;
	const loadingCallback = () => {
		drawerSubmitLoading.value = false;
	};
	const closeCallback = () => {
		drawerSubmitLoading.value = false;
		activeDrawer.value = false;
	};

	const pkg: AutoUI2Package = {
		...cloneDeep(draft.value),
		name: draft.value.name.trim(),
		activity: draft.value.activity.map(act => ({
			name: act.name.trim(),
			policy: Number(act.policy) || 0,
			view:
				act.view
					?.map(v => {
						const copy: AutoUI2View = {
							name: v.name?.trim() || undefined,
							id: v.id?.trim() || undefined,
							path: v.path?.trim() || undefined,
						};
						if (v.view_policy) {
							copy.view_policy = { ...v.view_policy };
						}
						return copy;
					})
					.filter(v => v.name || v.id || v.path || v.view_policy) || [],
		})),
	};

	modal.create({
		title: '确认保存应用布局优化 2.0 规则？',
		type: 'warning',
		preset: 'dialog',
		content: () => (
			<p>
				保存后规则将写入
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					{' '}
					自定义配置
				</span>
				，覆盖模块内同名应用规则。确定继续吗？
			</p>
		),
		positiveText: '确定保存',
		negativeText: '我再想想',
		onPositiveClick: () => {
			resolvePromise({
				pkg,
				loadingCallback,
				closeCallback,
			});
		},
		onNegativeClick: loadingCallback,
		onMaskClick: loadingCallback,
		onClose: loadingCallback,
	});
};

defineExpose({ openDrawer });
</script>

<template>
	<n-drawer v-model:show="activeDrawer" :width="deviceStore.windowWidth >= 640 ? `520px` : `100%`" placement="right">
		<n-drawer-content
			body-content-class="autoui2-drawer-content"
			:scrollbar-props="{ trigger: 'none' }"
			:title="props.title"
			closable
			@close="closeDrawer">
			<n-input-group class="mb-4">
				<n-input-group-label size="large">应用包名</n-input-group-label>
				<n-input
					size="large"
					v-model:value="draft.name"
					:readonly="props.type === 'update'"
					:allow-input="(value: string) => validateFun.validateAndroidPackageName(value)"
					placeholder="请输入应用包名" />
			</n-input-group>

			<n-alert v-if="currentRuleMode === 'custom'" type="info" class="mb-3">
				当前为
				<n-tag :bordered="false" type="info">自定义规则</n-tag>
				；清除自定义后将恢复模块规则（若模块中存在）。
			</n-alert>

			<n-card :bordered="false" title="包属性" size="small" class="mb-3">
				<div class="mb-3 flex flex-wrap items-center gap-4">
					<span class="text-sm">启用规则</span>
					<n-switch v-model:value="draft.enable" />
				</div>
				<n-input-group class="mb-3">
					<n-input-group-label size="medium">描述</n-input-group-label>
					<n-input v-model:value="draft.describe" placeholder="可选，如应用中文名" clearable />
				</n-input-group>
				<div class="flex flex-wrap items-center gap-4">
					<span class="text-sm">WebView 优化</span>
					<n-switch v-model:value="draft.optimizeWebView" />
				</div>
			</n-card>

			<n-card :bordered="false" title="Activity 与 View" size="small" class="mb-3">
				<p :class="`mb-3 text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`">
					与模块 autoui2_list.xml 结构一致；policy 为整数，常见 -1 表示仅禁用优化；带 View 时需填写 id/path 等。
				</p>

				<div v-for="(act, ai) in draft.activity" :key="ai" class="mb-4 rounded border border-dashed p-3" :class="deviceStore.isDarkMode ? 'border-zinc-600' : 'border-gray-300'">
					<div class="mb-2 flex items-center justify-between">
						<span class="font-medium">Activity {{ ai + 1 }}</span>
						<n-button size="tiny" quaternary type="error" @click="removeActivity(ai)">删除</n-button>
					</div>
					<n-input-group class="mb-2">
						<n-input-group-label size="small">类名</n-input-group-label>
						<n-input v-model:value="act.name" size="small" placeholder="完整 Activity 类名" />
					</n-input-group>
					<n-input-group class="mb-3">
						<n-input-group-label size="small">policy</n-input-group-label>
						<n-input-number v-model:value="act.policy" size="small" class="min-w-[120px]" />
					</n-input-group>

					<div v-for="(vw, vi) in act.view || []" :key="vi" class="mb-3 ml-2 border-l-2 pl-3" :class="deviceStore.isDarkMode ? 'border-teal-700' : 'border-teal-200'">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm">View {{ vi + 1 }}</span>
							<n-button size="tiny" quaternary type="error" @click="removeView(ai, vi)">删除</n-button>
						</div>
						<n-input-group size="small" class="mb-2">
							<n-input-group-label>name</n-input-group-label>
							<n-input v-model:value="vw.name" placeholder="可选" size="small" />
						</n-input-group>
						<n-input-group size="small" class="mb-2">
							<n-input-group-label>id</n-input-group-label>
							<n-input v-model:value="vw.id" placeholder="控件 id" size="small" />
						</n-input-group>
						<n-input-group size="small" class="mb-2">
							<n-input-group-label>path</n-input-group-label>
							<n-input v-model:value="vw.path" placeholder="路径" size="small" />
						</n-input-group>
						<div class="mb-2 flex items-center gap-2">
							<n-switch
								:value="viewPolicyEnabled[viewKey(ai, vi)]"
								@update:value="(v: boolean) => setViewPolicyFlag(ai, vi, v)" />
							<span class="text-xs font-medium">view_policy</span>
							<span
								:class="`text-xs ${deviceStore.isDarkMode ? 'text-gray-500' : 'text-gray-500'}`">
								（与 XML 中属性一一对应）
							</span>
						</div>
						<div
							v-if="viewPolicyEnabled[viewKey(ai, vi)] && vw.view_policy"
							class="rounded-md p-2"
							:class="deviceStore.isDarkMode ? 'bg-zinc-800/80' : 'bg-gray-50'">
							<p
								:class="`mb-2 text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`">
								对应元素示例：
								<code
									class="block mt-1 rounded px-1.5 py-1 text-[11px] break-all"
									:class="deviceStore.isDarkMode ? 'bg-zinc-900 text-teal-300' : 'bg-white text-gray-800'">
									&lt;view_policy range="?" policytype="?" oldcolumns="?" newcolumns="?"
									itemdecorationflag="?" multisetflag="?" resetflag="?" /&gt;
								</code>
							</p>

							<div class="space-y-3">
								<div>
									<div class="mb-1 flex flex-wrap items-baseline gap-2">
										<code
											class="rounded px-1 text-xs font-semibold"
											:class="deviceStore.isDarkMode ? 'bg-zinc-900 text-amber-300' : 'bg-amber-100 text-amber-900'">
											range
										</code>
										<span :class="`text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`">
											作用层级 / 范围（整数）
										</span>
									</div>
									<n-input-number v-model:value="vw.view_policy.range" size="small" class="w-full max-w-xs" />
								</div>
								<n-input-group size="small" class="!flex-nowrap">
									<n-input-group-label class="!min-w-[7.5rem] whitespace-nowrap shrink-0">
										policytype
									</n-input-group-label>
									<div class="min-w-0 flex-1">
										<n-input
											v-model:value="vw.view_policy.policytype"
											size="small"
											placeholder="如 column" />
										<p :class="`mt-0.5 text-[11px] ${deviceStore.isDarkMode ? 'text-gray-500' : 'text-gray-500'}`">
											列策略类型，常见：<code class="text-xs">column</code>
										</p>
									</div>
								</n-input-group>
								<div>
									<div class="mb-1 flex flex-wrap items-baseline gap-2">
										<code
											class="rounded px-1 text-xs font-semibold"
											:class="deviceStore.isDarkMode ? 'bg-zinc-900 text-amber-300' : 'bg-amber-100 text-amber-900'">
											oldcolumns
										</code>
										<span :class="`text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`">
											优化前列数
										</span>
									</div>
									<n-input-number v-model:value="vw.view_policy.oldcolumns" size="small" class="w-full max-w-xs" />
								</div>
								<div>
									<div class="mb-1 flex flex-wrap items-baseline gap-2">
										<code
											class="rounded px-1 text-xs font-semibold"
											:class="deviceStore.isDarkMode ? 'bg-zinc-900 text-amber-300' : 'bg-amber-100 text-amber-900'">
											newcolumns
										</code>
										<span :class="`text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`">
											优化后列数
										</span>
									</div>
									<n-input-number v-model:value="vw.view_policy.newcolumns" size="small" class="w-full max-w-xs" />
								</div>
								<div>
									<div class="mb-1 flex flex-wrap items-baseline gap-2">
										<code
											class="rounded px-1 text-xs font-semibold"
											:class="deviceStore.isDarkMode ? 'bg-zinc-900 text-amber-300' : 'bg-amber-100 text-amber-900'">
											itemdecorationflag
										</code>
										<span :class="`text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`">
											列表项装饰相关标记（0/1）
										</span>
									</div>
									<n-input-number v-model:value="vw.view_policy.itemdecorationflag" size="small" class="w-full max-w-xs" />
								</div>
								<div>
									<div class="mb-1 flex flex-wrap items-baseline gap-2">
										<code
											class="rounded px-1 text-xs font-semibold"
											:class="deviceStore.isDarkMode ? 'bg-zinc-900 text-amber-300' : 'bg-amber-100 text-amber-900'">
											multisetflag
										</code>
										<span :class="`text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`">
											多集合 / 多类型列表标记（0/1）
										</span>
									</div>
									<n-input-number v-model:value="vw.view_policy.multisetflag" size="small" class="w-full max-w-xs" />
								</div>
								<div>
									<div class="mb-1 flex flex-wrap items-baseline gap-2">
										<code
											class="rounded px-1 text-xs font-semibold"
											:class="deviceStore.isDarkMode ? 'bg-zinc-900 text-amber-300' : 'bg-amber-100 text-amber-900'">
											resetflag
										</code>
										<span :class="`text-xs ${deviceStore.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`">
											重置策略标记（0/1）
										</span>
									</div>
									<n-input-number v-model:value="vw.view_policy.resetflag" size="small" class="w-full max-w-xs" />
								</div>
							</div>
						</div>
					</div>
					<n-button dashed size="small" block @click="addView(ai)">添加 View</n-button>
				</div>
				<n-button dashed size="small" type="primary" block @click="addActivity">添加 Activity</n-button>
			</n-card>

			<template #footer>
				<n-button type="info" :loading="drawerSubmitLoading" @click="handleDrawerSubmit">保存</n-button>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>
