import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device';
import * as deviceApi from '@/apis/deviceApi';
import { createDiscreteApi, darkTheme, lightTheme, type ConfigProviderProps } from 'naive-ui';
import $to from 'await-to-js';
import { divide } from 'lodash-es';

export interface messageCenterOptions {
	label: string;
	key: string;
}

export function useSidebar() {
	const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
		theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
	}));
	const deviceStore = useDeviceStore();
	const isSupportGameMode = computed(() => {
		return deviceStore.miuiCompatEnable && deviceStore.androidTargetSdk && deviceStore.androidTargetSdk > 31;
	});

	const { message, modal } = createDiscreteApi(['message', 'modal'], {
		configProviderProps: configProviderPropsRef,
	});

	const MESSAGE_CENTER_OPTIONS: messageCenterOptions[] = [
		{
			label: '创建到桌面快捷方式',
			key: 'createShortCut',
		},
		{
			label: '查看更新日志',
			key: 'changelog',
		}
	];

	const handleMessageCenterOptionClick = (key: string, option: messageCenterOptions) => {
		message.warning('此区域尚未开放，请以后再来探索吧~')
	}

	

	const messageCenterOptions = ref([])
	const getModal = async () => {
		modal.create({
			title: '应用适配收集表',
			type: 'info',
			preset: 'dialog',
			content: () => (
				<div>
					<p>您可以通过收集表提交您的应用适配需求OwO，提交前请认真阅读须知~</p>
					<p>https://docs.qq.com/form/page/DRUhJQkhzSnp6dWhm</p>
				</div>
			),
			positiveText: '复制收集表链接到剪切板',
			negativeText: '取消',
			onPositiveClick: () => {
				navigator.clipboard.writeText(`https://docs.qq.com/form/page/DRUhJQkhzSnp6dWhm`);
			},
		});
	};

	onMounted(() => {});

	return {
		MESSAGE_CENTER_OPTIONS,
		handleMessageCenterOptionClick
	};
}
