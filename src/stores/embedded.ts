import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type EmbeddedSettingRuleItem from "@/types/EmbeddedSettingRuleItem";
import type EmbeddedMergeRuleItem from "@/types/EmbeddedMergeRuleItem";
import $to from "await-to-js";
import * as ksuApi from "@/apis/ksuApi";
import * as xmlFormat from "@/utils/xmlFormat";
import type { ErrorLogging } from "@/types/ErrorLogging";



export const useEmbeddedStore = defineStore("embedded", () => {
  // 是否补丁模式
  const isPatchMode = ref<boolean>(false);
  const installedAndroidApplicationPackageNameList = ref<string[]>([]);
  // 平行窗口
  const sourceEmbeddedRulesList = ref<
    Record<EmbeddedRuleItem["name"], EmbeddedRuleItem>
  >({});
  const systemEmbeddedRulesList = ref<
    Record<EmbeddedRuleItem["name"], EmbeddedRuleItem>
  >({});
  const customConfigEmbeddedRulesList = ref<Record<string, EmbeddedRuleItem>>(
    {}
  );
  // 固定应用方向
  const sourceFixedOrientationList = ref<
    Record<string, FixedOrientationRuleItem>
  >({});
  const systemFixedOrientationList = ref<
    Record<EmbeddedRuleItem["name"], FixedOrientationRuleItem>
  >({});
  const customConfigFixedOrientationList = ref<
    Record<string, FixedOrientationRuleItem>
  >({});
  // 配置文件
  const embeddedSettingConfig = ref<Record<string, EmbeddedSettingRuleItem>>(
    {}
  );
  // diff后的平行窗口配置
  const patchEmbeddedRulesList = computed(() => {
    // 使用 Object.entries 将对象转换为键值对数组
    const entries = Object.entries(sourceEmbeddedRulesList.value);
  
    // 将 systemEmbeddedRulesList 和 installedAndroidApplicationPackageNameList 转换为 Set 以优化查找速度
    const systemKeysSet = new Set(Object.keys(systemEmbeddedRulesList.value));
    const installedKeysSet = new Set(installedAndroidApplicationPackageNameList.value);
  
    // 使用 filter 对数组进行过滤
    const filteredEntries = entries.filter(([key]) => {
      // 使用 Set 进行查找优化
      return systemKeysSet.has(key) || installedKeysSet.has(key);
    });
  
    // 将过滤后的键值对数组重新转换为对象
    return Object.fromEntries(filteredEntries) as Record<
      EmbeddedRuleItem["name"],
      EmbeddedRuleItem
    >;
  });

  // diff后的信箱模式配置
  const patchFixedOrientationList = computed(() => {
    // 使用 Object.entries 将对象转换为键值对数组
    const entries = Object.entries(sourceFixedOrientationList.value);
  
    // 将 systemFixedOrientationList 和 installedAndroidApplicationPackageNameList 转换为 Set 以优化查找速度
    const systemKeysSet = new Set(Object.keys(systemFixedOrientationList.value));
    const installedKeysSet = new Set(installedAndroidApplicationPackageNameList.value);
  
    // 使用 filter 对数组进行过滤
    const filteredEntries = entries.filter(([key]) => {
      // 使用 Set 进行查找优化
      return systemKeysSet.has(key) || installedKeysSet.has(key);
    });
  
    // 将过滤后的键值对数组重新转换为对象
    return Object.fromEntries(filteredEntries) as Record<
      FixedOrientationRuleItem["name"],
      FixedOrientationRuleItem
    >;
  });
  // 合并后的配置
  const mergeRuleList = ref<EmbeddedMergeRuleItem[]>([]);
  // 搜索后的配置列表
  const filterMergeRuleList = computed(() => {
    const searchValue = searchKeyWord.value.trim().toLowerCase(); // 缓存并提前处理 searchKeyWord
    return mergeRuleList.value
      .filter((item) => item.name.trim().toLowerCase().includes(searchValue))
      .sort((a, b) => {
        // 将 ruleType 为 'custom' 的项排在前面
        if (a.ruleMode === "custom" && b.ruleMode !== "custom") {
          return -1; // a 在前
        }
        if (a.ruleMode !== "custom" && b.ruleMode === "custom") {
          return 1; // b 在前
        }
        // 如果两者都是 'custom' 或都不是，按名称排序
        return a.name.localeCompare(b.name);
      });
  });
  // 是否弹出错误信息弹窗
  const isNeedShowErrorModal = computed(() => Boolean(errorLogging.length > 0));
  // 应用总数
  const ruleCount = computed(() => mergeRuleList.value.length);
  // 搜索值
  const searchKeyWord = ref<string>("");
  // 加载状态
  const loading = ref<boolean>(true);
  // 错误存储
  const errorLogging = reactive<ErrorLogging[]>([]);
  //
  const allPackageName = computed(() => {
    return new Set([
      ... isPatchMode.value ? Object.keys(patchEmbeddedRulesList.value) : Object.keys(sourceEmbeddedRulesList.value),
      ...isPatchMode.value ? Object.keys(patchFixedOrientationList.value)  : Object.keys(sourceFixedOrientationList.value),
      ...Object.keys(customConfigEmbeddedRulesList.value),
      ...Object.keys(customConfigFixedOrientationList.value),
    ]);
  });

  function updateMergeRuleList() {
    mergeRuleList.value = xmlFormat.mergeEmbeddedRule(
      isPatchMode.value ? patchEmbeddedRulesList.value : sourceEmbeddedRulesList.value,
      isPatchMode.value? patchFixedOrientationList.value :sourceFixedOrientationList.value,
      embeddedSettingConfig.value,
      customConfigEmbeddedRulesList.value,
      customConfigFixedOrientationList.value,
    );
  }

  async function initDefault() {
    loading.value = true;
    // 获取补丁模式
    const [getIsPatchModeErr, getIsPatchModeRes] =
      await $to<string, string>(ksuApi.getIsPatchMode());
    if (getIsPatchModeErr) {
      errorLogging.push({
        type: "getIsPatchModeErr",
        title: "补丁模式",
        msg: getIsPatchModeErr,
      });
    } else {
      if (getIsPatchModeRes === 'true') {
        isPatchMode.value = true
      } else {
        isPatchMode.value = false
      }
    }
    // 获取用户已安装的应用包名
    const [getAndroidApplicationPackageNameListErr, getAndroidApplicationPackageNameListRes] =
      await $to<string, string>(ksuApi.getAndroidApplicationPackageNameList());
    if (getAndroidApplicationPackageNameListErr) {
      errorLogging.push({
        type: "getAndroidApplicationPackageNameListErr",
        title: "获取用户已安装的应用包名",
        msg: getAndroidApplicationPackageNameListErr,
      });
    } else {
      if (getAndroidApplicationPackageNameListRes) {
        installedAndroidApplicationPackageNameList.value = getAndroidApplicationPackageNameListRes?.split(',')
      }
    }
    // 获取源平行窗口列表
    const [getSourceEmbeddedRulesListErr, getSourceEmbeddedRulesListRes] =
      await $to<string, string>(ksuApi.getSourceEmbeddedRulesList());
    if (getSourceEmbeddedRulesListErr) {
      errorLogging.push({
        type: "sourceEmbeddedRulesList",
        title: "[模块]平行窗口配置文件",
        msg: getSourceEmbeddedRulesListErr,
      });
    }

    if (getSourceEmbeddedRulesListRes) {
      sourceEmbeddedRulesList.value =
        xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
          getSourceEmbeddedRulesListRes,
          "package_config",
          "package"
        );
    }

    // 获取系统内置平行窗口列表

    const [getSystemEmbeddedRulesListErr, getSystemEmbeddedRulesListRes] =
      await $to<string, string>(ksuApi.getSystemEmbeddedRulesList());
    if (getSystemEmbeddedRulesListErr) {
      errorLogging.push({
        type: "SystemEmbeddedRulesList",
        title: "[系统]平行窗口配置文件",
        msg: getSystemEmbeddedRulesListErr,
      });
    }

    if (getSystemEmbeddedRulesListRes) {
      systemEmbeddedRulesList.value =
        xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
          getSystemEmbeddedRulesListRes,
          "package_config",
          "package"
        );
    }

    // 获取自定义配置平行窗口列表
    const [
      getCustomConfigEmbeddedRulesListErr,
      getCustomConfigEmbeddedRulesListRes,
    ] = await $to(ksuApi.getCustomConfigEmbeddedRulesList());
    if (!getCustomConfigEmbeddedRulesListErr) {
      customConfigEmbeddedRulesList.value =
        xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
          getCustomConfigEmbeddedRulesListRes,
          "package_config",
          "package",
          true
        );
      console.log(
        customConfigEmbeddedRulesList.value,
        "customConfigEmbeddedRulesList.value"
      );
    }

    // 获取源居中布局列表
    const [getSourceFixedOrientationListErr, getSourceFixedOrientationListRes] =
      await $to<string, string>(ksuApi.getSourceFixedOrientationList());
    if (getSourceFixedOrientationListErr) {
      errorLogging.push({
        type: "sourceFixedOrientationList",
        title: "[模块]信箱模式配置文件",
        msg: getSourceFixedOrientationListErr,
      });
    }

    if (getSourceFixedOrientationListRes) {
      sourceFixedOrientationList.value =
        xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
          getSourceFixedOrientationListRes,
          "package_config",
          "package"
        );
    }

    // 获取系统内置平行窗口列表

    const [getSystemFixedOrientationListErr, getSystemFixedOrientationListRes] =
      await $to<string, string>(ksuApi.getSystemFixedOrientationList());
    if (getSystemFixedOrientationListErr) {
      errorLogging.push({
        type: "SystemEmbeddedRulesList",
        title: "[系统]信箱模式配置文件",
        msg: getSystemFixedOrientationListErr,
      });
    }

    if (getSystemFixedOrientationListRes) {
      systemFixedOrientationList.value =
        xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
          getSystemFixedOrientationListRes,
          "package_config",
          "package"
        );
    }

    // 获取自定义配置居中布局列表
    const [
      getCustomConfigFixedOrientationListErr,
      getCustomConfigFixedOrientationListRes,
    ] = await $to(ksuApi.getCustomConfigFixedOrientationList());
    if (!getCustomConfigFixedOrientationListErr) {
      customConfigFixedOrientationList.value =
        xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
          getCustomConfigFixedOrientationListRes,
          "package_config",
          "package",
          true
        );
    }

    // 获取嵌入设置配置
    const [getEmbeddedSettingConfigErr, getEmbeddedSettingConfigRes] =
      await $to(ksuApi.getEmbeddedSettingConfig());
    if (getEmbeddedSettingConfigErr) {
      // errorLogging.push({
      //   type: "embeddedSettingConfig",
      //   title: '[模块]应用横屏布局配置文件',
      //   msg: getEmbeddedSettingConfigErr,
      // });
      embeddedSettingConfig.value = {};
    } else {
      embeddedSettingConfig.value =
        xmlFormat.parseXMLToObject<EmbeddedSettingRuleItem>(
          getEmbeddedSettingConfigRes,
          "setting_rule",
          "setting"
        );
    }

    // 合并最终配置
    mergeRuleList.value = xmlFormat.mergeEmbeddedRule(
      isPatchMode.value ? patchEmbeddedRulesList.value : sourceEmbeddedRulesList.value,
      isPatchMode.value? patchFixedOrientationList.value :sourceFixedOrientationList.value,
      embeddedSettingConfig.value,
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
  }

  return {
    sourceEmbeddedRulesList,
    sourceFixedOrientationList,
    patchEmbeddedRulesList,
    patchFixedOrientationList,
    customConfigEmbeddedRulesList,
    customConfigFixedOrientationList,
    embeddedSettingConfig,
    mergeRuleList,
    filterMergeRuleList,
    searchKeyWord,
    errorLogging,
    isNeedShowErrorModal,
    loading,
    ruleCount,
    allPackageName,
    isPatchMode,
    initDefault,
    updateMergeRuleList,
  };
});
