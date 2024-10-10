import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type SettingRuleItem from "@/types/SettingRuleItem";

export default interface MergeRuleItem {
    name: string;
    settingMode: 'fullScreen' | 'embedded' | 'fixedOrientation' | 'disabled';
    isSupportEmbedded: boolean;
    ruleMode: 'module' | 'custom';
    embeddedRules?: Omit<EmbeddedRuleItem, "name">;
    fixedOrientationRule?: Omit<FixedOrientationRuleItem, "name">;
    settingRule?: Omit<SettingRuleItem, "name">;
};