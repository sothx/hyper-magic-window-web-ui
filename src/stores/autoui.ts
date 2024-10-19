import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import type AutoUIItem from "@/types/AutoUIItem";
import type AutoUISettingRuleItem from "@/types/AutoUISettingRuleItem";
import type AutoUIMergeRuleItem from "@/types/AutoUIMergeRuleItem";
import $to from "await-to-js";
import * as ksuApi from "@/apis/ksuApi";
import * as xmlFormat from "@/utils/xmlFormat";
import type { ErrorLogging } from "@/types/ErrorLogging";


export const useAutoUIStore = defineStore("autoui", () => {
  // 应用布局优化
  const sourceAutoUIList = ref<Record<AutoUIItem["name"], AutoUIItem>>({});
  const customConfigAutoUIList = ref<Record<string, AutoUIItem>>({});
  // 配置文件
  const autoUISettingConfig = ref<Record<string, AutoUISettingRuleItem>>({});
  // 合并后的配置
  const mergeRuleList = ref<AutoUIMergeRuleItem[]>([]);
  // 搜索后的配置列表
  const filterMergeRuleList = computed(() => {
    const searchValue = searchKeyWord.value.toLowerCase(); // 缓存并提前处理 searchKeyWord
    return mergeRuleList.value
      .filter((item) => item.name.toLowerCase().includes(searchValue))
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
      autoUISettingConfig.value
    );
  }

  async function initDefault() {
    loading.value = true;
    // 获取源应用布局优化列表
    const [getSourceAutoUIListErr, getSourceAutoUIListRes] = await $to<
      string,
      string
    >(ksuApi.getSourceAutoUIList());
    if (getSourceAutoUIListErr) {
      errorLogging.push({
        type: "sourceAutoUIList",
        title: "[模块]应用布局优化配置文件",
        msg: getSourceAutoUIListErr,
      });
    }

    if (getSourceAutoUIListRes) {
      sourceAutoUIList.value = xmlFormat.parseXMLToObject<AutoUIItem>(
        getSourceAutoUIListRes,
        "packageRules",
        "package"
      );
    }

    // 获取自定义配置嵌入规则列表
    const [getCustomConfigAutoUIListErr, getCustomConfigAutoUIListRes] =
      await $to(ksuApi.getCustomConfigAutoUIList());
    if (!getCustomConfigAutoUIListErr) {
      customConfigAutoUIList.value = xmlFormat.parseXMLToObject<AutoUIItem>(
        getCustomConfigAutoUIListRes,
        "packageRules",
        "package",
        true
      );
    }

    // 获取设置配置
    const [getAutoUISettingConfigErr, getAutoUISettingConfigRes] = await $to<
      string,
      string
    >(ksuApi.getAutoUISettingConfig());
    if (getAutoUISettingConfigErr) {
      autoUISettingConfig.value = {};
      // errorLogging.push({
      //   type: "autoUISettingConfig",
      //   title: "[模块]应用布局优化配置文件",
      //   msg: getAutoUISettingConfigErr,
      // });
    }

    if (getAutoUISettingConfigRes) {
      autoUISettingConfig.value =
        xmlFormat.parseXMLToObject<AutoUISettingRuleItem>(
          getAutoUISettingConfigRes,
          "setting_config",
          "setting"
        );
    }

    // 合并最终配置
    mergeRuleList.value = xmlFormat.mergeAutoUIRule(
      sourceAutoUIList.value,
      customConfigAutoUIList.value,
      autoUISettingConfig.value
    );

    // errorLogging.push({
    //   type: "sourceEmbeddedRulesList",
    //   title: '[模块]平行窗口配置文件',
    //   msg: new Error('发生错误啦'),
    // });

    // errorLogging.push({
    //   type: "embeddedSettingConfig",
    //   title: '[模块]应用横屏布局配置文件',
    //   msg: new Error('发生错误啦'),
    // });

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
    loading,
    ruleCount,
    allPackageName,
    initDefault,
  };
});
