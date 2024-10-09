import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useEmbeddedStore = defineStore("embedded", () => {
  const sourceEmbeddedRulesList = ref<Object>();
  const sourceFixedOrientationList = ref<Object>();
  const customConfigEmbeddedRulesList = ref<Object>();
  const customConfigFixedOrientationList = ref<Object>();
  const embeddedSettingConfig = ref<Object>();

  return {
    sourceEmbeddedRulesList,
    sourceFixedOrientationList,
    customConfigEmbeddedRulesList,
    customConfigFixedOrientationList,
    embeddedSettingConfig
  };
});
