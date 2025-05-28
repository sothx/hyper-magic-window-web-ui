<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { marked } from 'marked';
import * as deviceApi from '@/apis/deviceApi';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watchEffect, type CSSProperties } from 'vue';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import axios from 'axios';
const deviceStore = useDeviceStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const isNeedUpdated = ref(false);
const updateMsgRef = ref<HTMLElement | null>(null);
const compiledChangeLog = computed(() => {
	return marked(deviceStore.changeLogMsg);
});
watchEffect(async () => {
  const id = 'github-markdown-style';
  const oldStyle = document.getElementById(id);
  if (oldStyle) oldStyle.remove();

  let cssModule: { default: string };

  if (deviceStore.isDarkMode) {
    cssModule = await import('github-markdown-css/github-markdown-dark.css?inline');
  } else {
    cssModule = await import('github-markdown-css/github-markdown-light.css?inline');
  }

  const styleEl = document.createElement('style');
  styleEl.id = id;
  styleEl.textContent = cssModule.default;
  document.head.appendChild(styleEl);
});
function handleClick(event: { target: any; preventDefault: () => void }) {
	// 判断事件目标是否是 a 标签，或者其祖先节点中是否包含 a 标签
	let target = event.target;
	while (target && target !== updateMsgRef.value) {
		if (target.tagName === 'A') {
			event.preventDefault();
			deviceApi.openUrl(target.href);
			console.log('事件代理拦截了链接', target.href);
			break;
		}
		target = target.parentElement;
	}
}
const downloadUpdate = () => {
	const currentChinaMobileMCloudUrl = deviceStore.moduleUpdateInfo?.chinaMobileMCloudUrl;
	if (currentChinaMobileMCloudUrl) {
		navigator.clipboard.writeText(currentChinaMobileMCloudUrl);
		deviceApi.openChinaMobileMCloud();
	}
};
onMounted(() => {
	const moduleVerCode = deviceStore.moduleInfo?.versionCode;
	const currentUpdateVerCode = deviceStore.moduleUpdateInfo?.versionCode;
	if (moduleVerCode && currentUpdateVerCode && currentUpdateVerCode > moduleVerCode) {
		isNeedUpdated.value = true;
	}
});
</script>
<template>
	<div class="update-msg">
		<div class="mt-3">
			<div class="px-3 sm:px-0">
				<h3 :class="`text-base font-semibold leading-7`">
					<span
						class="animated-bg bg-clip-text font-semibold text-transparent"
						style="
							background-image: linear-gradient(
								101.22deg,
								rgb(255, 182, 133) -18.32%,
								rgb(255, 111, 29) 7.01%,
								rgb(252, 181, 232) 41.59%,
								rgb(135, 148, 255) 70.98%,
								rgb(60, 112, 255) 91.35%,
								rgb(60, 112, 255) 110.17%
							);
						"
						>更新日志</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					在这里可以查看模块的最新更新日志
				</p>
			</div>
		</div>
		<n-card class="mt-5" size="small">
			<n-alert v-if="isNeedUpdated" class="mb-3" :show-icon="true" type="info">
				<p
					>完美横屏应用计划已更新至
					{{ deviceStore.moduleUpdateInfo?.version }}，您可以从网盘或者Github获取最新版本的模块。</p
				>
				<p>下载地址:{{ deviceStore.moduleUpdateInfo?.chinaMobileMCloudUrl }}</p>
			</n-alert>
			<div class="flex flex-wrap">
				<n-button class="mr-3" @click="downloadUpdate()" type="info"> 从移动网盘下载更新 </n-button>
			</div>
		</n-card>
		<div class="my-5">
			<div
				ref="updateMsg"
				@click="handleClick"
				:class="`markdown-body border ${deviceStore.isDarkMode ? 'divide-sothx-gray-color border-sothx-gray-color' : 'divide-gray-200 border-gray-200'} p-5`"
				v-html="compiledChangeLog">
			</div>
		</div>
	</div>
</template>

<style></style>
