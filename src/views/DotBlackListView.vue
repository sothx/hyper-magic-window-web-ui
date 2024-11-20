<script setup lang="tsx">
import { ref, reactive, watch, type CSSProperties, h, type Component, computed, onMounted } from 'vue';
import { useDotBlackListStore } from '@/stores/dotBlackList';
import * as deviceApi from '@/apis/deviceApi';
import * as dotBlackListApi from '@/apis/dotBlackListApi';
import { useAutoUIStore } from '@/stores/autoui';
import * as xmlFormat from '@/utils/xmlFormat';
import { useDeviceStore } from '@/stores/device';
import $to from 'await-to-js';
import {
	NButton,
	NIcon,
	NInput,
	createDiscreteApi,
	darkTheme,
	lightTheme,
	type ConfigProviderProps,
	type DataTableColumns,
	type DropdownOption,
} from 'naive-ui';
import {
	ArrowPathIcon,
	FunnelIcon,
	PlusIcon,
	ShareIcon,
	TrashIcon,
	SquaresPlusIcon,
	XCircleIcon,
	MagnifyingGlassIcon,
	CircleStackIcon,
} from '@heroicons/vue/24/outline';
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import { useRouter, useRoute } from 'vue-router';
import { FunnelIcon as FunnelSolidIcon } from '@heroicons/vue/24/solid';
import { useLogsStore } from '@/stores/logs';
import { useAutoUI } from '@/hooks/useAutoUI';
import * as validateFun from '@/utils/validateFun';
import DotBlackListAppDrawer from '@/components/DotBlackListAppDrawer.vue';
import { findBase64InString, renderApplicationName } from '@/utils/common';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/utils/format';
import pako from 'pako';
import { useInstalledAppNames } from '@/hooks/useInstalledAppNames';
import type DotBlackListMergeItem from '@/types/DotBlackListMergeItem';
type SearchKeyWordInputInstance = InstanceType<typeof NInput>;
type DotBlackListAppDrawerInstance = InstanceType<typeof DotBlackListAppDrawer>;
const searchKeyWordInput = ref<SearchKeyWordInputInstance | null>(null);
const columns = createColumns();
const deviceStore = useDeviceStore();
const autoUIStore = useAutoUIStore();
const installedAppNames = useInstalledAppNames();
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
	theme: deviceStore.isDarkMode ? darkTheme : lightTheme,
}));
const { message, modal, notification } = createDiscreteApi(['message', 'modal', 'notification'], {
	configProviderProps: configProviderPropsRef,
});
const dotBlackListStore = useDotBlackListStore();
const importShareRuleLoading = ref(false);
const hotReloadLoading = ref(false);
const autoUI = useAutoUI();
const addDotBlackListApp = ref<DotBlackListAppDrawerInstance | null>(null);
const router = useRouter();
const logsStore = useLogsStore();
const route = useRoute();
const shareRuleTextarea = ref('');

function renderIcon(icon: Component) {
	return () => {
		return h(NIcon, null, {
			default: () => h(icon),
		});
	};
}

const reloadPage = async () => {
	if (!deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能尚处于内部开发阶段，未完工，请期待后续消息！</p>,
		});
		return;
	}
	if (!dotBlackListStore.systemDotBlackList.length || !dotBlackListStore.hasHTMLViewerCloudData) {
		modal.create({
			title: '获取云控失败',
			type: 'error',
			preset: 'dialog',
			content: () => (
				<p>无法获取到HTML查看器的云控，请检查是否禁用云控或者清除HTML查看器的数据再重启平板尝试操作~</p>
			),
		});
		return;
	}
	await deviceStore.getAndroidApplicationPackageNameList();
	await dotBlackListStore.initDefault();
};

