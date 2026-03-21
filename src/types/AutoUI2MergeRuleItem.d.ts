import type { AutoUI2Package, AutoUI2PackageRules } from "@/types/AutoUi2PackageRules";
import type AutoUIItem from "@/types/AutoUIItem";
import type AutoUISettingRuleItem from "@/types/AutoUISettingRuleItem";



export default interface AutoUI2MergeRuleItem {
    name: string;
    applicationName?:string;
    ruleMode: 'module' | 'custom';
    autoUI2Rule?: Omit<AutoUI2Package, "name">;
    settingRule?: Omit<AutoUISettingRuleItem, "name">;
}