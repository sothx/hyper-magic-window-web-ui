// 定义 FixedOrientationRuleItem 的类型
/**
 * 表示固定方向的规则配置项。
 */
export default interface FixedOrientationRuleItem {
  /** 应用包名（必填） */
  name: string;

  /** 是否禁用该配置，默认 false（可选） */
  disable?: boolean;

  /** 是否启用缩放，默认 false（可选） */
  isScale?: boolean;

  /** 是否显示平行窗口滑动条，默认 false（可选） */
  isShowDivider?: boolean;

  /** 配置比例（例如：窗口缩放的比例），取值范围1.01-1.99（可选） */
  ratio?: number;

  /** 当比例变化时是否重启应用，默认 false（可选） */
  relaunch?: boolean;

  /** 重启规则（当 relaunch 为 true 时生效）（可选） */
  relaunchRule?: string;

  /** 跳过兼容模式，默认 false（可选） */
  skipCompatMode?: boolean;

  /** 跳过应用自适配，默认 false（可选） */
  skipSelfAdaptive?: boolean;

  /** 应用兼容性变更配置，默认为空（可选） */
  compatChange?: string;

  /** 是否全部强制竖屏，默认 false（可选） */
  allPortrait?: boolean;

  /** 是否自适应前摄挖孔，仅折叠屏生效，默认 false（可选） */
  adaptCutout?: boolean;

  /** 是否允许嵌入竖屏模式，默认 false（可选） */
  allowEmbInPortrait?: boolean;

  /** 支持的模式列表(Hyper OS 2.0+可用),例如full,fo，支持全屏和居中布局（可选） */
  supportModes?: string;

  /** 是否支持相机预览，默认 false（可选） */
  supportCameraPreview?: boolean;

  /** 是否启用透明状态栏，默认 false（可选） */
  transparentBar?: boolean;

  /** 平行窗口应用布局优化规则（可选） */
  autoUI?: string;

  /** 是否配置默认设置(Hyper OS 2.0+可用)，例如full，默认全屏（可选） */
  defaultSettings?: boolean;

  /** 是否禁用相机预览，默认 false（可选） */
  disableCameraPreview?: boolean;

  /** 切换时是否强制终止应用，默认 false（可选） */
  forceKillWhenSwitch?: boolean;

  /** 强制竖屏显示的 Activity 列表（可选） */
  forcePortraitActivity?: string;

  /** 全屏强制竖屏显示的 Activity 列表（可选） */
  fullForcePortraitActivity?: string;

  /** 搭配 isShowDivider 使用，支持将一侧平行窗口拉伸至全屏，默认 false（可选） */
  supportFullSize?: boolean;
}
