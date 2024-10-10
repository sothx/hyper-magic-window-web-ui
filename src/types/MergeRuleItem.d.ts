import type EmbeddedRuleItem from "@/types/EmbeddedRuleItem";
import type FixedOrientationRuleItem from "@/types/FixedOrientationRuleItem";
import type SettingRuleItem from "@/types/SettingRuleItem";

export default interface MergeRuleItem {
    name: string;
    settingMode: string;
    isSupportEmbedded: boolean;
    ruleMode: string;
    embeddedRules?: Omit<EmbeddedRuleItem, "name">;
    fixedOrientationRule?: Omit<FixedOrientationRuleItem, "name">;
    settingRule?: Omit<SettingRuleItem, "name">;
};