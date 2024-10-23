import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import type AutoUIItem from '@/types/AutoUIItem';
import type AutoUISettingRuleItem from '@/types/AutoUISettingRuleItem';
import type AutoUIMergeRuleItem from '@/types/AutoUIMergeRuleItem';
import $to from 'await-to-js';
import * as ksuApi from '@/apis/ksuApi';
import * as xmlFormat from '@/utils/xmlFormat';
import type { ErrorLogging } from '@/types/ErrorLogging';
type ApplicationName = Record<string, string>;
import { useDeviceStore } from './device';

export const useAutoUIStore = defineStore(
	'autoui',() => {
		const filterInstalledApps = ref<boolean>(false);
		// 应用布局优化
		const sourceAutoUIList = ref<Record<AutoUIItem['name'], AutoUIItem>>({});
		const customConfigAutoUIList = ref<Record<string, AutoUIItem>>({});
    const applicationName = ref<ApplicationName>({});
		// 配置文件
		const autoUISettingConfig = ref<Record<string, AutoUISettingRuleItem>>({});
		// 合并后的配置
		const mergeRuleList = ref<AutoUIMergeRuleItem[]>([]);
		// 搜索后的配置列表
		const filterMergeRuleList = computed(() => {
			const searchValue = searchKeyWord.value.trim().toLowerCase();
			const cachedMergeRuleList = mergeRuleList.value;
			const deviceStore = useDeviceStore();
			return cachedMergeRuleList
				.reduce((result: AutoUIMergeRuleItem[], item) => {
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
			const allPackages = new Set([
				...Object.keys(sourceAutoUIList.value),
				...Object.keys(customConfigAutoUIList.value),
			]);
			return allPackages;
		});

		function updateMergeRuleList() {
			mergeRuleList.value = xmlFormat.mergeAutoUIRule(
				sourceAutoUIList.value,
				customConfigAutoUIList.value,
				autoUISettingConfig.value,
			);
		}

		async function initDefault() {
			loading.value = true;
			// 获取所有应用包名
      const applicationNameRes = await import('@/assets/applicationName.json')
      const applicationNameData = applicationNameRes.default;
      applicationName.value = applicationNameData;
			// 获取源应用布局优化列表
			const [getSourceAutoUIListErr, getSourceAutoUIListRes] = await $to<string, string>(
				ksuApi.getSourceAutoUIList(),
			);
			if (getSourceAutoUIListErr) {
				errorLogging.push({
					type: 'sourceAutoUIList',
					title: '[模块]应用布局优化配置文件',
					msg: getSourceAutoUIListErr,
				});
			}

			if (getSourceAutoUIListRes) {
				sourceAutoUIList.value = xmlFormat.parseXMLToObject<AutoUIItem>(
					getSourceAutoUIListRes,
					'packageRules',
					'package',
				);
			}

			// 获取自定义配置嵌入规则列表
			const [getCustomConfigAutoUIListErr, getCustomConfigAutoUIListRes] = await $to(
				ksuApi.getCustomConfigAutoUIList(),
			);
			if (!getCustomConfigAutoUIListErr) {
				customConfigAutoUIList.value = xmlFormat.parseXMLToObject<AutoUIItem>(
					getCustomConfigAutoUIListRes,
					'packageRules',
					'package',
					true,
				);
			}

			// 获取设置配置
			const [getAutoUISettingConfigErr, getAutoUISettingConfigRes] = await $to<string, string>(
				ksuApi.getAutoUISettingConfig(),
			);
			if (getAutoUISettingConfigErr) {
				autoUISettingConfig.value = {};
				// errorLogging.push({
				//   type: "autoUISettingConfig",
				//   title: "[模块]应用布局优化配置文件",
				//   msg: getAutoUISettingConfigErr,
				// });
			}

			if (getAutoUISettingConfigRes) {
				autoUISettingConfig.value = xmlFormat.parseXMLToObject<AutoUISettingRuleItem>(
					getAutoUISettingConfigRes,
					'setting_config',
					'setting',
				);
			}

			// 合并最终配置
			mergeRuleList.value = xmlFormat.mergeAutoUIRule(
				sourceAutoUIList.value,
				customConfigAutoUIList.value,
				autoUISettingConfig.value,
			);

			if (!errorLogging.length) {
				loading.value = false;
			}
		}

		return {
			sourceAutoUIList,
			customConfigAutoUIList,
			autoUISettingConfig,
			mergeRuleList,
			filterMergeRuleList,
			searchKeyWord,
			errorLogging,
			isNeedShowErrorModal,
			updateMergeRuleList,
			filterInstalledApps,
			loading,
			ruleCount,
			allPackageName,
			initDefault,
		};
	},
	{
		persist: {
			pick: ['filterInstalledApps'],
		},
	},
);
