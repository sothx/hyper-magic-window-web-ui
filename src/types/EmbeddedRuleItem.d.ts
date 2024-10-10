/**
 * 表示平行窗口的规则配置项。
 */
interface EmbeddedRuleItem {
    /** 应用包名（必填） */
    name: string;
  
    /** 支持左右滑动条，默认 false（可选） */
    isShowDivider?: boolean;
  
    /** 搭配 isShowDivider 使用，支持将一侧平行窗口拉伸至全屏，默认 false（可选） */
    supportFullSize?: boolean;
  
    /** 让应用强制全屏的配置参数，推荐 * 或者 nra:cr:rcr:nr（可选） */
    fullRule?: string;
  
    /** 禁用方向传感器，默认 false（可选） */
    disableSensor?: boolean;
  
    /** 应用缩放配置，会跟左右滑动条冲突，无法共存，推荐写 1（可选） */
    scaleMode?: number;
  
    /** 启动默认展开平行窗口左右分屏的配置（可选） */
    placeholder?: string;
  
    /** 该应用的平行窗口配置默认启用还是禁用，默认为 true（可选） */
    defaultSettings?: boolean;
  
    /** 平行窗口的应用布局优化，Hyper OS 2.0+ 生效（可选） */
    autoUiRule?: string;
  
    /** 搭配 middleRule，推荐为 true，当应用自适配平行窗口，则 middleRule 应该会自动失效（可选） */
    procCompat?: boolean;
  
    /** 控制哪些 Activity 应该居中显示（可选） */
    middleRule?: string;
  
    /** 平行窗口分屏递进配置（可选） */
    splitPairRule?: string;
  
    /** 平行窗口全屏 Activity 列表配置（可选） */
    activityRule?: string;
  
    /** 平行窗口过渡 Activity 列表配置（可选） */
    transitionRules?: string;
  
    /** 是否支持拍照预览（可选） */
    supportCameraPreview?: boolean;
  
    /** 配置平行窗口分割线的颜色，支持深色模式（可选） */
    splitLineColor?: string;
  
    /** 平行窗口默认分屏比例，默认 0.5（可选） */
    splitRatio?: number;
  
    /** 跳过应用自适配，Hyper OS 2.0+ 生效（可选） */
    skipSelfAdaptive?: boolean;
  
    /** 平行窗口显示比例发生变化时是否重载，默认 false（可选） */
    relaunch?: boolean;
  
    /** 取值”true”或 false，默认为 false。启动 activity 窗口分屏，避免右分屏出现多实例（可选） */
    clearTop?: boolean;
  
    /** 强制居中显示的 activity（可选） */
    forcePortraitActivity?: string;
  
    /** 一些有关平行窗口的额外配置（可选） */
    flags?: string;
  
    /** 主窗口可分屏显示的最小 sw 值（可选） */
    splitMinSmallestWidth?: number;
  
    /** 默认不推荐配置，主窗口可分屏显示的最小窗口宽度（可选） */
    splitMinWidth?: number;
  
    /** 若 primary container 中所有 activity 都 finish，则 secondary container 中所有 activity 也会 finish，默认为 always(0)（可选） */
    finishSecondaryWithPrimary?: number;
  
    /** 若 secondary container 中所有 activity 都 finish，则 primary container 中创建分屏的 activity 也会 finish，默认为 never(-1)（可选） */
    finishPrimaryWithSecondary?: number;
  
    /** 强制居中显示的 activity，当切换时生效（Hyper OS 2.0+）（可选） */
    forcePortraitWhenSwitch?: string;
  
    /** 当切换时强制终止应用（Hyper OS 2.0+）（可选） */
    forceKillWhenSwitch?: string;
  
    /** 是否禁用拍照预览（可选） */
    disableCameraPreview?: boolean;
  
    /** 大小兼容比例(仅安卓12有效)，用于重绘 activity，推荐不配置（可选） */
    sizecompatRatio?: number;
  
    /** 哪些 activity 需要重绘大小(仅安卓12有效)，推荐不配置（可选） */
    sizecompatRule?: string;
  
    /** 应用的布局方向，默认为随语言切换。不推荐主动配置（可选） */
    layoutDirection?: string;
  
    /** 暂时没有明确用途，搁置（可选） */
    allowRepeatPage?: boolean;
  
    /** 自适应前摄挖孔，仅折叠屏生效（可选） */
    adaptCutout?: boolean;
  
    /** 似乎是废弃参数，无效（可选） */
    useMiuiSplit?: boolean;
  
    /** Miui-Embedded 库的最小支持版本，不推荐配置（可选） */
    minSupportVersion?: string;
  }