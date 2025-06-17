<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { computed, h, ref, type CSSProperties } from 'vue';
import * as deviceApi from '@/apis/deviceApi';
import { useZRAMWriteback } from '@/hooks/useZRAMWriteback';
import { useUFSHealth } from '@/hooks/useUFSHealth';
import { useFbo } from '@/hooks/useFbo';
import { RenderJsx } from '@/components/RenderJSX';
import { MagnifyingGlassIcon, CircleStackIcon, XCircleIcon, SquaresPlusIcon } from '@heroicons/vue/24/outline';
import type { JSX } from 'vue/jsx-runtime';
import type { NInput } from 'naive-ui';
import { divide } from 'lodash-es';
const deviceStore = useDeviceStore();
const ZRAMWritebackHook = useZRAMWriteback();
const useUFSHealthHook = useUFSHealth();
const fboHook = useFbo();
const searchKeyword = ref('');
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
	const style: CSSProperties = {};
	if (checked) {
		style.background = '#d03050';
		if (focused) {
			style.boxShadow = '0 0 0 2px #d0305040';
		}
	} else {
		style.background = '#2080f0';
		if (focused) {
			style.boxShadow = '0 0 0 2px #2080f040';
		}
	}
	return style;
};
export interface HealthItemInfo {
	title: string;
	titleSlot?: () => JSX.Element;
	content: () => JSX.Element;
	isShow?: () => boolean;
}
const healthList: HealthItemInfo[] = [
	{
		title: '设备DDR和UFS信息',
		content: () => <div class='whitespace-pre'>{deviceStore.deviceInfo.memoryInfo || '获取失败'}</div>,
		isShow: () => Boolean(deviceStore.deviceInfo.memoryInfo),
	},
	{
		title: '设备DDR生产厂商',
		content: () => <div class='whitespace-pre'>{deviceStore.DDRVendor}</div>,
		isShow: () => Boolean(deviceStore.DDRVendor),
	},
	{
		title: 'ZRAM Writeback',
		content: () => (
			<>
				{deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35 && (
					<div class='mb-3'>
						<n-tag>dm设备映射器: {ZRAMWritebackHook.miuiExtmDmOptEnable.value ? '启用' : '未启用'}</n-tag>
					</div>
				)}
				<div class='mb-3'>
					<n-tag type='error'>回写块: {ZRAMWritebackHook.backingDev.value} </n-tag>
				</div>
				<div class='mb-3'>
					<n-tag type='success'>已回写: {ZRAMWritebackHook.hasWriteBack.value} MB</n-tag>
				</div>
				<div class='mb-3'>
					<n-tag type='info'>总读取: {ZRAMWritebackHook.totalRead.value} MB</n-tag>
				</div>
				<div>
					<n-tag type='warning'>总回写: {ZRAMWritebackHook.totalWriteBack.value} MB</n-tag>
				</div>
				<n-alert class='mt-5' type='warning' show-icon={false} bordered={false}>
					<p>
						通常用于将设备上的冷数据压缩并迁移到磁盘上，是基于「内存扩展」的回写块，该功能依赖「内存扩展」，请确保已经开启「内存扩展」，总回写可以大于「内存扩展」，初始状态下显示
						0 MB是正常现象，请持续使用一段时间再观察是否有变化
					</p>
				</n-alert>
			</>
		),
		isShow: () =>
			Boolean(
				deviceStore.MIOSVersion &&
					deviceStore.MIOSVersion >= 2 &&
					deviceStore.androidTargetSdk >= 35 &&
					ZRAMWritebackHook.isInit.value,
			),
	},
	{
		title: 'UFS 存储健康',
		content: () => (
			<>
				<div class='mb-3'>
					{useUFSHealthHook.correctedPreEOLStatus.value && (
						<div class='mb-3'>
							<n-tag type='info'>寿命阶段: {useUFSHealthHook.correctedPreEOLStatus.value}</n-tag>
						</div>
					)}
					{useUFSHealthHook.deviceLifeTimeEstA.value && (
						<div class='mb-3'>
							<n-tag type='success'>
								用户数据区(已磨损): {useUFSHealthHook.deviceLifeTimeEstA.value}
							</n-tag>
						</div>
					)}
					{useUFSHealthHook.deviceLifeTimeEstB.value && (
						<div class='mb-3'>
							<n-tag type='warning'>
								高速缓存区(已磨损): {useUFSHealthHook.deviceLifeTimeEstB.value}
							</n-tag>
						</div>
					)}
				</div>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>
						数据仅供参考，通常仅代表当前 UFS 存储设备循环擦写次数与预期设计寿命的比值，不代表 UFS
						存储设备的实际磨损状况，但仍然建议当前 UFS 存储设备接近预期设计寿命时选择更换存储设备。
					</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(useUFSHealthHook.isShow.value),
	},
	{
		title: '焕新存储',
		content: () => (
			<>
				<n-button
					size='small'
					type='info'
					secondary
					loading={deviceStore.loading}
					onClick={() => deviceApi.openFboResultActivity()}>
					打开 焕新存储信息面板
				</n-button>

				<n-alert class='mb-5 mt-5' type='success' show-icon={false} bordered={false}>
					<div>
						<p>
							焕新存储启用状态:
							<n-button
								size='tiny'
								class='ml-3'
								type={fboHook.fboEnable.value ? 'success' : 'error'}
								loading={deviceStore.loading}
								onClick={() => fboHook.handleEnableFbo()}>
								{fboHook.fboEnable.value ? '已启用' : '未启用(点击启用)'}
							</n-button>
						</p>
						<p>
							启用状态通常由小米云控控制，模块支持强制启用焕新存储，但该功能受系统底层支持情况而异，不支持的设备即使启用也不会生效。
						</p>
						<n-switch
							onUpdateValue={(value: boolean) => fboHook.changeIsAutoEnableFbo(value)}
							rail-style={railStyle}
							value={fboHook.isAutoStartFbo.value ? true : false}
							loading={deviceStore.loading}>
							{{
								checked: () => <>已强制启用焕新存储</>,
								unchecked: () => <>跟随系统默认云控规则</>,
							}}
						</n-switch>
					</div>
				</n-alert>

				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>
						焕新存储激活状态:
						<n-button
							size='tiny'
							class='ml-3'
							type={fboHook.fboServiceCtrl.value ? 'success' : 'error'}
							loading={deviceStore.loading}
							onClick={() => fboHook.handleEnableFboServiceCtrl()}>
							{fboHook.fboServiceCtrl.value ? '已激活' : '未激活(点击激活)'}
						</n-button>
					</p>
					{fboHook.fboInstalld.value && (
						<p class='mt-1'>
							焕新存储运行状态:
							<n-tag
								size='small'
								class='ml-3'
								type='info'
								loading={deviceStore.loading}
								onClick={() => {}}>
								{fboHook.fboInstalld.value}
							</n-tag>
						</p>
					)}
					<p>激活后仍然需要满足以下条件才会在特定时间触发焕新存储：</p>
					<p>①夜间12点半-凌晨5点</p>
					<p>②息屏状态</p>
					<p>③电量大于75%(或保持手机充电)</p>
					<p>④电池温度小于40℃</p>
					<p>
						进行焕新存储期间检测到其中任意条件不满足，焕新存储会被中断，待满足后继续执行，当满足上述4个条件后，此功能也并不是每天都生效，需要文件碎片累积到一定程度会主动进行。
					</p>
					<p>（焕新存储流程结束后，激活状态会被关闭，您可以前往Web UI 重新激活）</p>
					<n-switch
						onUpdateValue={(value: boolean) => fboHook.changeIsAutoRegularlyFbo(value)}
						rail-style={railStyle}
						value={fboHook.isAutoRegularlyFbo.value ? true : false}
						loading={deviceStore.loading}>
						{{
							checked: () => <>已启用每日闲时维护</>,
							unchecked: () => <>未启用每日闲时维护</>,
						}}
					</n-switch>
				</n-alert>
			</>
		),
		isShow: () => Boolean(fboHook.isInit.value),
	},
];
const filteredHealthList = computed(() => {
	const keyword = searchKeyword.value.toLowerCase();
	return healthList.filter(item => {
		const showFlag = item.isShow ? item.isShow() : true;
		if (!showFlag) return false;
		if (!keyword) return true;
		return item.title.toLowerCase().includes(keyword);
	});
});
</script>
<template>
	<div class="memoryHealth">
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
						>存储健康</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					存储健康，提供存储状态监测与优化管理。
				</p>
			</div>

			<n-card size="small" class="mt-5">
				<!-- <div class="flex flex-wrap">
					<n-button class="mb-3 mr-3" color="#8a2be2">
						<template #icon>
							<n-icon>
								<SquaresPlusIcon />
							</n-icon>
						</template>
						热重载应用数据
					</n-button>
					<n-button class="mb-3 mr-3" color="#69b2b6">
						<template #icon>
							<n-icon>
								<CircleStackIcon />
							</n-icon>
						</template>
						获取已安装应用名称
					</n-button>
				</div> -->
				<div class="flex">
					<n-input-group>
						<n-input
							size="large"
							clearable
							v-model:value="searchKeyword"
							ref="searchKeyWordInput"
							placeholder="搜索功能名称"
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

			<div
				:class="`mt-3 border-t ${deviceStore.isDarkMode ? 'divide-sothx-gray-color border-sothx-gray-color' : 'divide-gray-200 border-gray-200'}`">
				<dl :class="`divide-y ${deviceStore.isDarkMode ? 'divide-sothx-gray-color' : 'divide-gray-200'}`">
					<div
						v-for="(healthItem, index) in filteredHealthList"
						:key="healthItem.title"
						class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt
							:class="`text-sm font-medium leading-6 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
							{{ healthItem.title }}
							<RenderJsx
								v-if="healthItem.titleSlot"
								:content="healthItem.titleSlot && healthItem.titleSlot()" />
						</dt>
						<dd
							:class="`mt-1 text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-700'} sm:col-span-2 sm:mt-0`">
							<RenderJsx
								v-if="healthItem.content"
								:content="healthItem.content && healthItem.content()" />
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</template>

<style></style>