const getInstalledAppNameList = async () => {
	const [getListErr, getListRes] = await $to(installedAppNames.getList());
	if (getListErr) {
		modal.create({
			title: '获取失败',
			type: 'error',
			preset: 'dialog',
			content: () => <p>获取已安装应用名称发生错误，详细错误请查看日志列表~</p>,
			negativeText: '确定',
		});
	}
	if (getListRes) {
		modal.create({
			title: '获取成功',
			type: 'success',
			preset: 'dialog',
			content: () => <p>好耶OwO，已重新获取当前已安装的应用名称~</p>,
			negativeText: '确定',
		});
	}
};

const filterHasBeenInstalledApp = () => {
	dotBlackListStore.filterInstalledApps = !dotBlackListStore.filterInstalledApps;
};

const hotReloadApplicationData = async () => {
	if (!deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能尚处于内部开发阶段，未完工，请期待后续消息！</p>,
		});
		return;
	}
	if (!dotBlackListStore.systemDotBlackList.length || !dotBlackListStore.hasHTMLViewerCloudData) {
		modal.create({
			title: '获取云控失败',
			type: 'error',
			preset: 'dialog',
			content: () => (
				<p>无法获取到HTML查看器的云控，请检查是否禁用云控或者清除HTML查看器的数据再重启平板尝试操作~</p>
			),
		});
		return;
	}
	hotReloadLoading.value = true;
	await reloadPage();
	const currentDotBlackList = dotBlackListStore.mergeDotBlackList.map(item => {
		return item.name;
	});
	const [updateRuleErr, updateRuleRes] = await $to(
		dotBlackListApi.updateDotBlackList({
			dotBlackList: currentDotBlackList,
			sourceDotBlackList: dotBlackListStore.sourceDotBlackList,
			customDotBlackList: dotBlackListStore.customDotBlackList,
		}),
	);
	if (updateRuleErr) {
		modal.create({
			title: '热重载应用数据失败',
			type: 'error',
			preset: 'dialog',
			content: () => <p>热重载应用数据失败了QwQ，详情请查看错误日志~</p>,
			negativeText: '确定',
		});
		hotReloadLoading.value = false;
	}

	if (updateRuleRes) {
		modal.create({
			title: '热重载应用数据成功',
			type: 'success',
			preset: 'dialog',
			content: () => (
				<p>
					好耶w，已经重新为你载入包括自定义规则在内的应用数据~实际生效还需要重启{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						系统界面
					</span>{' '}
					的作用域，确定要继续吗？
				</p>
			),
			positiveText: '确定重启作用域',
			negativeText: '稍后手动重启',
			onPositiveClick() {
				deviceApi
					.killAndroidSystemUI()
					.then(res => {
						modal.create({
							title: '重启作用域成功',
							type: 'success',
							preset: 'dialog',
							content: () => <p>已经成功为你重启系统界面的作用域，请查看是否生效~</p>,
						});
					})
					.catch(err => {
						modal.create({
							title: '重启作用域失败',
							type: 'error',
							preset: 'dialog',
							content: () => <p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>,
						});
					});
			},
		});
		hotReloadLoading.value = false;
	}
};

