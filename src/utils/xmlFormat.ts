// 定义 EmbeddedRuleItem 的类型
interface EmbeddedRuleItem {
    name: string; // 应用包名
    isShowDivider?: boolean; // 支持左右滑动条，默认false
    supportFullSize?: boolean; // 搭配isShowDivider使用，支持将一侧平行窗口拉伸至全屏，默认false
    fullRule?: string; // 让应用强制全屏的配置参数，推荐*或者nra:cr:rcr:nr
    disableSensor?: boolean; // 禁用方向传感器，默认false
    scaleMode?: number; // 应用缩放配置，会跟左右滑动条冲突，无法共存，推荐写1
    placeholder?: string; // 启动默认展开平行窗口左右分屏的配置
    defaultSettings?: boolean; // 该应用的平行窗口配置默认启用还是禁用，默认为true
    autoUiRule?: string; // 平行窗口的应用布局优化，Hyper OS 2.0+ 生效
    procCompat?: boolean; // 搭配middleRule，推荐为true，当应用自适配平行窗口，则middleRule应该会自动失效
    middleRule?: string; // 控制哪些Activity应该居中显示
    splitPairRule?: string; // 平行窗口分屏递进配置
    activityRule?: string; // 平行窗口全屏Activity列表配置
    transitionRules?: string; // 平行窗口过渡Activity列表配置
    supportCameraPreview?: boolean; // 是否支持拍照预览
    splitLineColor?: string; // 配置平行窗口分割线的颜色，支持深色模式
    splitRatio?: number; // 平行窗口默认分屏比例，默认0.5
    skipSelfAdaptive?: boolean; //跳过应用自适配， Hyper OS 2.0+ 生效
    relaunch?: boolean; // 平行窗口显示比例发生变化时是否重载，默认false
    clearTop?: boolean; // 取值”true”或false默认为false，true：启动activity窗口分屏，存在相同的primary container，若新建secondary container，则原secondary container中的activity会被finish掉，推荐应用配置，避免右分屏出现多实例
    forcePortraitActivity?: string; // 强制居中显示的activity
    flags?: string; // 一些有关平行窗口的额外配置
    splitMinSmallestWidth?: number; // 主窗口可分屏显示的最小sw值
    splitMinWidth?: number; // 默认不推荐配置，假设配置600，意思是宽度达到600dp门限才可以分屏主窗口可分屏显示的最小窗口宽度，建议应用使用splitMinWidth而不是splitMinSmallestWidth，确保宽度足够大才分屏
    finishSecondaryWithPrimary?: number; // 取值”never”(-1) “always”(0) “adjacent”(1)，默认为always(0)，always：若primary container中所有activity都finish，则secondary container中所有activity也会finish，不推荐应用主动配置此项。
    finishPrimaryWithSecondary?: number;// 取值”never”(-1) “always”(0) “adjacent”(1)，默认为nerver(-1)，always：若secondary container中所有activity都finish，则primary container中创建分屏的activity也会finish，不推荐应用主动配置此项。
    forcePortraitWhenSwitch?: string; // Hyper OS 2.0+ 生效，新增属性，暂不知道用途
    forceKillWhenSwitch?: string;// Hyper OS 2.0+ 生效，新增属性，暂不知道用途
    disableCameraPreview?: boolean; // 是否禁用拍照预览
    sizecompatRatio?: number; // 大小兼容比例(仅安卓12有效)，用于重绘activity，防止某些界面图标过大，配置错误会导致平行视界无效！推荐不配置
    sizecompatRule?: string;  // 哪些activity重绘大小(仅安卓12有效)，配置错误会导致平行视界无效！推荐不配置
    layoutDirection?: string; // 默认为LayoutDirection.LOCALE，随语言；ltr：LTR layout方向从左至右；rtl：RTL layout方向从右至左 不推荐应用主动配置此项
    allowRepeatPage?: boolean; // 没测出什么用途，搁置
    adaptCutout?: boolean; // 自适应前摄挖孔，仅折叠屏生效
    useMiuiSplit?: boolean; // 没任何效果，像废弃参数？
    minSupportVersion?: string; // Miui-Embedded  lib库的最小支持版本，不推荐配置
}