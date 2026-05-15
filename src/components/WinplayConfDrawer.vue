<script setup lang="tsx">
import { ref, computed } from 'vue';
import JsonEditorVue from 'json-editor-vue';
import { Mode } from 'vanilla-jsoneditor';
import { useDeviceStore } from '@/stores/device';
import * as winplayHelper from '@/utils/winplayHelper';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';

const deviceStore = useDeviceStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});

const active = ref(false);
const jsonData = ref<ConfItem[]>([]);

// ==============================================
// 🔥 定义返回结果类型（固定 type，data 可选）
// ==============================================
export type EditorResult =
  | { type: 'submit'; data: string }
  | { type: 'closed' };

// 🔥 定义 Promise 解析函数类型
type ResolvePromise = (res: EditorResult) => void;
type RejectPromise = (err: unknown) => void;

// 🔥 严格类型声明
let resolvePromise: ResolvePromise;
let rejectPromise: RejectPromise;

/**
 * 校验 JSON 合法性
 */
interface ConfItem {
	name?: string;
	[key: string]: any;
}

/**
 * open
 */
function open(confText: string): Promise<EditorResult> {
	return new Promise((resolve, reject) => {
		try {
			jsonData.value = winplayHelper.confToJson(confText);
			active.value = true;

			// 类型安全赋值
			resolvePromise = resolve;
			rejectPromise = reject;
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * submit
 */
function submit() {
  try {
    if (typeof jsonData.value === 'string') {
      jsonData.value = JSON.parse(jsonData.value);
    }
		const result = winplayHelper.jsonToConf(jsonData.value);

		active.value = false;
    // ✅ 类型完全匹配
    resolvePromise({
      type: 'submit',
      data: result
    });
  } catch (e: any) {
    console.error(e);
		modal.create({
			title: '发生错误',
			type: 'error',
			preset: 'dialog',
			content: () => <p>{e.message}</p>,
			positiveText: '确定',
		});
	}
}

/**
 * close
 */
function close() {
	active.value = false;
  // ✅ 类型完全匹配
  resolvePromise({ type: 'closed' });
}

defineExpose({
	open,
	submit,
	close,
});
</script>

<template>
	<n-drawer v-model:show="active" width="100%">
		<n-drawer-content title="编辑云控配置">
			<JsonEditorVue :class="[deviceStore.isDarkMode ? 'jse-theme-dark' : '']" :mode="Mode.text" v-model="jsonData" />

			<template #footer>
				<n-space justify="end">
					<n-button @click="close">取消</n-button>
					<n-button type="primary" @click="submit">提交</n-button>
				</n-space>
			</template>
		</n-drawer-content>
	</n-drawer>
</template>