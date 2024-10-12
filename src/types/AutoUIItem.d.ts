/**
 * 表示应用布局优化的规则配置项。
 */
export default interface AutoUIItem {
  /** 应用包名（必填） */
  name: string;

  /** 默认是否启用规则，默认 true （必填） */
  enable?: boolean;

  /** 应用布局优化配置规则 （必填） */
  activityRule?: string;

  /** 是否优化Webview页面，默认 false（可选） */
  optimizeWebView?: boolean;

  /** 跳过App配置改变，默认 false（可选） */
  skippedAppConfigChange?: boolean;

  /** 搭配activityRule使用，如果activityRule的规则配置了通配符，这里可以用于声明排除哪些Activity不应该用于"应用布局优化"（可选） */
  skippedActivityRule?: number;

}
