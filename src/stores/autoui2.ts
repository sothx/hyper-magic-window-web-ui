import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import type AutoUISettingRuleItem from '@/types/AutoUISettingRuleItem';
import PinyinMatch from 'pinyin-match';
import $to from 'await-to-js';
import * as autouiApi from '@/apis/autouiApi';
import * as xmlFormat from '@/utils/xmlFormat';
import type { ErrorLogging } from '@/types/ErrorLogging';
type ApplicationName = Record<string, string>;
import { useDeviceStore } from './device';
import type { AutoUI2Package, AutoUI2PackageRules } from "@/types/AutoUI2PackageRules"
import type AutoUI2MergeRuleItem from '@/types/AutoUI2MergeRuleItem';

export const useAutoUI2Store = defineStore(
  'autoui2',
  () => {
    const filterInstalledApps = ref<boolean>(false);
    // 应用布局优化2.0
    const sourceAutoUI2List = ref<Record<string, AutoUI2Package>>({});
    const customConfigAutoUI2List = ref<Record<string, AutoUI2Package>>({});
    const customConfigAutoUI2EnableJson = ref<Record<string, boolean>>({});
    const patchRuleAutoUI2List = ref<Record<string, AutoUI2Package>>({});
    const applicationName = ref<ApplicationName>({});
    // 配置文件
    const autoUISettingConfig = ref<Record<string, AutoUISettingRuleItem>>({});
    // 合并后的配置
    const mergeRuleList = ref<AutoUI2MergeRuleItem[]>([]);
    // 记忆选中的 tab
    const activeTab = ref<string>('autoui1');
    // 搜索后的配置列表
    const filterMergeRuleList = computed(() => {
      const searchValue = searchKeyWord.value.trim().toLowerCase();
      let cachedMergeRuleList = mergeRuleList.value;
      const deviceStore = useDeviceStore();
      const installedAppName = deviceStore.installedAppPackageInfoMap;

      return cachedMergeRuleList
        .reduce((result: AutoUI2MergeRuleItem[], item) => {
          const itemName = item.name.trim().toLowerCase();

          // 先更新 applicationName
          if (installedAppName[item.name]?.appLabel && !item.applicationName) {
            item.applicationName = installedAppName[item.name].appLabel;
          }
          if (applicationName.value[item.name] && !item.applicationName) {
            item.applicationName = applicationName.value[item.name];
          }

          // 过滤条件，检查 name 和 applicationName
          const applicationNameLower = item.applicationName ? item.applicationName.toLowerCase() : '';

          const isMatched =
            itemName.includes(searchValue) ||
            applicationNameLower.includes(searchValue) ||
            PinyinMatch.match(applicationNameLower, searchValue);

          if (!isMatched) {
            return result;
          }

          const isInstalled = new Set(deviceStore.installedAndroidApplicationPackageList);

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
        ...Object.keys(sourceAutoUI2List.value),
        ...Object.keys(customConfigAutoUI2List.value),
      ]);
      return allPackages;
    });

    function updateMergeRuleList() {
      mergeRuleList.value = xmlFormat.mergeAutoUI2Rule(
        sourceAutoUI2List.value,
        customConfigAutoUI2List.value,
        autoUISettingConfig.value,
      );
    }

    async function initDefault() {
      loading.value = true;
      // 获取所有应用包名
      const applicationNameRes = await import('@/assets/applicationName.json');
      const applicationNameData = applicationNameRes.default;
      applicationName.value = applicationNameData;

      const deviceStore = useDeviceStore();

      const [getSourceAutoUI2ListErr, getSourceAutoUI2ListRes] = await $to<string, string>(
        autouiApi.getSourceAutoUI2List(),
      );
      if (getSourceAutoUI2ListErr) {
        sourceAutoUI2List.value = {}
      }

      if (getSourceAutoUI2ListRes) {
        sourceAutoUI2List.value = xmlFormat.parseAutoUI2PackageRulesXml(
          getSourceAutoUI2ListRes
        );
      }

      // 获取 patch_rule 配置（定制模式下）
      if (deviceStore.isPatchMode) {
        // 2.0 自定义：autoui2_list.xml（规则体） + autoui2_enable.json（仅 enable）
        const [getCustomAutoUI2ListErr, getCustomAutoUI2ListRes] = await $to(autouiApi.getCustomConfigAutoUI2List());
        const [getCustomEnableJsonErr, getCustomEnableJsonRes] = await $to(autouiApi.getCustomConfigAutoUI2EnableJson());
        const deployXml =
          !getCustomAutoUI2ListErr && typeof getCustomAutoUI2ListRes === 'string' ? getCustomAutoUI2ListRes : '';
        const enableJson =
          !getCustomEnableJsonErr && typeof getCustomEnableJsonRes === 'string' ? getCustomEnableJsonRes : undefined;

        // 分别存储 XML 配置和 JSON enable 状态
        if (deployXml.trim()) {
          customConfigAutoUI2List.value = xmlFormat.parseAutoUI2PackageRulesXml(deployXml);
        }

        if (enableJson?.trim()) {
          try {
            const parsed = JSON.parse(enableJson);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              customConfigAutoUI2EnableJson.value = parsed as Record<string, boolean>;
            }
          } catch {
            // JSON 解析失败，忽略
          }
        }
        const [getPatchRuleErr, getPatchRuleRes] = await $to(autouiApi.getPatchRuleAutoUI2List());
        if (!getPatchRuleErr && typeof getPatchRuleRes === 'string' && getPatchRuleRes.trim()) {
          patchRuleAutoUI2List.value = xmlFormat.parseAutoUI2PackageRulesXml(getPatchRuleRes);
        }
      }

      // 获取设置配置
      const [getAutoUISettingConfigErr, getAutoUISettingConfigRes] = await $to<string, string>(
        autouiApi.getAutoUISettingConfig(),
      );
      if (getAutoUISettingConfigErr) {
        autoUISettingConfig.value = {};
      }

      if (getAutoUISettingConfigRes) {
        autoUISettingConfig.value = xmlFormat.parseXMLToObject<AutoUISettingRuleItem>(
          getAutoUISettingConfigRes,
          'setting_config',
          'setting',
        );
      }

      // 合并最终配置
      mergeRuleList.value = xmlFormat.mergeAutoUI2Rule(
        sourceAutoUI2List.value,
        customConfigAutoUI2List.value,
        autoUISettingConfig.value,
      );

      if (!errorLogging.length) {
        loading.value = false;
      }
    }

    return {
      sourceAutoUI2List,
      customConfigAutoUI2List,
      customConfigAutoUI2EnableJson,
      patchRuleAutoUI2List,
      autoUISettingConfig,
      mergeRuleList,
      filterMergeRuleList,
      applicationName,
      searchKeyWord,
      errorLogging,
      isNeedShowErrorModal,
      updateMergeRuleList,
      filterInstalledApps,
      loading,
      ruleCount,
      allPackageName,
      initDefault,
      activeTab,
    };
  },
  {
    persist: {
      pick: ['filterInstalledApps', 'activeTab'],
    },
  },
);
