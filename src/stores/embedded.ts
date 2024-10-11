import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type SettingRuleItem from "@/types/SettingRuleItem";
import type MergeRuleItem from "@/types/MergeRuleItem";
import $to from "await-to-js";
import * as ksuApi from "@/apis/ksuApi";
import * as xmlFormat from "@/utils/xmlFormat";

interface ErrorLogging {
  type: string;
  msg: Error;
}

export const useEmbeddedStore = defineStore("embedded", () => {
  // 平行窗口
  let sourceEmbeddedRulesList = ref<
    Record<EmbeddedRuleItem["name"], EmbeddedRuleItem>
  >({});
  const customConfigEmbeddedRulesList = ref<Record<string, EmbeddedRuleItem>>(
    {}
  );
  // 固定应用方向
  const sourceFixedOrientationList = ref<
    Record<string, FixedOrientationRuleItem>
  >({});
  const customConfigFixedOrientationList = ref<
    Record<string, FixedOrientationRuleItem>
  >({});
  // 配置文件
  const embeddedSettingConfig = ref<Record<string, SettingRuleItem>>({});
  // 合并后的配置
  const mergeRuleList = ref<MergeRuleItem[]>([]);
  // 搜索后的配置列表
  const filterMergeRuleList = computed(() => {
    const searchValue = searchName.value.toLowerCase();  // 缓存并提前处理 searchName
    return mergeRuleList.value.filter(item => item.name.toLowerCase().includes(searchValue));
  });
  // 应用总数
  const ruleCount = computed(() => mergeRuleList.value.length);
  const searchName = ref<string>('');
  const loading = ref<boolean>(true);
  const errorLogging = reactive<ErrorLogging[]>([]);

  async function initDefault() {
    // 获取源嵌入规则列表
    const [getSourceEmbeddedRulesListErr, getSourceEmbeddedRulesListRes] =
      await $to(ksuApi.getSourceEmbeddedRulesList());
    if (getSourceEmbeddedRulesListErr) {
      errorLogging.push({
        type: "sourceEmbeddedRulesList",
        msg: getSourceEmbeddedRulesListErr,
      });
    } else {
      sourceEmbeddedRulesList.value = xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
        getSourceEmbeddedRulesListRes
      );
    }

    // 获取自定义配置嵌入规则列表
    const [
      getCustomConfigEmbeddedRulesListErr,
      getCustomConfigEmbeddedRulesListRes,
    ] = await $to(ksuApi.getCustomConfigEmbeddedRulesList());
    if (!getCustomConfigEmbeddedRulesListErr) {
      customConfigEmbeddedRulesList.value = xmlFormat.parseXMLToObject<EmbeddedRuleItem>(
        getCustomConfigEmbeddedRulesListRes
      );
    }

    // 获取源固定方向列表
    const [getSourceFixedOrientationListErr, getSourceFixedOrientationListRes] =
      await $to(ksuApi.getSourceFixedOrientationList());
    if (getSourceFixedOrientationListErr) {
      errorLogging.push({
        type: "sourceFixedOrientationList",
        msg: getSourceFixedOrientationListErr,
      });
    } else {
      sourceFixedOrientationList.value = xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
        getSourceFixedOrientationListRes
      );
    }

    // 获取自定义配置固定方向列表
    const [
      getCustomConfigFixedOrientationListErr,
      getCustomConfigFixedOrientationListRes,
    ] = await $to(ksuApi.getCustomConfigFixedOrientationList());
    if (!getCustomConfigFixedOrientationListErr) {
      customConfigFixedOrientationList.value = xmlFormat.parseXMLToObject<FixedOrientationRuleItem>(
        getCustomConfigFixedOrientationListRes
      );
    }

    // 获取嵌入设置配置
    const [getEmbeddedSettingConfigErr, getEmbeddedSettingConfigRes] =
      await $to(ksuApi.getEmbeddedSettingConfig());
    if (getEmbeddedSettingConfigErr) {
      errorLogging.push({
        type: "embeddedSettingConfig",
        msg: getEmbeddedSettingConfigErr,
      });
    } else {
      embeddedSettingConfig.value = xmlFormat.parseXMLToObject<SettingRuleItem>(
        getEmbeddedSettingConfigRes,
        'setting_rule',
        'setting'
      );
    }

    // 合并最终配置
    mergeRuleList.value = xmlFormat.mergeRule(sourceEmbeddedRulesList.value,sourceFixedOrientationList.value,embeddedSettingConfig.value,customConfigEmbeddedRulesList.value,customConfigFixedOrientationList.value);

  }

  return {
    sourceEmbeddedRulesList,
    sourceFixedOrientationList,
    customConfigEmbeddedRulesList,
    customConfigFixedOrientationList,
    embeddedSettingConfig,
    mergeRuleList,
    filterMergeRuleList,
    searchName,
    errorLogging,
    loading,
    ruleCount,
    initDefault,
  };
});
