<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { nextTick, onMounted, watchEffect, ref, type CSSProperties, computed } from 'vue';
import hljs from 'highlight.js/lib/core';
import * as deviceApi from '@/apis/deviceApi';
import { useLogsStore } from '@/stores/logs';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps, type LogInst } from 'naive-ui';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, TrashIcon, FolderIcon } from '@heroicons/vue/24/outline';
const logsStore = useLogsStore();
const deviceStore = useDeviceStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});

const customLanguage = {
	name: 'log',
	contains: [
		{
			className: 'webui-log !text-green-600',
			begin: '\\[success\\]',
			end: '$',
			relevance: 10,
		},
		{
			className: 'webui-log !text-sky-600',
			begin: '\\[info\\]',
			end: '$',
			relevance: 10,
		},
		{
			className: 'webui-log !text-red-600',
			begin: '\\[error\\]',
			end: '$',
			relevance: 10,
		},
	],
};

hljs.registerLanguage('webui-log', () => customLanguage);

const logInstRef = ref<LogInst | null>(null);

const scrollToBottom = () => {
	logInstRef.value?.scrollTo({ position: 'bottom', silent: true });
	message.info('已到达日志底部~');
};

const scrollToTop = () => {
	logInstRef.value?.scrollTo({ position: 'top', silent: true });
	message.info('已到达日志顶部~');
};

const cleanLogs = () => {
	logsStore.content = '';
	message.success('清空日志成功~');
};

const saveLogs = () => {
	const currentTimestamp = new Date().getTime();
	deviceApi
		.saveLogs(logsStore.content, currentTimestamp)
		.then(res => {
			modal.create({
				title: '保存成功',
				type: 'success',
				preset: 'dialog',
				content: () => <p>日志保存成功，日志保存在/data/adb/MIUI_MagicWindow+/logs-{currentTimestamp}.txt</p>,
				negativeText: '确定',
			});
		})
		.catch(err => {
			modal.create({
				title: '保存失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>日志保存失败，可能目录没有写入权限，请检查~</p>,
				negativeText: '确定',
			});
		});
};

onMounted(() => {
	watchEffect(() => {
		if (logsStore.content) {
			setTimeout(() => {
				logInstRef.value?.scrollTo({ position: 'bottom', silent: true });
			},0);
		}
	});
});
</script>
<template>
	<div class="setting">
		<div class="mt-3">
			<div class="px-3 sm:px-0">
				<h3
					:class="`text-base font-semibold leading-7`"
					>
					<span class="font-semibold animated-bg bg-clip-text text-transparent" style="background-image: linear-gradient(101.22deg, rgb(255, 182, 133) -18.32%, rgb(255, 111, 29) 7.01%, rgb(252, 181, 232) 41.59%, rgb(135, 148, 255) 70.98%, rgb(60, 112, 255) 91.35%, rgb(60, 112, 255) 110.17%);">日志记录</span>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					在这里可以查看本次 Web UI 运行中产生的日志
				</p>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					若有影响使用的问题可以通过酷安/Github/模块反馈群上进行反馈
				</p>
			</div>
			<n-card :bordered="true" class="mt-3" size="small">
				<div class="flex flex-wrap">
					<n-button
						class="mr-3 mb-3"
						type="info"
						@click="
							() => {
								scrollToTop();
							}
						">
						<template #icon>
							<ArrowUpCircleIcon />
						</template>
						回到顶部
					</n-button>
					<n-button
						class="mr-3 mb-3"
						type="error"
						@click="
							() => {
								scrollToBottom();
							}
						">
						<template #icon>
							<ArrowDownCircleIcon />
						</template>
						回到底部
					</n-button>
					<n-button
						class="mr-3 mb-3"
						type="success"
						@click="
							() => {
								cleanLogs();
							}
						">
						<template #icon>
							<TrashIcon />
						</template>
						清空日志
					</n-button>
					<n-button
						class="mr-3 mb-3"
						type="warning"
						@click="
							() => {
								saveLogs();
							}
						">
						<template #icon>
							<FolderIcon />
						</template>
						保存日志
					</n-button>
				</div>
				<div class="mt-3 border-t border-gray-100">
					<n-space vertical>
						<n-log
							:hljs="hljs"
							ref="logInstRef"
							:row="20"
							line-height="2"
							font-size="12"
							:log="logsStore.content"
							language="webui-log"
							trim />
					</n-space>
				</div>
			</n-card>
		</div>
	</div>
</template>

<style>
.hljs-webui-log {
	color: rgb(22 163 74);
}
</style>
