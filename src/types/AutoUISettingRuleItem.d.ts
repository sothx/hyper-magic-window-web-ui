/**
 * 表示应用布局优化的规则配置项。
 */
export default interface AutoUISettingRuleItem {
    /** 应用包名（必填） */
    name: string;
  
    /** 默认是否启用规则，默认 true （必填） */
    enable: boolean;
  }
  