import { ref, computed, reactive, watch } from 'vue';
import { defineStore } from 'pinia';
import type EmbeddedRuleItem from '@/types/EmbeddedRuleItem';
import type FixedOrientationRuleItem from '@/types/FixedOrientationRuleItem';
import type EmbeddedSettingRuleItem from '@/types/EmbeddedSettingRuleItem';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
import $to from 'await-to-js';
import * as deviceApi from '@/apis/deviceApi';
import * as embeddedApi from '@/apis/embeddedApi';
import * as xmlFormat from '@/utils/xmlFormat';
import type { ErrorLogging } from '@/types/ErrorLogging';
import whitelistApplications from '@/config/whitelistApplications';
import { useDeviceStore } from './device';
import eventBus from '@/utils/eventBus';
import { useLogsStore } from './logs';
import { debounce } from 'lodash-es';
import { thirdPartyAppOptimizeConfigFormatToJSON } from '@/utils/embeddedFun';
type ApplicationName = Record<string, string>;
export type ThirdPartyAppOptimizeAppModeType = -1 | 0 | 1 | 2 | 3;
export const useEmbeddedStore = defineStore(
	'embedded',
	() => {
		// 是否补丁模式
		const isPatchMode = ref<boolean>(false);
		const filterInstalledApps = ref<boolean>(false);
		const applicationName = ref<ApplicationName>({});
		const isNeedShowReloadPathModeDialog = ref<boolean>(false);
		// 平行窗口
		const sourceEmbeddedRulesList = ref<Record<EmbeddedRuleItem['name'], EmbeddedRuleItem>>({});
		const systemEmbeddedRulesList = ref<Record<EmbeddedRuleItem['name'], EmbeddedRuleItem>>({});
		const customConfigEmbeddedRulesList = ref<Record<string, EmbeddedRuleItem>>({});
		// 固定应用方向
		const sourceFixedOrientationList = ref<Record<string, FixedOrientationRuleItem>>({});
		const systemFixedOrientationList = ref<Record<EmbeddedRuleItem['name'], FixedOrientationRuleItem>>({});
		const customConfigFixedOrientationList = ref<Record<string, FixedOrientationRuleItem>>({});
		// 配置文件
		const systemEmbeddedSettingConfig = ref<Record<string, EmbeddedSettingRuleItem>>({});
		const sourceEmbeddedSettingConfig = ref<Record<string, EmbeddedSettingRuleItem>>({});
		const customConfigEmbeddedSettingConfig = ref<Record<string, EmbeddedSettingRuleItem>>({});
		// 系统应用横屏优化
		const systemAppOptimizeConfig = ref<Record<string, ThirdPartyAppOptimizeAppModeType>>({});
		// 第三方应用横屏优化
		const sourceThirdPartyAppOptimizeConfig = ref<Record<string, ThirdPartyAppOptimizeAppModeType>>({});
		const customThirdPartyAppOptimizeConfig = ref<Record<string, ThirdPartyAppOptimizeAppModeType>>({});
		const mergeThirdPartyAppOptimizeConfig = computed(() => {
			// 合并逻辑
			const mergedConfig = { ...sourceThirdPartyAppOptimizeConfig.value };

			for (const key in customThirdPartyAppOptimizeConfig.value) {
				const customValue = customThirdPartyAppOptimizeConfig.value[key];

				if (customValue === -1) {
					// 如果值为 -1，则移除该键
					delete mergedConfig[key];
				} else {
					// 否则更新或新增值
					mergedConfig[key] = customValue;
				}
			}

			return mergedConfig;
		});
		// diff后的平行窗口配置
		const patchEmbeddedRulesList = computed((): Record<EmbeddedRuleItem['name'], EmbeddedRuleItem> => {
			const deviceStore = useDeviceStore();
			const combinedSet = new Set([
				...Object.keys(systemEmbeddedRulesList.value),
				...Object.keys(systemFixedOrientationList.value),
				...deviceStore.installedAndroidApplicationPackageNameList,
				...Object.keys(whitelistApplications),
			]);

			const filteredEntries = Object.entries(sourceEmbeddedRulesList.value).filter(([key]) =>
				combinedSet.has(key),
			);

			// 将过滤后的键值对数组重新转换为对象
			return Object.fromEntries(filteredEntries);
		});

		// diff后的信箱模式配置
		const patchFixedOrientationList = computed(
			(): Record<FixedOrientationRuleItem['name'], FixedOrientationRuleItem> => {
				const deviceStore = useDeviceStore();
				const combinedSet = new Set([
					...Object.keys(systemEmbeddedRulesList.value),
					...Object.keys(systemFixedOrientationList.value),
					...deviceStore.installedAndroidApplicationPackageNameList,
					...Object.keys(whitelistApplications),
				]);

				const filteredEntries = Object.entries(sourceFixedOrientationList.value).filter(([key]) =>
					combinedSet.has(key),
				);

				// 将过滤后的键值对数组重新转换为对象
				return Object.fromEntries(filteredEntries);
			},
		);

		// diff后的应用横屏布局配置
		const patchEmbeddedSettingConfig = computed(
			(): Record<EmbeddedSettingRuleItem['name'], EmbeddedSettingRuleItem> => {
				const deviceStore = useDeviceStore();
				const combinedSet = new Set([
					...Object.keys(systemEmbeddedRulesList.value),
					...Object.keys(systemFixedOrientationList.value),
					...deviceStore.installedAndroidApplicationPackageNameList,
					...Object.keys(whitelistApplications),
				]);

				const filteredEntries = Object.entries(sourceEmbeddedSettingConfig.value).filter(([key]) =>
					combinedSet.has(key),
				);
				// 将过滤后的键值对数组重新转换为对象
				return Object.fromEntries(filteredEntries);
			},
		);
		// 合并后的配置
		const mergeRuleList = ref<EmbeddedMergeRuleItem[]>([]);
		// 需要设置应用模式的应用列表
		const filterSetAppModeAppList = computed(() => {
			const deviceStore = useDeviceStore();
			const hasInstalledApp = new Set(deviceStore.installedAndroidApplicationPackageNameList);
			const needSetAppModeAppList: string[] = mergeRuleList.value.reduce((result: string[], item) => {
				if (hasInstalledApp.has(item.name)) {
					result.push(item.name);
				}
				return result;
			}, []);
			return needSetAppModeAppList;
		});
		const filterResetAppCompatAppList = computed(() => {
			const deviceStore = useDeviceStore();
			const hasInstalledApp = new Set(deviceStore.installedAndroidApplicationPackageNameList);
			const compatAppList: string[] = mergeRuleList.value.reduce((result: string[], item) => {
				if (hasInstalledApp.has(item.name)) {
					if (item.fixedOrientationRule?.compatChange) {
						result.push(item.name);
					}
				}
				return result;
			}, []);
			return compatAppList;
		});
		const searchValue = ref(''); // 用来存储经过防抖处理后的搜索关键字
		// 搜索值
		const searchKeyWord = ref<string>('');
		// 防抖处理搜索关键字
		const debouncedSearch = debounce((value: string) => {
			searchValue.value = value.trim().toLowerCase();
		}, 500); // 设置防抖延迟为 500ms

		// 监听 searchKeyWord 的变化并执行防抖
		watch(searchKeyWord, newValue => {
			debouncedSearch(newValue);
		});
		// 搜索后的配置列表
		const filterMergeRuleList = computed(() => {
			const cachedMergeRuleList = mergeRuleList.value;
			const deviceStore = useDeviceStore();
			const isInstalled = new Set(deviceStore.installedAndroidApplicationPackageNameList);
			const isFilterInstalledApps = filterInstalledApps.value;
			const currentSearchValue = searchValue.value;
			const currentApplicationName = applicationName.value;
			const currentMergeThirdPartyAppOptimizeConfig = mergeThirdPartyAppOptimizeConfig.value;
			const installedAppName = deviceStore.installedAppNameList;
			return cachedMergeRuleList
				.reduce((result: EmbeddedMergeRuleItem[], item) => {
					const itemName = item.name.trim().toLowerCase();

					// 先更新 applicationName

					if (installedAppName[item.name] && !item.applicationName) {
						item.applicationName = installedAppName[item.name];
					}
					if (currentApplicationName[item.name] && !item.applicationName) {
						item.applicationName = currentApplicationName[item.name];
					}

					if (currentMergeThirdPartyAppOptimizeConfig[item.name]) {
						item.thirdPartyAppOptimize = true;
					} else {
						item.thirdPartyAppOptimize = false;
					}

					const itemApplicationName = item.applicationName ? item.applicationName.toLowerCase() : '';
					if (!itemName.includes(currentSearchValue) && !itemApplicationName.includes(currentSearchValue)) {
						return result;
					}

					// 如果 filterInstalledApps 为 true，检查 item 是否为已安装的应用
					if (isFilterInstalledApps && !isInstalled.has(item.name)) {
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

		// 是否弹出错误信息弹窗
		const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));
		// 应用总数
		const ruleCount = computed(() => mergeRuleList.value.length);
		// 加载状态
		const loading = ref<boolean>(true);
		// 错误存储
		const errorLogging = reactive<ErrorLogging[]>([]);
		//
		const allPackageName = computed(() => {
			return new Set([
				...(isPatchMode.value
					? Object.keys(patchEmbeddedRulesList.value)
					: Object.keys(sourceEmbeddedRulesList.value)),
				...(isPatchMode.value
					? Object.keys(patchFixedOrientationList.value)
					: Object.keys(sourceFixedOrientationList.value)),
				...Object.keys(customConfigEmbeddedRulesList.value),
				...Object.keys(customConfigFixedOrientationList.value),
			]);
		});

		function updateMergeRuleList() {
			const deviceStore = useDeviceStore();
			mergeRuleList.value = xmlFormat.mergeEmbeddedRule(
				isPatchMode.value ? patchEmbeddedRulesList.value : sourceEmbeddedRulesList.value,
				isPatchMode.value ? patchFixedOrientationList.value : sourceFixedOrientationList.value,
				deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
					? isPatchMode.value
						? patchEmbeddedSettingConfig.value
						: sourceEmbeddedSettingConfig.value
					: systemEmbeddedSettingConfig.value,
				customConfigEmbeddedRulesList.value,
				customConfigFixedOrientationList.value,
				customConfigEmbeddedSettingConfig.value,
			);
		}

		async function initDefault() {
			const deviceStore = useDeviceStore();
			loading.value = true;
			// 获取所有应用包名
			const applicationNameRes = await import('@/assets/applicationName.json');
			const applicationNameData = applicationNameRes.default;
			applicationName.value = applicationNameData;
			// 获取补丁模式
			const [getIsPatchModeErr, getIsPatchModeRes] = await $to<string, string>(deviceApi.getIsPatchMode());
			if (getIsPatchModeErr) {
				errorLogging.push({
					type: 'getIsPatchModeErr',
					title: '补丁模式',
					msg: getIsPatchModeErr,
				});
			} else {
				if (getIsPatchModeRes === 'true') {
					isPatchMode.value = true;
				} else {
					isPatchMode.value = false;
				}
			}

			const seriesRequests = [
				embeddedApi.getSourceEmbeddedRulesList(),
				embeddedApi.getSystemEmbeddedRulesList(),
				embeddedApi.getCustomConfigEmbeddedRulesList(),
				embeddedApi.getSourceFixedOrientationList(),
				embeddedApi.getSystemFixedOrientationList(),
				embeddedApi.getCustomConfigFixedOrientationList(),
				embeddedApi.getSourceEmbeddedSettingConfig(),
				embeddedApi.getSystemEmbeddedSettingConfig(),
				embeddedApi.getCustomConfigEmbeddedSettingConfig(),
				embeddedApi.getSourceThirdPartyAppOptimizeConfig(),
				embeddedApi.getCustomThirdPartyAppOptimizeConfig(),
				embeddedApi.getSystemAppOptimizeConfig()
			];

			const [
				[getSourceEmbeddedRulesListErr, getSourceEmbeddedRulesListRes],
				[getSystemEmbeddedRulesListErr, getSystemEmbeddedRulesListRes],
				[getCustomConfigEmbeddedRulesListErr, getCustomConfigEmbeddedRulesListRes],
				[getSourceFixedOrientationListErr, getSourceFixedOrientationListRes],
				[getSystemFixedOrientationListErr, getSystemFixedOrientationListRes],
				[getCustomConfigFixedOrientationListErr, getCustomConfigFixedOrientationListRes],
				[getSourceEmbeddedSettingConfigErr, getSourceEmbeddedSettingConfigRes],
				[getSystemEmbeddedSettingConfigErr, getSystemEmbeddedSettingConfigRes],
				[getCustomConfigEmbeddedSettingConfigErr, getCustomConfigEmbeddedSettingConfigRes],
				[getSourceThirdPartyAppOptimizeConfigErr, getSourceThirdPartyAppOptimizeConfigRes],
				[getCustomThirdCustomPartyAppOptimizeConfigErr, getCustomThirdPartyAppOptimizeConfigRes],
				[getSystemAppOptimizeConfigErr, getSystemAppOptimizeConfigRes],
			] = await Promise.all(seriesRequests.map(req => $to<string, string>(req)));

			// 获取源平行窗口列表
			if (getSourceEmbeddedRulesListErr) {
				sourceEmbeddedRulesList.value = {};
				errorLogging.push({
					type: 'sourceEmbeddedRulesList',
					title: '[模块]平行窗口配置文件',
					msg: getSourceEmbeddedRulesListErr,
				});
			}
			if (getSourceEmbeddedRulesListRes) {
				sourceEmbeddedRulesList.value = xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
					getSourceEmbeddedRulesListRes,
					'package_config',
					'package',
				);
			}

			// 获取系统内置平行窗口列表
			if (getSystemEmbeddedRulesListErr) {
				systemEmbeddedRulesList.value = {};
				errorLogging.push({
					type: 'SystemEmbeddedRulesList',
					title: '[系统]平行窗口配置文件',
					msg: getSystemEmbeddedRulesListErr,
				});
			}
			if (getSystemEmbeddedRulesListRes) {
				systemEmbeddedRulesList.value = xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
					getSystemEmbeddedRulesListRes,
					'package_config',
					'package',
				);
			}

			// 获取自定义配置平行窗口列表
			if (getCustomConfigEmbeddedRulesListErr) {
				customConfigEmbeddedRulesList.value = {};
			}
			if (getCustomConfigEmbeddedRulesListRes) {
				customConfigEmbeddedRulesList.value = xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
					getCustomConfigEmbeddedRulesListRes,
					'package_config',
					'package',
					true,
				);
				console.log(customConfigEmbeddedRulesList.value, 'customConfigEmbeddedRulesList.value');
			}

			// 获取源居中布局列表
			if (getSourceFixedOrientationListErr) {
				sourceFixedOrientationList.value = {};
				errorLogging.push({
					type: 'sourceFixedOrientationList',
					title: '[模块]信箱模式配置文件',
					msg: getSourceFixedOrientationListErr,
				});
			}
			if (getSourceFixedOrientationListRes) {
				sourceFixedOrientationList.value = xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
					getSourceFixedOrientationListRes,
					'package_config',
					'package',
				);
			}

			// 获取系统内置居中布局列表
			if (getSystemFixedOrientationListErr) {
				systemFixedOrientationList.value = {};
				// errorLogging.push({
				// 	type: 'systemFixedOrientationList',
				// 	title: '[模块]信箱模式配置文件',
				// 	msg: getSystemFixedOrientationListErr,
				// });
			}
			if (getSystemFixedOrientationListRes) {
				systemFixedOrientationList.value = xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
					getSystemFixedOrientationListRes,
					'package_config',
					'package',
				);
			}

			// 获取自定义配置居中布局列表
			if (getCustomConfigFixedOrientationListErr) {
				customConfigFixedOrientationList.value = {};
			}
			if (getCustomConfigFixedOrientationListRes) {
				customConfigFixedOrientationList.value = xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
					getCustomConfigFixedOrientationListRes,
					'package_config',
					'package',
					true,
				);
			}
			// 获取源应用横屏布局设置配置
			if (getSourceEmbeddedSettingConfigErr) {
				sourceEmbeddedSettingConfig.value = {};
			}
			if (getSourceEmbeddedSettingConfigRes) {
				sourceEmbeddedSettingConfig.value = xmlFormat.parseXMLToObject<EmbeddedSettingRuleItem>(
					getSourceEmbeddedSettingConfigRes,
					'setting_rule',
					'setting',
				);
			}
			// 获取系统应用横屏布局设置配置
			if (getSystemEmbeddedSettingConfigErr) {
				systemEmbeddedSettingConfig.value = {};
			}
			if (getSystemEmbeddedSettingConfigRes) {
				systemEmbeddedSettingConfig.value = xmlFormat.parseXMLToObject<EmbeddedSettingRuleItem>(
					getSystemEmbeddedSettingConfigRes,
					'setting_rule',
					'setting',
				);
			}
			// 获取自定义应用横屏布局设置配置
			if (getCustomConfigEmbeddedSettingConfigErr) {
				customConfigEmbeddedSettingConfig.value = {};
			}
			if (getCustomConfigEmbeddedSettingConfigRes) {
				customConfigEmbeddedSettingConfig.value = xmlFormat.parseXMLToObject<EmbeddedSettingRuleItem>(
					getCustomConfigEmbeddedSettingConfigRes,
					'setting_rule',
					'setting',
					true,
				);
			}
			// 获取源第三方应用横屏优化
			if (getSourceThirdPartyAppOptimizeConfigErr) {
				sourceThirdPartyAppOptimizeConfig.value = {};
			}
			if (getSourceThirdPartyAppOptimizeConfigRes) {
				sourceThirdPartyAppOptimizeConfig.value = thirdPartyAppOptimizeConfigFormatToJSON(
					getSourceThirdPartyAppOptimizeConfigRes,
				);
			}
			// 获取自定义第三方应用横屏优化
			if (getCustomThirdCustomPartyAppOptimizeConfigErr) {
				customThirdPartyAppOptimizeConfig.value = {};
			}
			if (getCustomThirdPartyAppOptimizeConfigRes) {
				customThirdPartyAppOptimizeConfig.value = thirdPartyAppOptimizeConfigFormatToJSON(
					getCustomThirdPartyAppOptimizeConfigRes,
				);
			}
			// 获取系统应用横屏优化
			if (getSystemAppOptimizeConfigErr) {
				systemAppOptimizeConfig.value = {}
			}
			if (getSystemAppOptimizeConfigRes) {
				systemAppOptimizeConfig.value = thirdPartyAppOptimizeConfigFormatToJSON(
					getSystemAppOptimizeConfigRes
				)
			}

			// 合并最终配置
			const logsStore = useLogsStore();
			logsStore.info('deviceStore.MIOSVersion', deviceStore.MIOSVersion);

			mergeRuleList.value = xmlFormat.mergeEmbeddedRule(
				isPatchMode.value ? patchEmbeddedRulesList.value : sourceEmbeddedRulesList.value,
				isPatchMode.value ? patchFixedOrientationList.value : sourceFixedOrientationList.value,
				deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 && deviceStore.androidTargetSdk >= 35
					? isPatchMode.value
						? patchEmbeddedSettingConfig.value
						: sourceEmbeddedSettingConfig.value
					: systemEmbeddedSettingConfig.value,
				customConfigEmbeddedRulesList.value,
				customConfigFixedOrientationList.value,
				customConfigEmbeddedSettingConfig.value,
			);

			// errorLogging.push({
			//   type: "sourceEmbeddedRulesList",
			//   title: '[模块]平行窗口配置文件',
			//   msg: '发生错误啦',
			// });

			// errorLogging.push({
			//   type: "embeddedSettingConfig",
			//   title: '[模块]应用横屏布局配置文件',
			//   msg: '发生错误啦',
			// });

			if (!errorLogging.length) {
				loading.value = false;
				if (deviceStore.needReloadData && isPatchMode.value) {
					isNeedShowReloadPathModeDialog.value = true;
				}
			}
		}

		return {
			sourceEmbeddedRulesList,
			sourceFixedOrientationList,
			patchEmbeddedRulesList,
			patchFixedOrientationList,
			patchEmbeddedSettingConfig,
			customConfigEmbeddedRulesList,
			customConfigFixedOrientationList,
			customConfigEmbeddedSettingConfig,
			sourceThirdPartyAppOptimizeConfig,
			customThirdPartyAppOptimizeConfig,
			mergeThirdPartyAppOptimizeConfig,
			systemAppOptimizeConfig,
			filterSetAppModeAppList,
			filterResetAppCompatAppList,
			systemEmbeddedSettingConfig,
			systemEmbeddedRulesList,
			systemFixedOrientationList,
			mergeRuleList,
			filterInstalledApps,
			filterMergeRuleList,
			searchKeyWord,
			errorLogging,
			isNeedShowErrorModal,
			loading,
			ruleCount,
			allPackageName,
			applicationName,
			isPatchMode,
			initDefault,
			updateMergeRuleList,
			isNeedShowReloadPathModeDialog,
		};
	},
	{
		persist: {
			pick: ['filterInstalledApps'],
		},
	},
);