const importShareRule = async () => {
	if (!deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能尚处于内部开发阶段，未完工，请期待后续消息！</p>,
		});
		return;
	}
	if (!dotBlackListStore.systemDotBlackList.length || !dotBlackListStore.hasHTMLViewerCloudData) {
		modal.create({
			title: '获取云控失败',
			type: 'error',
			preset: 'dialog',
			content: () => (
				<p>无法获取到HTML查看器的云控，请检查是否禁用云控或者清除HTML查看器的数据再重启平板尝试操作~</p>
			),
		});
		return;
	}
	shareRuleTextarea.value = '';
	const [, showShareRuleTextareaModalRes] = await $to(
		new Promise((resolve, reject) => {
			modal.create({
				title: '请粘贴分享口令',
				preset: 'dialog',
				style: 'min-width:500px; width:50%;',
				content: () =>
					h(NInput, {
						type: 'textarea',
						value: shareRuleTextarea.value,
						'onUpdate:value': newValue => {
							shareRuleTextarea.value = newValue;
						},
						autosize: { minRows: 8, maxRows: 8 },
						placeholder: '在此处粘贴分享规则口令',
					}),
				positiveText: '确定提交',
				negativeText: '取消导入',
				onPositiveClick() {
					resolve('positiveClick');
				},
			});
		}),
	);
	if (showShareRuleTextareaModalRes) {
		importShareRuleLoading.value = true;
		const base64StringFromClipboard: string = shareRuleTextarea.value;
		const getBase64String = findBase64InString(base64StringFromClipboard);
		if (!getBase64String?.length) {
			modal.create({
				title: '导入分享规则失败',
				type: 'error',
				preset: 'dialog',
				content: () => (
					<p>
						导入分享规则失败了QwQ，解析{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							自定义规则
						</span>{' '}
						口令发生错误，无法正常解析。
					</p>
				),
				negativeText: '确定',
			});
			importShareRuleLoading.value = false;
			return;
		}
		try {
			const uint8Array: Uint8Array = base64ToArrayBuffer(getBase64String);
			const inflate = pako.inflate(uint8Array, {
				to: 'string',
			});
			const importRuleContent = JSON.parse(inflate);
			if (importRuleContent.type !== 'dot_black_list') {
				modal.create({
					title: '导入分享规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => (
						<p>
							导入分享规则失败了QwQ，该{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								自定义规则
							</span>{' '}
							不适用于窗口控制器。
						</p>
					),
					negativeText: '确定',
				});
				importShareRuleLoading.value = false;
				return;
			}
			if (
				(importRuleContent.device === 'pad' && deviceStore.deviceCharacteristics !== 'tablet') ||
				(importRuleContent.device === 'fold' && deviceStore.deviceCharacteristics === 'tablet')
			) {
				modal.create({
					title: '导入分享规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>导入分享规则失败了QwQ，平板和折叠屏的适配规则不能混用哦~</p>,
					negativeText: '确定',
				});
				importShareRuleLoading.value = false;
				return;
			}
			!dotBlackListStore.customDotBlackList.includes(importRuleContent.name) &&
				dotBlackListStore.customDotBlackList.push(importRuleContent.name);
			const currentDotBlackList = dotBlackListStore.mergeDotBlackList.map(item => {
				return item.name;
			});
			const [submitImportDotBlackListAppErr, submitImportDotBlackListAppRes] = await $to(
				dotBlackListApi.updateDotBlackList({
					dotBlackList: currentDotBlackList,
					sourceDotBlackList: dotBlackListStore.sourceDotBlackList,
					customDotBlackList: dotBlackListStore.customDotBlackList,
				}),
			);
			if (submitImportDotBlackListAppErr) {
				modal.create({
					title: '导入分享规则失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，导入失败了QwQ，详细错误请查看错误日志~</p>,
				});
				importShareRuleLoading.value = false;
			} else {
				await reloadPage();
				autoUIStore.updateMergeRuleList();
				importShareRuleLoading.value = false;
				modal.create({
					title: '导入分享规则成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>
							好耶w，{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(
									importRuleContent.name,
									deviceStore.installedAppNameList[importRuleContent.name] ||
										autoUIStore.applicationName[importRuleContent.name],
								)}
							</span>{' '}
							的应用配置成功了OwO~实际生效还需要重启{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								系统界面
							</span>{' '}
							的作用域，确定要继续吗？
						</p>
					),
					positiveText: '确定重启作用域',
					negativeText: '稍后手动重启',
					onPositiveClick() {
						deviceApi
							.killAndroidSystemUI()
							.then(res => {
								modal.create({
									title: '重启作用域成功',
									type: 'success',
									preset: 'dialog',
									content: () => <p>已经成功为你重启系统界面的作用域，请查看是否生效~</p>,
								});
							})
							.catch(err => {
								modal.create({
									title: '重启作用域失败',
									type: 'error',
									preset: 'dialog',
									content: () => <p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>,
								});
							});
					},
				});
			}
			// 解析成功，可以使用 data
		} catch (error) {
			console.log(error, 'error');
			// 解析失败，处理错误
			modal.create({
				title: '导入分享规则失败',
				type: 'error',
				preset: 'dialog',
				content: () => <p>解析分享规则失败了QwQ，请检查导入口令是否有误</p>,
				negativeText: '确定',
			});
			importShareRuleLoading.value = false;
		}
	}
};

