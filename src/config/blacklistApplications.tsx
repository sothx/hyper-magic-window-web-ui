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
			title: '应用不兼容感知',
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
					~
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
			title: '应用不兼容感知',
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
			title: '应用不兼容感知',
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
    'com.taobao.idlefish': (row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
		modal.create({
			title: '应用不兼容感知',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					在大屏设备体验不佳，模块无法对其进行很好的适配，模块更推荐在{' '}<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						居中布局
					</span>{' '}下使用{' '}<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}~
				</p>
			),
            positiveText: '已了解该应用可能不兼容',
		});
    },
    'cn.cntv': (row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135CmUTNrzYNh';
		modal.create({
			title: '应用不兼容感知',
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
							央视影音 HD(cn.cntvhd)
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
    'com.sohu.sohuvideo': (row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135ClWdevpbAN';
		modal.create({
			title: '应用不兼容感知',
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
							搜狐视频 HD(com.sohu.tv)
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
    'com.sinyee.babybus.recommendapp': (row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135ClqWyzHNVM';
		modal.create({
			title: '应用不兼容感知',
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
							宝宝巴士 HD(com.bb.happykids)
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
	'com.letv.android.client':(row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135CmQkIsmiIY';
		modal.create({
			title: '应用不兼容感知',
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
							乐视视频 Pad(ccom.letv.android.client.pad)
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
	'cn.vcinema.cinema':(row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135ClmrX20IdL';
		modal.create({
			title: '应用不兼容感知',
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
							{renderApplicationName('com.vcinema.cinema.pad', '南瓜电影 HD')}
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
	'com.cctv.yangshipin.app.androidp':(row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135CdjETPAsIX';
		modal.create({
			title: '应用不兼容感知',
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
							{renderApplicationName('cn.ysp.app.pad', '央视频 HD')}
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
	'uni.UNI724DE05':(row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135Ce3KZl34Fz';
		modal.create({
			title: '应用不兼容感知',
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
							{renderApplicationName('plus.H5D021621', '大桥化工 pad')}
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
	'com.shangkatong.merchant.app':(row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135CdjIYZ6Pzq';
		modal.create({
			title: '应用不兼容感知',
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
							{renderApplicationName('com.shangkatong.pro.pad', '商卡通会员管理Pad')}
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
	'com.CDA.StructureMaster': (row: EmbeddedMergeRuleItem) => {
        const deviceStore = useDeviceStore();
		const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
			theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
		}));
		const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
			configProviderProps: configProviderPropsRef,
		});
        const url = 'https://caiyun.139.com/m/i?135ClqS1uhW8p';
		modal.create({
			title: '应用不兼容感知',
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
							结构大师 HD(com.CDAStudio.StructureMasterHD)
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
