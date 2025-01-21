import { renderApplicationName } from '@/utils/common';
import { type ConfigProviderProps, darkTheme, lightTheme, createDiscreteApi } from 'naive-ui';
import { computed } from 'vue';
import { useDeviceStore } from '@/stores/device';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
export const incompatibleApplicationList: Record<string, (row: EmbeddedMergeRuleItem) => void> = {
	'com.vmos.pro': (row: EmbeddedMergeRuleItem) => {
		const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
		modal.create({
			title: '不兼容应用感知',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					经过多轮测试，{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					在大屏设备体验不佳，模块无法对其进行很好的适配，不推荐在大屏设备下使用{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					！
				</p>
			),
            positiveText: '已了解该应用可能不兼容',
		});
	},
	'com.qiyi.video': (row: EmbeddedMergeRuleItem) => {
		const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
		const url = 'https://caiyun.139.com/m/i?135ClWdvL9xtB';
		modal.create({
			title: '不兼容应用感知',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<div>
					<p>
						{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							{renderApplicationName(row.name, row.applicationName)}
						</span>{' '}
						在大屏体验下欠佳，在大屏设备下更推荐使用{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							爱奇艺PAD(com.qiyi.video.pad)
						</span>{' '}
						~
					</p>
					<p>下载地址:</p>
                    <p>{url}</p>
				</div>
			),
			positiveText: '复制下载链接到剪切板',
			negativeText: '取消',
			onPositiveClick: () => {
				navigator.clipboard.writeText(`${url}`);
			},
			onNegativeClick: () => {},
		});
	},
	'com.hunantv.imgo.activity': (row: EmbeddedMergeRuleItem) => {
		const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
		const url = 'https://caiyun.139.com/m/i?135CmUTZaefoj';
		modal.create({
			title: '不兼容应用感知',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<div>
					<p>
						{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							{renderApplicationName(row.name, row.applicationName)}
						</span>{' '}
						在大屏体验下欠佳，在大屏设备下更推荐使用{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							芒果TV HD(com.imgo.pad)
						</span>{' '}
						~
					</p>
					<p>下载地址:</p>
                    <p>{url}</p>
				</div>
			),
			positiveText: '复制下载链接到剪切板',
			negativeText: '取消',
			onPositiveClick: () => {
				navigator.clipboard.writeText(`${url}`);
			},
			onNegativeClick: () => {},
		});
	},
};
