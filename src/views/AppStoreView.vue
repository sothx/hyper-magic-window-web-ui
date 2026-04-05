<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { useAppStore } from '@/stores/appStore';
import * as deviceApi from '@/apis/deviceApi';
import PinyinMatch from 'pinyin-match';
import { computed, onMounted, ref } from 'vue';
import { RenderJsx } from '@/components/RenderJSX';
import { createDiscreteApi, darkTheme, lightTheme, NInput, type ConfigProviderProps } from 'naive-ui';
import type { JSX } from 'vue/jsx-runtime';
import { MagnifyingGlassIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
import axios from 'axios';
const deviceStore = useDeviceStore();
const appStore = useAppStore();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const searchKeyword = ref('');
const isRefreshingDownloadUrl = ref(false);
const appStoreSeenVersionAtEnter = ref(0);
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const getAppDownload = async (title: string, url: string, type: 'system' | 'revision' | 'original' | 'magisk') => {
	modal.create({
		title: `获取${title}`,
		type: 'info',
		preset: 'dialog',
		content: () => (
			<div>
				<p>
					确定要下载{title}么？请注意核对部分应用的兼容性。
					{type === 'system' && (
						<span>（Tips: 系统应用无法通过小米自带的应用包管理器安装，请通过MT管理器安装！）</span>
					)}
					{type === 'revision' && <span>（Tips: 修改版需搭配核心破解并通过MT管理器安装）</span>}
					{type === 'magisk' && <span>（Tips: Magisk模块请通过ROOT管理器进行安装）</span>}
				</p>
				<p>下载地址:</p>
				<p>{url}</p>
			</div>
		),
		positiveText: '复制下载链接到剪切板',
		negativeText: '取消',
		onPositiveClick: () => {
			navigator.clipboard.writeText(url);
			deviceApi.openChinaMobileMCloud();
		},
	});
};

export interface AppInfo {
	id: string;
	title: string;
	packageName?: string;
	description: () => JSX.Element;
	url: string;
	versionNum: number;
	type: 'info' | 'error' | 'warning' | 'success' | 'default';
	image: string;
	tag: 'system' | 'revision' | 'original' | 'magisk';
	isShow?: () => boolean; // 可选，返回是否显示
}



const getRemoteDownloadAppMap = async () => {
  isRefreshingDownloadUrl.value = true;
  try {
    await appStore.syncRemoteDownloadAppUrlMap();
    message.success('更新下载地址成功！')
  } catch (error) {
			message.error('更新下载地址失败，请检查网络');
  } finally {
    isRefreshingDownloadUrl.value = false;
  }
};

const filteredAppList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  // 先过滤
  const filtered = appStore.mergedAppList.filter((item) => {
    const showFlag = item.isShow ? item.isShow() : true;
    if (!showFlag) return false;
    if (!keyword) return true;

    const titleStr = item.title?.toLowerCase?.() ?? '';
    return titleStr.includes(keyword) || PinyinMatch.match(titleStr, keyword) !== false;
  });

  // 只按 versionNum 降序排列
  return filtered.sort((a, b) => {
    return (b.versionNum || 0) - (a.versionNum || 0);
  });
});

</script>
<template>
	<div class="setting">
		<div class="mt-5">
			<div class="px-4 sm:px-0">
				<h3 class="text-base font-semibold leading-7">
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
						">
						精选应用
					</span>
				</h3>
				<p
					v-if="['phone'].includes(deviceStore.deviceType)"
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					这里罗列了一些作者认为不错的应用作为精选推荐应用
				</p>
				<p
					v-if="['tablet', 'fold'].includes(deviceStore.deviceType)"
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					这里罗列了一些适配大屏良好的应用作为精选推荐应用
				</p>
				<p
					v-if="['tablet', 'fold'].includes(deviceStore.deviceType)"
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					部分增强小米大屏系统体验的大屏应用也罗列在此
				</p>
			</div>

			<n-card size="small" class="mt-5">
				<div class="flex flex-wrap">
						<n-button
							@click="getRemoteDownloadAppMap()"
							:loading="isRefreshingDownloadUrl"
							class="mb-3 mr-3"
							type="success">
							<template #icon>
								<n-icon>
									<ArrowPathIcon />
								</n-icon>
							</template>
							更新下载地址
						</n-button>
					<!-- <n-button class="mb-3 mr-3" color="#69b2b6">
						<template #icon>
							<n-icon>
								<CircleStackIcon />
							</n-icon>
						</template>
						获取已安装应用名称
					</n-button> -->
				</div>
				<div class="flex">
					<n-input-group>
						<n-input
							size="large"
							clearable
							v-model:value="searchKeyword"
							ref="searchKeyWordInput"
							placeholder="搜索应用名称"
							class="w-4/5" />
						<n-button
							size="large"
							type="primary"
							@click="
								() => {
									searchKeyWordInput?.blur();
								}
							">
							<template #icon>
								<n-icon>
									<MagnifyingGlassIcon />
								</n-icon>
							</template>
							<span class="hidden sm:inline-block">搜索</span>
						</n-button>
						<n-button
							size="large"
							bordered
							@click="
								() => {
									searchKeyword = '';
								}
							">
							<template #icon>
								<n-icon>
									<XCircleIcon />
								</n-icon>
							</template>
							<span class="hidden sm:inline-block">清空</span>
						</n-button>
					</n-input-group>
				</div>
			</n-card>

			<div class="mt-6 border-gray-100">
				<dl class="mb-5 divide-gray-100">
					<div v-for="app in filteredAppList" :key="app.title" class="mt-5 flex px-4 sm:grid sm:px-0">
						<n-alert class="w-full" :type="app.type">
							<template #icon>
								<img :src="app.image" />
							</template>
              <template #header>
								<span>{{ app.title }}</span>
							</template>
							<RenderJsx v-if="app.description" :content="app.description && app.description()" />
							<p class="mt-2 text-sm opacity-80">{{ `版本号：${app.versionNum}` }}</p>
							<n-button
								class="mt-2"
								strong
								secondary
								:type="app.type"
								@click="() => getAppDownload(app.title, app.url, app.tag)">
								获取{{ app.title }}
							</n-button>
						</n-alert>
					</div>
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
