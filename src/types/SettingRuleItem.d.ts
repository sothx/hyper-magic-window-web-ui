/**
 * 表示设置规则的配置项。
 */
export default interface SettingRuleItem {
    /** 应用包名（必填） */
    name: string;
    
    /** 是否启用平行窗口规则，默认 false（可选） */
    embeddedEnable?: boolean;
    
    /** 是否启用固定方向规则（Hyper OS 2.0+ 有效），默认 false（可选） */
    fixedOrientationEnable?: boolean;
    
    /** 是否启用全屏规则（Hyper OS 2.0+ 有效），默认 false（可选） */
    fullScreenEnable?: boolean;
    
    /** 配置是否已被修改（Hyper OS 2.0+ 有效），默认 false（可选） */
    isModified?: boolean;
    
    /** 是否启用 16:9 比例（Hyper OS 2.0+ 有效），默认 false（可选） */
    ratio_16_9_Enable?: boolean;
    
    /** 是否启用 4:3 比例（Hyper OS 2.0+ 有效），默认 false（可选） */
    ratio_4_3_Enable?: boolean;
    
    /** 是否启用全屏比例（Hyper OS 2.0+ 有效），默认 false（可选） */
    ratio_fullScreenEnable?: boolean;
}