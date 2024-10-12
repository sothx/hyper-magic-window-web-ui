import type AutoUIItem from "@/types/AutoUIItem";
import type AutoUISettingRuleItem from "@/types/AutoUISettingRuleItem";

export default interface AutoUIMergeRuleItem {
    name: string;
    enable: boolean;
    ruleMode: 'module' | 'custom';
    autoUIRule?: Omit<AutoUIItem, "name">;
};