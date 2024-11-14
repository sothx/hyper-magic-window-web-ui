import type EmbeddedMergeRuleItem from "@/types/EmbeddedMergeRuleItem";
import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";

export const getSettingMode = (embeddedConfig:EmbeddedRuleItem,fixedOrientationConfig: FixedOrientationRuleItem) => {
    const getSupportModes = fixedOrientationConfig?.supportModes?.split(',')
    const getDefaultSettings = fixedOrientationConfig?.defaultSettings
    let settingMode: EmbeddedMergeRuleItem["settingMode"] = "disabled";
    if (fixedOrientationConfig) {
        settingMode = 'fixedOrientation'
      }
      if (fixedOrientationConfig && fixedOrientationConfig.hasOwnProperty('disable') && !fixedOrientationConfig.disable) {
        settingMode = 'disabled'
      }
      if (fixedOrientationConfig && fixedOrientationConfig.hasOwnProperty('supportModes') && getSupportModes?.includes('full') && (!getDefaultSettings || getDefaultSettings === 'full')) {
        settingMode = "fullScreen";
      }
      if (embeddedConfig && !embeddedConfig.hasOwnProperty('fullRule') && (!getDefaultSettings || getDefaultSettings === 'ae')) {
        settingMode = 'embedded'
      }
      return settingMode
}

export const getAppModeCode = (settingMode: EmbeddedMergeRuleItem["settingMode"]) => {
    if (settingMode === 'disabled') {
        return 0;
    }

    if (settingMode === 'embedded') {
        return 1;
    }

    if (settingMode === 'fixedOrientation') {
        return 2;
    }

    if (settingMode === 'fullScreen') {
        return 3;
    }

    throw new Error('wrong error AppModeCode!')
}