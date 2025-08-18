<script setup lang="tsx">
import { useDeviceStore } from '@/stores/device';
import { computed, h, ref, type CSSProperties } from 'vue';
import { createDiscreteApi, darkTheme, lightTheme, NInput, type ConfigProviderProps } from 'naive-ui';
import { useRealQuantity } from '@/hooks/useRealQuantity';
import { RenderJsx } from '@/components/RenderJSX';
import PinyinMatch from 'pinyin-match';
import { MagnifyingGlassIcon, CircleStackIcon, XCircleIcon, SquaresPlusIcon } from '@heroicons/vue/24/outline';
import type { JSX } from 'vue/jsx-runtime';
const deviceStore = useDeviceStore();
const realQuantityHook = useRealQuantity();
const searchKeyword = ref('');
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal } = createDiscreteApi(['message', 'modal'], {
	configProviderProps: configProviderPropsRef,
});
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
		title: '真实电量（高通）',
		content: () => (
			<>
				<p>
					{`${realQuantityHook.qcomBatteryFg1RSocInfo.current} %`}
					<n-button
						class='ml-1'
						strong
						secondary
						size='small'
						type='success'
						onClick={() => realQuantityHook.qcomBatteryFg1RSocInfo.reload()}>
						手动刷新
					</n-button>
					<n-switch
						class='ml-2'
						v-model:value={realQuantityHook.qcomBatteryFg1RSocInfo.autoReload}
						rail-style={railStyle}>
						{{
							checked: () => '开启自动刷新',
							unchecked: () => '未开启自动刷新',
						}}
					</n-switch>
				</p>

				{realQuantityHook.qcomBatteryFg1RSocInfo.autoReload && (
					<div>
						<p class='my-2'>隔多少秒刷新一次</p>
						<p>
							<n-slider
								v-model:value={realQuantityHook.qcomBatteryFg1RSocInfo.timer}
								size='small'
								min={1}
								max={30}
								step={1}
							/>
							<n-input-number
								show-button={false}
								class='pt-3'
								readonly
								placeholder='请输入刷新频率间隔时间'
								v-model:value={realQuantityHook.qcomBatteryFg1RSocInfo.timer}
								min={0}
								max={30}
								step={1}
							/>
						</p>
					</div>
				)}
			</>
		),
		isShow: () => Boolean(realQuantityHook.qcomBatteryFg1RSocInfo.current),
	},
	{
		title: '真实电量',
		content: () => (
			<>
				<p>
					{`${realQuantityHook.capacityRawInfo.current / 100} %`}
					<n-button
						class='ml-1'
						strong
						secondary
						size='small'
						type='success'
						onClick={() => realQuantityHook.capacityRawInfo.reload()}>
						手动刷新
					</n-button>
					<n-switch
						class='ml-2'
						v-model:value={realQuantityHook.capacityRawInfo.autoReload}
						rail-style={railStyle}>
						{{
							checked: () => '开启自动刷新',
							unchecked: () => '未开启自动刷新',
						}}
					</n-switch>
				</p>

				{realQuantityHook.capacityRawInfo.autoReload && (
					<div>
						<p class='my-2'>隔多少秒刷新一次</p>
						<p>
							<n-slider
								v-model:value={realQuantityHook.capacityRawInfo.timer}
								size='small'
								min={1}
								max={30}
								step={1}
							/>
							<n-input-number
								show-button={false}
								class='pt-3'
								readonly
								placeholder='请输入刷新频率间隔时间'
								v-model:value={realQuantityHook.capacityRawInfo.timer}
								min={0}
								max={30}
								step={1}
							/>
						</p>
					</div>
				)}
			</>
		),
		isShow: () => Boolean(realQuantityHook.capacityRawInfo.current),
	},
	{
		title: '电池出厂设计容量',
		content: () => <p>{`${deviceStore.batteryInfo.chargeFullDesign / 1000} mAh`}</p>,
		isShow: () => Boolean(deviceStore.batteryInfo.chargeFullDesign),
	},
	{
		title: '电池当前预估容量',
		content: () => <p>{`${deviceStore.batteryInfo.chargeFull / 1000} mAh`}</p>,
		isShow: () => Boolean(deviceStore.batteryInfo.chargeFull),
	},
	{
		title: '电池循环充电次数',
		content: () => <p>{`${deviceStore.batteryInfo.cycleCount} 次`}</p>,
		isShow: () => Boolean(deviceStore.batteryInfo.cycleCount),
	},
	{
		title: '电池预估健康度',
		content: () => (
			<p>
				{`${((deviceStore.batteryInfo.chargeFull / deviceStore.batteryInfo.chargeFullDesign) * 100).toFixed(
					2,
				)} %`}
			</p>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.chargeFullDesign && deviceStore.batteryInfo.chargeFull),
	},
	{
		title: '电池售后健康度（高通）',
		content: () => (
			<>
				<p>{`${deviceStore.batteryInfo.sohQcom} %`}</p>
				<p>{`≈ ${Math.round(
					(deviceStore.batteryInfo.chargeFullDesign * (deviceStore.batteryInfo.sohQcom / 100)) / 1000,
				)} mAh`}</p>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>在设备保修期内健康度低于80%可以申请电池质保</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.sohQcom),
	},
	{
		title: '电池售后健康度',
		content: () => (
			<>
				<p>{`${deviceStore.batteryInfo.sohMTK} %`}</p>
				<p>{`≈ ${Math.round(
					(deviceStore.batteryInfo.chargeFullDesign * (deviceStore.batteryInfo.sohMTK / 100)) / 1000,
				)} mAh`}</p>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>在设备保修期内健康度低于80%可以申请电池质保</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.sohMTK),
	},
	{
		title: '电池售后健康度（小米）',
		content: () => (
			<>
				<p>{`${deviceStore.batteryInfo.sohXMPower} %`}</p>
				<p>
					{`≈ ${Math.round(
						(deviceStore.batteryInfo.chargeFullDesign * (deviceStore.batteryInfo.sohXMPower / 100)) / 1000,
					)} mAh`}
				</p>
				<n-alert class='mt-5' type='info' show-icon={false} bordered={false}>
					<p>在设备保修期内健康度低于80%可以申请电池质保</p>
				</n-alert>
			</>
		),
		isShow: () => Boolean(deviceStore.batteryInfo.sohXMPower),
	},
];
const filteredHealthList = computed(() => {
	const keyword = searchKeyword.value.trim().toLowerCase();
	return healthList.filter(item => {
		const showFlag = item.isShow ? item.isShow() : true;
		if (!showFlag) return false;
		if (!keyword) return true;

		const titleStr = item.title?.toLowerCase?.() ?? '';

		// 支持普通 includes 和拼音匹配
		return (
			titleStr.includes(keyword) ||
			(PinyinMatch.match(titleStr, keyword) !== false)
		);
	});
});
</script>
<template>
	<div class="batteryHealth">
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
						>电池健康</span
					>
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					电池健康，提供电池健康状态监测。
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
						:key="index"
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
