import type AutoUIItem from "@/types/AutoUIItem";
import type AutoUISettingRuleItem from "@/types/AutoUISettingRuleItem";



export default interface AutoUIMergeRuleItem {
    name: string;
    applicationName?:string;
    settingMode: 'UNDEFINED_VIEW_POLICY' |  'VIEW_POLICY_DEFAULT' | 'VIEW_POLICY_STRETCH' | 'VIEW_POLICY_AUTO_COLUMNS' | 'VIEW_POLICY_FLOAT' | 'CUSTOM_VIEW_POLICY'
    ruleMode: 'module' | 'custom';
    autoUIRule?: Omit<AutoUIItem, "name">;
    settingRule?: Omit<AutoUISettingRuleItem, "name">;
};