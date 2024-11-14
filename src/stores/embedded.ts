import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import type EmbeddedRuleItem from '@/types/EmbeddedRuleItem';
import type FixedOrientationRuleItem from '@/types/FixedOrientationRuleItem';
import type EmbeddedSettingRuleItem from '@/types/EmbeddedSettingRuleItem';
import type EmbeddedMergeRuleItem from '@/types/EmbeddedMergeRuleItem';
import $to from 'await-to-js';
import * as ksuApi from '@/apis/ksuApi';
import * as xmlFormat from '@/utils/xmlFormat';
import type { ErrorLogging } from '@/types/ErrorLogging';
import whitelistApplications from '@/config/whitelistApplications';
import { useDeviceStore } from './device';
import eventBus from '@/utils/eventBus';
type ApplicationName = Record<string, string>;

export const useEmbeddedStore = defineStore(
	'embedded',
	() => {
		// 是否补丁模式
		const isPatchMode = ref<boolean>(false);
		const lastCheckPatchModeTime = ref<string>();
		const filterInstalledApps = ref<boolean>(false);
		const applicationName = ref<ApplicationName>({});
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
		// diff后的平行窗口配置
		const patchEmbeddedRulesList = computed((): Record<EmbeddedRuleItem['name'], EmbeddedRuleItem> => {
			const deviceStore = useDeviceStore();
			const combinedSet = new Set([
				...Object.keys(systemEmbeddedRulesList.value),
				...Object.keys(systemFixedOrientationList.value),
				...deviceStore.installedAndroidApplicationPackageNameList,
				...whitelistApplications,
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
					...whitelistApplications,
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
					...whitelistApplications,
				]);

				const filteredEntries = Object.entries(systemEmbeddedSettingConfig.value).filter(([key]) =>
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
		// 搜索后的配置列表
		const filterMergeRuleList = computed(() => {
			const searchValue = searchKeyWord.value.trim().toLowerCase();
			const cachedMergeRuleList = mergeRuleList.value;
			const deviceStore = useDeviceStore();

			return cachedMergeRuleList
				.reduce((result: EmbeddedMergeRuleItem[], item) => {
					const itemName = item.name.trim().toLowerCase();

					// 先更新 applicationName
					if (applicationName.value[item.name]) {
						item.applicationName = applicationName.value[item.name];
					}

					// 过滤条件，检查 name 和 applicationName
					const applicationNameLower = item.applicationName ? item.applicationName.toLowerCase() : '';

					if (!itemName.includes(searchValue) && !applicationNameLower.includes(searchValue)) {
						return result;
					}

					const isInstalled = new Set(deviceStore.installedAndroidApplicationPackageNameList);

					// 如果 filterInstalledApps 为 true，检查 item 是否为已安装的应用
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

		// 自动检查定制模式规则是否需要更新
		const checkPatchModeIsNeedReload = () => {
			const now = Date.now();
			const deviceStore = useDeviceStore();
			const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000;
			if (
				!lastCheckPatchModeTime.value ||
				now - parseInt(lastCheckPatchModeTime.value) > threeDaysInMilliseconds
			) {
				lastCheckPatchModeTime.value = now.toString();
				if (
					isPatchMode &&
					deviceStore.lastInstalledAndroidApplicationPackageNameList.length !==
						deviceStore.installedAndroidApplicationPackageNameList.length
				) {
					const isNeedReloadPathRule = deviceStore.lastInstalledAndroidApplicationPackageNameList.some(
						item => {
							return !allPackageName.value.has(item);
						},
					);
					if (isNeedReloadPathRule && isPatchMode) {
						eventBus.emit('isNeedReloadPatchRule');
					}
				}
			}
		};

		// 是否弹出错误信息弹窗
		const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));
		// 应用总数
		const ruleCount = computed(() => mergeRuleList.value.length);
		// 搜索值
		const searchKeyWord = ref<string>('');
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
			mergeRuleList.value = xmlFormat.mergeEmbeddedRule(
				isPatchMode.value ? patchEmbeddedRulesList.value : sourceEmbeddedRulesList.value,
				isPatchMode.value ? patchFixedOrientationList.value : sourceFixedOrientationList.value,
				systemEmbeddedSettingConfig.value,
				customConfigEmbeddedRulesList.value,
				customConfigFixedOrientationList.value,
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
			const [getIsPatchModeErr, getIsPatchModeRes] = await $to<string, string>(ksuApi.getIsPatchMode());
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
				ksuApi.getSourceEmbeddedRulesList(),
				ksuApi.getSystemEmbeddedRulesList(),
				ksuApi.getCustomConfigEmbeddedRulesList(),
				ksuApi.getSourceFixedOrientationList(),
				ksuApi.getSystemFixedOrientationList(),
				ksuApi.getCustomConfigFixedOrientationList(),
        ksuApi.getSourceEmbeddedSettingConfig(),
				ksuApi.getSystemEmbeddedSettingConfig(),
        ksuApi.getCustomConfigEmbeddedSettingConfig(),
			];

			const [
				[getSourceEmbeddedRulesListErr, getSourceEmbeddedRulesListRes],
				[getSystemEmbeddedRulesListErr, getSystemEmbeddedRulesListRes],
				[getCustomConfigEmbeddedRulesListErr, getCustomConfigEmbeddedRulesListRes],
				[getSourceFixedOrientationListErr, getSourceFixedOrientationListRes],
				[getSystemFixedOrientationListErr, getSystemFixedOrientationListRes],
				[getCustomConfigFixedOrientationListErr, getCustomConfigFixedOrientationListRes],
        [getSourceEmbeddedSettingConfigErr,getSourceEmbeddedSettingConfigRes],
				[getSystemEmbeddedSettingConfigErr, getSystemEmbeddedSettingConfigRes],
        [getCustomConfigEmbeddedSettingConfigErr,getCustomConfigEmbeddedSettingConfigRes],
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
				errorLogging.push({
					type: 'systemFixedOrientationList',
					title: '[模块]信箱模式配置文件',
					msg: getSystemFixedOrientationListErr,
				});
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
        sourceEmbeddedSettingConfig.value = {}
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

			// 合并最终配置
			mergeRuleList.value = xmlFormat.mergeEmbeddedRule(
				isPatchMode.value ? patchEmbeddedRulesList.value : sourceEmbeddedRulesList.value,
				isPatchMode.value ? patchFixedOrientationList.value : sourceFixedOrientationList.value,
				deviceStore.MIOSVersion && deviceStore.MIOSVersion >= 2 ? (isPatchMode.value ? patchEmbeddedSettingConfig.value : sourceEmbeddedSettingConfig.value) : systemEmbeddedSettingConfig.value,
				customConfigEmbeddedRulesList.value,
				customConfigFixedOrientationList.value,
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
			}

			checkPatchModeIsNeedReload();
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
			lastCheckPatchModeTime,
			updateMergeRuleList,
		};
	},
	{
		persist: {
			pick: ['lastCheckPatchModeTime', 'filterInstalledApps'],
		},
	},
);
