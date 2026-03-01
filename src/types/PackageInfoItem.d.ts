/**
 * 表示Android应用的包名信息
 */
export default interface PackageInfoItem {
    // 应用包名（必填）
    packageName: string;

    // 应用版本名称
    versionName?: string;

    // 应用版本号
    versionCode?: number;

    // 应用名称
    appLabel?: string;

    // 是否为系统应用
    isSystem?: boolean;

    // 应用UID（必填）
    uid: number;
  
  }
  