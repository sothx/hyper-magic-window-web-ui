/**
 * 表示窗口控制器的规则配置项。
 */
export default interface DotBlackListMergeItem {
    name: string;
    applicationName: string;
    ruleMode: 'system' | 'custom';
    status: boolean;
  }
  