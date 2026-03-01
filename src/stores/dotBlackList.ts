import { ref, computed, reactive, type ComputedRef } from 'vue';
import { defineStore } from 'pinia';
import type AutoUIItem from '@/types/AutoUIItem';
import type AutoUISettingRuleItem from '@/types/AutoUISettingRuleItem';
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import * as dotBlackListApi from '@/apis/dotBlackListApi';
import * as xmlFormat from '@/utils/xmlFormat';
import type { ErrorLogging } from '@/types/ErrorLogging';
type ApplicationName = Record<string, string>;
import { useDeviceStore } from './device';
import type DotBlackListMergeItem from '@/types/DotBlackListMergeItem';
import type DotBlackListItem from '@/types/DotBlackListItem';
import { useLogsStore } from './logs';

export const useDotBlackListStore = defineStore(
	'dotBlackList',
	() => {
		const filterInstalledApps = ref<boolean>(false);
		// Project Treble
		const isSupportProjectTrebleCustomDotBlackList = ref<boolean>(false);
		const isEnableProjectTrebleCustomDotBlackList = ref<boolean>(false);
		const projectTrebleSystemDotBlackList = ref<string[]>([]);
		const projectTrebleCustomDotBlackList = ref<string[]>([]);
		const isInit = ref<boolean>(false);
		// 窗口控制器
		const isCanUse = computed(() => {
			if (isSupportProjectTrebleCustomDotBlackList.value) {
				if (isEnableProjectTrebleCustomDotBlackList.value) {
					return true;
				} else {
					return false;
				}
			} else {
				if (!systemDotBlackList.value.length || !hasHTMLViewerCloudData.value) {
					return false;
				} else {
					return true;
				}
			}
		});
		const sourceDotBlackList = ref<DotBlackListItem[]>([]);
		const systemDotBlackList = computed<string[]>(() => {
			if (isSupportProjectTrebleCustomDotBlackList.value) {
				return projectTrebleSystemDotBlackList.value;
			} else {
				if (sourceDotBlackList.value.length === 0) return [];

				// 初始化为第一个 dataList 的顺序
				const firstList = sourceDotBlackList.value[0].dataList;
				const intersectionSet = new Set(firstList);

				// 遍历剩余的 dataList，更新交集
				sourceDotBlackList.value.slice(1).forEach(item => {
					const currentSet = new Set(item.dataList);
					for (const packageName of intersectionSet) {
						if (!currentSet.has(packageName)) {
							intersectionSet.delete(packageName); // 不在交集中的移除
						}
					}
				});

				// 保持返回顺序与第一个 dataList 的顺序一致
				return firstList.filter((packageName: string) => intersectionSet.has(packageName));
			}
		});
		const customDotBlackList = ref<string[]>([]);
		const mergeDotBlackList: ComputedRef<DotBlackListMergeItem[]> = computed(() => {
			const deviceStore = useDeviceStore();
			const installedAppName = deviceStore.installedAppPackageInfoMap;
			// 生成 systemDotBlackList 的项
			const systemItems = systemDotBlackList.value.map(item => {
				const isInCustomList = customDotBlackList.value.includes(item);
				const appName: string = installedAppName[item]?.appLabel || applicationName.value[item];
				return {
					name: item,
					applicationName: appName,
					ruleMode: isInCustomList ? 'custom' : 'system',
					status: true,
				} as DotBlackListMergeItem;
			});
			// 生成 customDotBlackList 的项
			const customItems = customDotBlackList.value
				.filter(item => !systemDotBlackList.value.includes(item))
				.map(item => {
					const appName: string = installedAppName[item]?.appLabel || applicationName.value[item];
					return {
						name: item,
						applicationName: appName,
						ruleMode: 'custom',
						status: false,
					} as DotBlackListMergeItem;
				});
			// 将 customItems 插入到 systemItems 的中间位置
			const midIndex = Math.floor(systemItems.length / 2);
			const mergedList = [...systemItems.slice(0, midIndex), ...customItems, ...systemItems.slice(midIndex)];

			return mergedList;
		});
		// 搜索后的配置列表
		const filterMergeDotBlackList: ComputedRef<DotBlackListMergeItem[]> = computed(() => {
			const searchValue = searchKeyWord.value.trim().toLowerCase();
			const cachedMergeDotBlackList = mergeDotBlackList.value;
			const deviceStore = useDeviceStore();
			return cachedMergeDotBlackList
				.reduce((result: DotBlackListMergeItem[], item) => {
					const itemName = item.name.trim().toLowerCase();

					// 过滤条件，检查 name 和 applicationName 是否包含 searchValue
					const applicationNameLower = item.applicationName ? item.applicationName.toLowerCase() : '';
					if (!itemName.includes(searchValue) && !applicationNameLower.includes(searchValue)) {
						return result;
					}

					// 如果 filterInstalledApps 为 true，检查 item 是否为已安装的应用
					const isInstalled = new Set(deviceStore.installedAndroidApplicationPackageList);
					if (filterInstalledApps.value && !isInstalled.has(item.name)) {
						return result; // 如果不是已安装的应用，跳过该项
					}

					result.push(item);
					return result;
				}, [])
				.sort((a, b) => {
					// 将 ruleMode 为 'custom' 的项排在前面
					if (a.ruleMode === 'custom' && b.ruleMode !== 'custom') {
						return -1;
					}
					if (a.ruleMode !== 'custom' && b.ruleMode === 'custom') {
						return 1;
					}
					return a.name.localeCompare(b.name);
				});
		});
		const applicationName = ref<ApplicationName>({});
		// 合并后的配置
		const mergeRuleList = ref<AutoUIMergeRuleItem[]>([]);
		// 搜索后的配置列表
		// 是否弹出错误信息弹窗
		const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));
		// 应用总数
		const ruleCount = computed(() => mergeRuleList.value.length);
		// 搜索值
		const searchKeyWord = ref<string>('');
		// 加载状态
		const loading = ref<boolean>(true);
		// 云控数据库记录
		const hasHTMLViewerCloudData = ref<boolean>(false);
		// 错误存储
		const errorLogging = reactive<ErrorLogging[]>([]);
		//
		const allPackageName = computed(() => {
			const allPackages = new Set([...customDotBlackList.value, ...systemDotBlackList.value]);
			return allPackages;
		});

		async function initDefault() {
			const logsStore = useLogsStore();
			loading.value = true;
			// 获取所有应用包名
			const applicationNameRes = await import('@/assets/applicationName.json');
			const applicationNameData = applicationNameRes.default;
			applicationName.value = applicationNameData;

			const [getCustomDotBlackListErr, getCustomDotBlackListRes] = await $to<string[], string>(
				dotBlackListApi.getCustomDotBlackList(),
			);
			if (getCustomDotBlackListErr) {
				logsStore.error('[窗口控制器-获取自定义云控配置失败]', getCustomDotBlackListErr.toString());
				customDotBlackList.value = [];
			}

			if (getCustomDotBlackListRes) {
				customDotBlackList.value = getCustomDotBlackListRes;
			}

			const [getIsSupportProjectTrebleCustomDotBlackListResErr, getIsSupportProjectTrebleCustomDotBlackListRes] =
				await $to<string>(dotBlackListApi.getIsSupportProjectTrebleCustomDotBlackList());

			if (getIsSupportProjectTrebleCustomDotBlackListRes === 'true') {
				isSupportProjectTrebleCustomDotBlackList.value = true;
			} else {
				isSupportProjectTrebleCustomDotBlackList.value = false;
			}

			if (isSupportProjectTrebleCustomDotBlackList.value) {
				const [getIsEnableProjectTrebleCustomDotBlackListErr, getIsEnableProjectTrebleCustomDotBlackListRes] =
					await $to<string>(dotBlackListApi.getIsEnableProjectTrebleCustomDotBlackList());
				if (
					getIsEnableProjectTrebleCustomDotBlackListRes &&
					Number(getIsEnableProjectTrebleCustomDotBlackListRes) === 1
				) {
					isEnableProjectTrebleCustomDotBlackList.value = true;
				} else {
					isEnableProjectTrebleCustomDotBlackList.value = false;
				}
				const [getProjectTrebleSystemDotBlackListErr, getProjectTrebleSystemDotBlackListRes] = await $to<
					string[],
					string
				>(dotBlackListApi.getProjectTrebleSystemDotBlackList());
				if (getProjectTrebleSystemDotBlackListRes && Array.isArray(getProjectTrebleSystemDotBlackListRes)) {
					projectTrebleSystemDotBlackList.value = getProjectTrebleSystemDotBlackListRes;
				}
				// const [getProjectTrebleCustomDotBlackListErr, getProjectTrebleCustomDotBlackListRes] = await $to<
				// 	string[],
				// 	string
				// >(dotBlackListApi.getProjectTrebleCustomDotBlackList());
				// if (getProjectTrebleCustomDotBlackListRes && Array.isArray(getProjectTrebleCustomDotBlackListRes)) {
				// 	projectTrebleCustomDotBlackList.value = getProjectTrebleCustomDotBlackListRes;
				// }
			} else {
				const [getHasHTMLViewerCloudDataBaseErr, getHasHTMLViewerCloudDataBaseRes] = await $to<string>(
					dotBlackListApi.getHasHTMLViewerCloudDataBase(),
				);

				if (getHasHTMLViewerCloudDataBaseErr) {
					logsStore.error('[窗口控制器-获取HTML云控数据库失败]', getHasHTMLViewerCloudDataBaseErr.toString());
					hasHTMLViewerCloudData.value = false;
					loading.value = false;
				}

				if (getHasHTMLViewerCloudDataBaseRes) {
					hasHTMLViewerCloudData.value = true;
					const [getDotBlackListErr, getDotBlackListRes] = await $to<DotBlackListItem[], string>(
						dotBlackListApi.getDotBlackList(),
					);
					if (getDotBlackListErr) {
						logsStore.error('[窗口控制器-获取系统内置云控配置失败]', getDotBlackListErr.toString());
						sourceDotBlackList.value = [];
					}

					if (getDotBlackListRes) {
						sourceDotBlackList.value = getDotBlackListRes;
					}
				}
			}

			loading.value = false;
			isInit.value = true;
		}

		return {
			mergeRuleList,
			isInit,
			allPackageName,
			sourceDotBlackList,
			hasHTMLViewerCloudData,
			isSupportProjectTrebleCustomDotBlackList,
			projectTrebleSystemDotBlackList,
			projectTrebleCustomDotBlackList,
			isEnableProjectTrebleCustomDotBlackList,
			systemDotBlackList,
			customDotBlackList,
			mergeDotBlackList,
			filterMergeDotBlackList,
			applicationName,
			searchKeyWord,
			errorLogging,
			isNeedShowErrorModal,
			filterInstalledApps,
			loading,
			ruleCount,
			initDefault,
			isCanUse,
		};
	},
	{
		persist: {
			pick: ['filterInstalledApps'],
		},
	},
);