const handleCustomRuleDropdown = async (
	key: string | number,
	option: DropdownOption,
	row: DotBlackListMergeItem,
	index: number,
) => {
	if (!deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能尚处于内部开发阶段，未完工，请期待后续消息！</p>,
		});
		return;
	}
	if (!dotBlackListStore.systemDotBlackList.length || !dotBlackListStore.hasHTMLViewerCloudData) {
		modal.create({
			title: '获取云控失败',
			type: 'error',
			preset: 'dialog',
			content: () => (
				<p>无法获取到HTML查看器的云控，请检查是否禁用云控或者清除HTML查看器的数据再重启平板尝试操作~</p>
			),
		});
		return;
	}
	if (key === 'cleanCustomRule') {
		const cleanCustomModal = modal.create({
			title: '想清除自定义规则吗？',
			type: 'warning',
			preset: 'dialog',
			content: () => (
				<p>
					清除自定义规则后，将恢复{' '}
					<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
						{renderApplicationName(row.name, row.applicationName)}
					</span>{' '}
					的窗口控制器显示效果。确定要继续吗？
				</p>
			),
			positiveText: '确定清除',
			negativeText: '我再想想',
			onPositiveClick: async () => {
				cleanCustomModal.loading = true;
				dotBlackListStore.customDotBlackList = dotBlackListStore.customDotBlackList.filter(
					item => item !== row.name,
				);
				const currentDotBlackList = dotBlackListStore.mergeDotBlackList.map(item => {
					return item.name;
				});
				const [submitCleanCustomRuleErr, submitCleanCustomRuleRes] = await $to(
					dotBlackListApi.updateDotBlackList({
						dotBlackList: currentDotBlackList,
						sourceDotBlackList: dotBlackListStore.sourceDotBlackList,
						customDotBlackList: dotBlackListStore.customDotBlackList,
					}),
				);
				if (submitCleanCustomRuleErr) {
					modal.create({
						title: '清除自定义规则失败',
						type: 'error',
						preset: 'dialog',
						content: () => <p>发生异常错误，清除失败了QwQ，详细错误请查看错误日志~</p>,
					});
					cleanCustomModal.loading = false;
				} else {
					cleanCustomModal.loading = false;
					modal.create({
						title: '清除自定义规则成功',
						type: 'success',
						preset: 'dialog',
						content: () => (
							<p>
								好耶w，清除自定义规则成功了OwO~实际生效还需要重启{' '}
								<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
									系统界面
								</span>{' '}
								的作用域，确定要继续吗？
							</p>
						),
						positiveText: '确定重启作用域',
						negativeText: '稍后手动重启',
						onPositiveClick() {
							deviceApi
								.killAndroidSystemUI()
								.then(res => {
									modal.create({
										title: '重启作用域成功',
										type: 'success',
										preset: 'dialog',
										content: () => <p>已经成功为你重启系统界面的作用域，请查看是否生效~</p>,
									});
								})
								.catch(err => {
									modal.create({
										title: '重启作用域失败',
										type: 'error',
										preset: 'dialog',
										content: () => (
											<p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>
										),
									});
								});
						},
					});
					cleanCustomModal.loading = false;
					dotBlackListStore.initDefault();
				}
			},
		});
	}
	if (key === 'shareCustomRule') {
		const shareContent = {
			name: row.name,
			cmpt: 1,
			rules: {
				name: row.name,
			},
			type: 'dot_black_list',
			device: deviceStore.deviceCharacteristics === 'tablet' ? 'pad' : 'fold',
		};
		const jsonString = JSON.stringify(shareContent);
		const deflate = pako.deflate(jsonString, {
			level: 9,
			memLevel: 9,
			windowBits: 15,
		});
		const compressedData = new Uint8Array(deflate);
		const base64String: string = arrayBufferToBase64(compressedData);
		const [writeClipboardErr] = await $to(
			navigator.clipboard.writeText(
				`我分享了一个[窗口控制器]的自定义规则，可以前往[完美横屏应用计划 For Web UI]导入：\n${base64String}`,
			),
		);
		if (writeClipboardErr) {
			modal.create({
				title: '复制分享口令失败',
				type: 'error',
				preset: 'dialog',
				content: () => (
					<p>
						复制{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							{renderApplicationName(row.name, row.applicationName)}
						</span>{' '}
						的分享口令失败了QwQ，可能由于没有读取/写入剪切板的权限或{' '}
						<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
							自定义规则
						</span>{' '}
						长度过大。
					</p>
				),
				negativeText: '确定',
			});
			return;
		} else {
			modal.create({
				title: '复制分享口令成功',
				type: 'success',
				preset: 'dialog',
				content: () => (
					<div>
						<p>
							好耶w，复制{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(row.name, row.applicationName)}
							</span>{' '}
							分享口令成功了~
						</p>
						<p>
							如果没有复制成功，请确认是否给予了读取/写入剪切板的权限或{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								自定义规则
							</span>{' '}
							长度过大。
						</p>
						<p>
							分享口令导入入口位于{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								窗口控制器- 从分享口令导入
							</span>{' '}
							。
						</p>
					</div>
				),
				positiveText: '确定',
			});
		}
	}
};

const handleSystemRuleMode = (row: DotBlackListMergeItem, index: number) => {
	modal.create({
		title: '系统规则说明',
		type: 'warning',
		preset: 'dialog',
		content: () => (
			<p>
				系统已对{' '}
				<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
					{renderApplicationName(row.name, row.applicationName)}
				</span>{' '}
				配置了窗口控制器的隐藏，且不可被移除，仅有自定义规则可以被移除哦~
			</p>
		),
	});
};

const openAddDrawer = async () => {
	if (!deviceStore.ABTestInfo.Hyper_OS_DOT_BLACK_LIST_MANAGER) {
		modal.create({
			title: '内测说明',
			type: 'warning',
			preset: 'dialog',
			content: () => <p>该功能尚处于内部开发阶段，未完工，请期待后续消息！</p>,
		});
		return;
	}
	if (!dotBlackListStore.systemDotBlackList.length || !dotBlackListStore.hasHTMLViewerCloudData) {
		modal.create({
			title: '获取云控失败',
			type: 'error',
			preset: 'dialog',
			content: () => (
				<p>无法获取到HTML查看器的云控，请检查是否禁用云控或者清除HTML查看器的数据再重启平板尝试操作~</p>
			),
		});
		return;
	}
	if (addDotBlackListApp.value) {
		const [addDotBlackListAppCancel, addDotBlackListAppRes] = await $to(addDotBlackListApp.value.openDrawer());
		if (addDotBlackListAppCancel) {
			console.log('操作取消:', addDotBlackListAppCancel);
		} else {
			dotBlackListStore.customDotBlackList.push(addDotBlackListAppRes.name);
			const currentDotBlackList = dotBlackListStore.mergeDotBlackList.map(item => {
				return item.name;
			});
			const [submitAddDotBlackListAppErr, submitAddDotBlackListAppRes] = await $to(
				dotBlackListApi.updateDotBlackList({
					dotBlackList: currentDotBlackList,
					sourceDotBlackList: dotBlackListStore.sourceDotBlackList,
					customDotBlackList: dotBlackListStore.customDotBlackList,
				}),
			);
			if (submitAddDotBlackListAppErr) {
				modal.create({
					title: '应用添加失败',
					type: 'error',
					preset: 'dialog',
					content: () => <p>发生异常错误，添加失败了QwQ，详细错误请查看错误日志~</p>,
				});
				addDotBlackListAppRes.loadingCallback && addDotBlackListAppRes.loadingCallback();
			} else {
				modal.create({
					title: '应用添加成功',
					type: 'success',
					preset: 'dialog',
					content: () => (
						<p>
							好耶w，已经成功配置{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								{renderApplicationName(
									addDotBlackListAppRes.name,
									deviceStore.installedAppNameList[addDotBlackListAppRes.name] ||
										dotBlackListStore.applicationName[addDotBlackListAppRes.name],
								)}
							</span>{' '}
							的窗口控制器隐藏效果了OwO~实际生效还需要重启{' '}
							<span class={`font-bold ${deviceStore.isDarkMode ? 'text-teal-400' : 'text-gray-600'}`}>
								系统界面
							</span>{' '}
							的作用域，确定要继续吗？
						</p>
					),
					positiveText: '确定重启作用域',
					negativeText: '稍后手动重启',
					onPositiveClick() {
						deviceApi
							.killAndroidSystemUI()
							.then(res => {
								modal.create({
									title: '重启作用域成功',
									type: 'success',
									preset: 'dialog',
									content: () => <p>已经成功为你重启系统界面的作用域，请查看是否生效~</p>,
								});
							})
							.catch(err => {
								modal.create({
									title: '重启作用域失败',
									type: 'error',
									preset: 'dialog',
									content: () => <p>发生异常错误，重启系统界面作用域失败QwQ，详细错误请查看日志~</p>,
								});
							});
					},
				});
				dotBlackListStore.initDefault();
				addDotBlackListAppRes.loadingCallback && addDotBlackListAppRes.loadingCallback();
				addDotBlackListAppRes.closeCallback && addDotBlackListAppRes.closeCallback();
			}
		}
	}
};

const pagination = reactive({
	page: 1,
	pageSize: 10,
	showSizePicker: true,
	onChange: (page: number) => {
		pagination.page = page;
	},
	onUpdatePageSize: (pageSize: number) => {
		pagination.pageSize = pageSize;
		pagination.page = 1;
	},
});

const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
	const style: CSSProperties = {};
	if (checked) {
		style.background = '#2080f0';
		if (focused) {
			style.boxShadow = '0 0 0 2px #2080f040';
		}
	} else {
		style.background = '#d03050';
		if (focused) {
			style.boxShadow = '0 0 0 2px #d0305040';
		}
	}
	return style;
};

function createColumns(): DataTableColumns<DotBlackListMergeItem> {
	return [
		{
			title: '应用名称',
			minWidth: 250,
			key: 'name',
			render(row, index) {
				return (
					<div>
						{row.applicationName && <p>{row.applicationName}</p>}
						{row.name && (
							<p>
								<span class={{ hidden: !row.applicationName }}>(</span>
								{row.name}
								<span class={{ hidden: !row.applicationName }}>)</span>
							</p>
						)}
					</div>
				);
			},
		},
		{
			title: '规则状态',
			width: 150,
			key: 'isOptimizeWebView',
			render(row, index) {
				if (row.status) {
					return (
						<n-tag bordered={false} dashed type='success'>
							已生效
						</n-tag>
					);
				}
				return (
					<n-tag bordered={false} dashed type='info'>
						未生效
					</n-tag>
				);
			},
		},
		{
			title: '规则来源',
			width: 150,
			key: 'ruleMode',
			render(row, index) {
				if (row.ruleMode === 'custom') {
					const rule = [
						{
							label: '分享自定义规则',
							key: 'shareCustomRule',
							icon: renderIcon(ShareIcon),
						},
						{
							label: '清除自定义规则',
							key: 'cleanCustomRule',
							icon: renderIcon(TrashIcon),
						},
					];
					return (
						<n-dropdown
							onSelect={(key: string | number, option: DropdownOption) =>
								handleCustomRuleDropdown(key, option, row, index)
							}
							size='large'
							trigger='click'
							options={rule}>
							<n-button size='small' dashed type='info'>
								自定义规则
							</n-button>
						</n-dropdown>
					);
				}
				return (
					<n-button size='small' dashed type='error' onClick={() => handleSystemRuleMode(row, index)}>
						系统规则
					</n-button>
				);
			},
		},
	];
}
</script>
<template>
	<main class="autoui-view mb-10">
		<div class="mt-5">
			<div class="mb-5 px-4 sm:px-0">
				<h3
					:class="`text-base font-semibold leading-7 ${deviceStore.isDarkMode ? 'text-white' : 'text-gray-900'}`">
					窗口控制器
				</h3>
				<p
					:class="`mt-1 max-w-2xl text-sm leading-6 ${deviceStore.isDarkMode ? 'text-gray-300' : 'text-gray-500'}`">
					在这里可以快速管理有关窗口控制器的配置
				</p>
			</div>
		</div>
		<n-card title="操作区" size="small">
			<div class="flex flex-wrap">
				<n-button
					class="mb-3 mr-3"
					type="info"
					:loading="deviceStore.loading || dotBlackListStore.loading"
					@click="openAddDrawer">
					<template #icon>
						<n-icon>
							<PlusIcon />
						</n-icon>
					</template>
					添加应用
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="success"
					:loading="deviceStore.loading || dotBlackListStore.loading"
					@click="() => reloadPage()">
					<template #icon>
						<n-icon>
							<ArrowPathIcon />
						</n-icon>
					</template>
					刷新应用列表
				</n-button>
				<n-button
					class="mb-3 mr-3"
					color="#8a2be2"
					:loading="deviceStore.loading || dotBlackListStore.loading"
					@click="() => hotReloadApplicationData()">
					<template #icon>
						<n-icon>
							<SquaresPlusIcon />
						</n-icon>
					</template>
					热重载应用数据
				</n-button>
				<n-button
					class="mb-3 mr-3"
					color="#69b2b6"
					v-if="deviceStore.androidTargetSdk && deviceStore.androidTargetSdk > 33"
					:loading="deviceStore.loading || dotBlackListStore.loading || installedAppNames.loading.value"
					@click="getInstalledAppNameList()">
					<template #icon>
						<n-icon>
							<CircleStackIcon />
						</n-icon>
					</template>
					获取已安装应用名称
				</n-button>
				<n-button
					class="mb-3 mr-3"
					type="warning"
					:loading="deviceStore.loading || dotBlackListStore.loading || importShareRuleLoading"
					@click="importShareRule()">
					<template #icon>
						<n-icon>
							<ShareIcon />
						</n-icon>
					</template>
					从分享口令导入
				</n-button>
			</div>
			<div class="flex flex-wrap">
				<n-button
					class="mb-3 mr-3"
					:type="dotBlackListStore.filterInstalledApps ? 'warning' : 'info'"
					strong
					:loading="deviceStore.loading || dotBlackListStore.loading"
					secondary
					@click="filterHasBeenInstalledApp">
					<template #icon>
						<n-icon>
							<FunnelSolidIcon v-if="dotBlackListStore.filterInstalledApps" />
							<FunnelIcon v-else />
						</n-icon>
					</template>
					{{ dotBlackListStore.filterInstalledApps ? '已安装应用' : '全部应用' }}
				</n-button>
			</div>
			<n-input-group>
				<n-input
					size="large"
					clearable
					v-model:value="dotBlackListStore.searchKeyWord"
					ref="searchKeyWordInput"
					placeholder="搜索应用名称/应用包名"
					autosize
					:style="{ width: '80%' }" />
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
					搜索
				</n-button>
				<n-button
					size="large"
					bordered
					@click="
						() => {
							dotBlackListStore.searchKeyWord = '';
						}
					">
					<template #icon>
						<n-icon>
							<XCircleIcon />
						</n-icon>
					</template>
					清空
				</n-button>
			</n-input-group>
		</n-card>
		<n-data-table
			:loading="deviceStore.loading || dotBlackListStore.loading"
			:columns="columns"
			:data="dotBlackListStore.filterMergeDotBlackList"
			:pagination="pagination" />
		<DotBlackListAppDrawer ref="addDotBlackListApp" type="add" title="添加应用" />
	</main>
</template>
