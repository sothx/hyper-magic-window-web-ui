import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type EmbeddedSettingRuleItem from "@/types/EmbeddedSettingRuleItem";

export default interface EmbeddedMergeRuleItem {
    name: string;
    applicationName?:string;
    settingMode: 'fullScreen' | 'embedded' | 'fixedOrientation' | 'disabled';
    isSupportEmbedded: boolean;
    isSupportFullScreen: boolean;
    isSupportSystemEmbedded: boolean;
    isSupportFixedOrientation: boolean;
    thirdPartyAppOptimize?: boolean;
    ruleMode: 'module' | 'custom';
    embeddedRules?: Omit<EmbeddedRuleItem, "name">;
    fixedOrientationRule?: Omit<FixedOrientationRuleItem, "name">;
    settingRule?: Omit<EmbeddedSettingRuleItem, "name">;
};