import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type SettingRuleItem from "@/types/SettingRuleItem";
import type MergeRuleItem from "@/types/MergeRuleItem";

export const useEmbeddedStore = defineStore("embedded", () => {
  // 平行窗口
  const sourceEmbeddedRulesList = reactive<Record<string, EmbeddedRuleItem>>({});
  const customConfigEmbeddedRulesList = reactive<Record<string, EmbeddedRuleItem>>({});
  // 固定应用方向
  const sourceFixedOrientationList = reactive<Record<string, FixedOrientationRuleItem>>({});
  const customConfigFixedOrientationList = reactive<Record<string, FixedOrientationRuleItem>>({});
  // 配置文件
  const embeddedSettingConfig = reactive<Record<string,SettingRuleItem>>({});
  // 合并后的配置
  const mergeRuleList = reactive<MergeRuleItem[]>([]);

  return {
    sourceEmbeddedRulesList,
    sourceFixedOrientationList,
    customConfigEmbeddedRulesList,
    customConfigFixedOrientationList,
    embeddedSettingConfig,
    mergeRuleList
  };
});
